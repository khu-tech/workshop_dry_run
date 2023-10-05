import * as cdk from 'aws-cdk-lib';
import * as helpers from '../components/helperScripts';
import { S3Bucket } from '../components/s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { ConfigGenerator, LambdaStack } from '../components/lambda';
import { DDBTable } from '../components/ddb';
import { CognitoStack } from '../components/cognito';
import { restGatewayNestedStack } from '../components/apigateway';
import { WebSiteDeployment } from '../components/webSiteDistribution';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apig from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';

export class MainStack extends cdk.Stack {
  public mainStack: Main
  constructor(app: cdk.App, id: string, props?: cdk.StackProps) {
    super(app, id, props);
    const contextValues = {
    };
    this.mainStack = new Main(this, contextValues);
  }
}

export class Main {
  constructor(scope: cdk.Stack, contextValues: any) {
    //Make S3 Bucket
    const storageBucket = new S3Bucket(scope, "StorageBucket", cdk.RemovalPolicy.DESTROY);
    //Make Static Site S3 Bucket and CloudFront Distribution
    const siteBucket = new S3Bucket(scope, 'SiteBucket', cdk.RemovalPolicy.DESTROY);
    // Additional configurations based on the first snippet...

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(scope, 'cloudfront-OAI', {
      comment: `OAI for site`
    });

    const distribution = new cloudfront.Distribution(scope, 'SiteDistribution', {
      defaultRootObject: "index.html",
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(siteBucket, {originAccessIdentity: cloudfrontOAI}),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    });

    //DynamoDB Database
    const storageDatabase = new DDBTable(scope, "StorageDatabase", "bucket", "key", BillingMode.PAY_PER_REQUEST, cdk.RemovalPolicy.DESTROY);
    const leaderboardDatabase = new DDBTable(scope, "LeaderboardDatabase", "playerId", undefined, BillingMode.PAY_PER_REQUEST, cdk.RemovalPolicy.DESTROY);
    
    // Add Global Secondary Index to Leaderboard Database for Ranking queries
    leaderboardDatabase.addGlobalSecondaryIndex({
      indexName: 'rankingIndex',
      partitionKey: {
        name: 'status',
        type: ddb.AttributeType.NUMBER
      },
      sortKey: {
        name: 'score',
        type: ddb.AttributeType.NUMBER
      }
    })

    //Lambda layer
    const storageEnvs = {
      BUCKET_NAME: storageBucket.bucketName,
      TABLE_NAME: storageDatabase.tableName
    };

    const highScoreEnvs = {
      TABLE_NAME: leaderboardDatabase.tableName
    }

    //Make Nested Lambda Stack(s)
    const getAssetLambda = new LambdaStack(scope, "getAssetLambda", cdk.aws_lambda.Runtime.NODEJS_18_X, '../lambdaScripts/getAsset', 'handler', cdk.Duration.minutes(5), 512, 512, storageEnvs);
    const getHighScoreLambda = new LambdaStack(scope, "getPlayerInfoLambda", cdk.aws_lambda.Runtime.NODEJS_18_X, '../lambdaScripts/getPlayerInfo', 'handler', cdk.Duration.minutes(5), 512, 512, highScoreEnvs);
    const putHighScoreLambda = new LambdaStack(scope, "putPlayerRecordLambda", cdk.aws_lambda.Runtime.NODEJS_18_X, '../lambdaScripts/putPlayerRecord', 'handler', cdk.Duration.minutes(5), 512, 512, highScoreEnvs);

    //Grant Lambda functions read/write access to S3 bucket
    storageBucket.grantReadWrite(getAssetLambda.lambdaFunction);

    //Grant Lambda functions read/write access to DDB table
    storageDatabase.grantReadWriteData(getAssetLambda.lambdaFunction);
    leaderboardDatabase.grantReadData(getHighScoreLambda.lambdaFunction);
    leaderboardDatabase.grantReadWriteData(putHighScoreLambda.lambdaFunction);


    //Build Cognito Stack
    const cognitoStack = new CognitoStack(scope, "auth", true, true);
    const adminEmail=cognitoStack.AddUser(scope, "AdminUser", "AdminEmail", cognitoStack.userPool.userPoolId)

    //Build API Gateway
    const apiGateway = new restGatewayNestedStack(scope, "gateway", "Main Stack Gateway", "dev").gateway;
    // apiGateway.AttachWebACL(scope, "apigACL");
    const apiAuthorizer = apiGateway.AddCognitoAuthorizer(scope, "API_Authorizer", [cognitoStack.userPool])
    apiGateway.AddMethodIntegration(getAssetLambda.MethodIntegration(), "assets", "GET", apiAuthorizer);
    apiGateway.AddMethodIntegration(putHighScoreLambda.MethodIntegration(), "leaderboard", "POST", apiAuthorizer);
    apiGateway.AddMethodIntegration(getHighScoreLambda.MethodIntegration(), "leaderboard/{playerId}", "GET", apiAuthorizer);


    //Upload Website
    // const website = new WebSiteDeployment(scope, "webDeployment", '../viteCloudscape/dist', 'index.html', apiGateway)
    // const apiURL = website.AddDistributionBehavior('/apis/*', new cdk.aws_cloudfront_origins.RestApiOrigin(apiGateway, {}));
    // apiGateway.apiGatewayURL = website.cloudfrontDistribution.distributionDomainName + "/apis"
    // const configJson = {
    //   ...storageBucket.ExportConfig(),
    //   ...apiGateway.ExportConfig(),
    //   ...cognitoStack.ExportConfig()
    // }

    // const configGen=new ConfigGenerator(scope, 'ConfigGen', configJson);
    // configGen.node.addDependency([website.cloudfrontDistribution]);
    // helpers.OutputVariable(scope, "Params", configJson, "Configuration")
    helpers.OutputVariable(scope, "CLI Set User Password Command", `aws cognito-idp admin-set-user-password --user-pool-id ${cognitoStack.userPool.userPoolId} --permanent --username ${adminEmail} --password {insert password}`, "Configure admin password")
  }
}
