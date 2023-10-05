import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam'
export class S3Bucket extends Bucket{
    constructor(scope: Construct, id: string,removalPolicy?:RemovalPolicy,addTLSPolicy:boolean=false) {
        const props={
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
            removalPolicy: removalPolicy?removalPolicy:RemovalPolicy.RETAIN,
            autoDeleteObjects:true,
            cors: [
                {
                  allowedMethods: [
                    s3.HttpMethods.GET,
                    s3.HttpMethods.POST,
                    s3.HttpMethods.PUT,
                  ],
                  allowedOrigins: ['*'],
                  allowedHeaders: ['*'],
                },
            ]
        }
        super(scope,id,props)
        if(addTLSPolicy){
            this.requireTLSAddToResourcePolicy();
        }
    }
    ExportConfig(){
        return {
            Storage:{
                AWSS3:{
                    bucket:this.bucketName
                }
            }
        }
    }
    requireTLSAddToResourcePolicy() {
        this.addToResourcePolicy(new iam.PolicyStatement({
            effect: iam.Effect.DENY,
            principals: [new iam.AnyPrincipal()],
            actions: ['s3:*'],
            resources: [`${this.bucketArn}/*`, this.bucketArn],
            conditions: {
                Bool: { "aws:SecureTransport": "false" }
            },
        }));
    }
}
