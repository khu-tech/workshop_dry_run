import * as cdk from 'aws-cdk-lib';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as helpers from './helperScripts';
import { S3Bucket } from './s3';
import path = require('path');
import { restGateway } from './apigateway';
export class WebSiteDeployment extends cdk.NestedStack {
  deploymentBucket: cdk.aws_s3.Bucket;
  // originalAccessIdentity: cloudfront.OriginAccessIdentity;
  cloudfrontDistribution: cloudfront.Distribution;
  apiUrl: string;
  region: string;
  constructor(scope: Construct, id: string, folderPath: string, rootObject: string = 'index.html', apiGateway: restGateway) {
    super(scope, id);
    this.deploymentBucket = new S3Bucket(scope, id + "_Bucket", cdk.RemovalPolicy.DESTROY, true);
    const bucketDeployment = new BucketDeployment(scope, id + "_DeploymentBucket", {
      sources: [Source.asset(path.join(__dirname, folderPath))],
      destinationBucket: this.deploymentBucket
    });
    this.apiUrl = apiGateway.url;
    const originalAccessIdentity = new cloudfront.OriginAccessIdentity(this, id + "_OAI");
    this.deploymentBucket.grantRead(originalAccessIdentity);
    const s3Origin = new cloudfrontOrigins.S3Origin(this.deploymentBucket, {
      originAccessIdentity: originalAccessIdentity
    });
    const webacl = this.GetWebACL(scope, id);
    this.cloudfrontDistribution=this.CreateCloudFrontDistribution(scope, id + "_CFD", s3Origin, rootObject, webacl);
  }
  CreateCloudFrontDistribution(scope: Construct, id: string, s3Origin: cloudfrontOrigins.S3Origin, filePath: string, webACL: wafv2.CfnWebACL) {
    return new cloudfront.Distribution(
      scope,
      id, {
      defaultBehavior: {
        responseHeadersPolicy: {
          responseHeadersPolicyId: this.GetResponseHeadersPolicy(scope, id).responseHeadersPolicyId
        },
        origin: s3Origin,
        cachePolicy: new cloudfront.CachePolicy(scope, id + "_cachepolicy", {
          defaultTtl: cdk.Duration.hours(1)
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      errorResponses: [
        {
          httpStatus: 404,
          ttl: cdk.Duration.hours(0),
          responseHttpStatus: 200,
          responsePagePath: "/" + filePath,
        },
      ],
      defaultRootObject: filePath,
      webAclId: webACL.attrArn,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021, // Required by security

    }
    )
  }
  AddDistributionBehavior(path: string, addedOrigin: cloudfrontOrigins.RestApiOrigin | cloudfrontOrigins.S3Origin) {
    this.cloudfrontDistribution.addBehavior(path, addedOrigin);
    
  }
  GetResponseHeadersPolicy(scope: Construct, id: string) {
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(scope, id + "_ResponseHeadersPolicy", {
      securityHeadersBehavior: {
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.days(365 * 1),
          includeSubdomains: true,
          override: true,
        },
        xssProtection: {
          override: true,
          protection: true,
          modeBlock: true,
        },
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.SAMEORIGIN,
          override: true,
        },
        contentTypeOptions: {
          override: true,
        },
        contentSecurityPolicy: {
          contentSecurityPolicy:
            `default-src 'none'; style-src 'self' 'unsafe-inline'; `
            + `connect-src 'self' https://cognito-idp.${this.region}.amazonaws.com/ https://cognito-identity.${this.region}.amazonaws.com https://${this.apiUrl}; `
            + `script-src 'self' https://cognito-idp.${this.region}.amazonaws.com/ https://cognito-identity.${this.region}.amazonaws.com https://${this.apiUrl}; `
            + `object-src 'none'; `
            + `frame-ancestors 'none'; font-src 'self'; `
            + `manifest-src 'self'`,
          override: true,
        }
      },
    });
    return responseHeadersPolicy;


  }
  GetWebACL(scope: Construct, id: string) {
    const wafWebACL = new wafv2.CfnWebACL(scope, id + "_WebACL",
      {
        description: "BasicWAF",
        defaultAction: {
          allow: {},
        },
        scope: 'CLOUDFRONT',
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "WAFACLGLOBAL",
          sampledRequestsEnabled: true
        }
      });
    return wafWebACL
  }
}

