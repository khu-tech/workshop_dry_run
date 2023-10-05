"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Bucket = void 0;
const s3 = require("aws-cdk-lib/aws-s3");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const iam = require("aws-cdk-lib/aws-iam");
class S3Bucket extends aws_s3_1.Bucket {
    constructor(scope, id, removalPolicy, addTLSPolicy = false) {
        const props = {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
            removalPolicy: removalPolicy ? removalPolicy : aws_cdk_lib_1.RemovalPolicy.RETAIN,
            autoDeleteObjects: true,
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
        };
        super(scope, id, props);
        if (addTLSPolicy) {
            this.requireTLSAddToResourcePolicy();
        }
    }
    ExportConfig() {
        return {
            Storage: {
                AWSS3: {
                    bucket: this.bucketName
                }
            }
        };
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
exports.S3Bucket = S3Bucket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx5Q0FBeUM7QUFFekMsNkNBQTRDO0FBQzVDLCtDQUE0QztBQUM1QywyQ0FBMEM7QUFDMUMsTUFBYSxRQUFTLFNBQVEsZUFBTTtJQUNoQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFDLGFBQTRCLEVBQUMsZUFBcUIsS0FBSztRQUM1RixNQUFNLEtBQUssR0FBQztZQUNSLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1lBQ2pELFVBQVUsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtZQUMxQyxVQUFVLEVBQUUsSUFBSTtZQUNoQixTQUFTLEVBQUUsSUFBSTtZQUNmLGFBQWEsRUFBRSxhQUFhLENBQUEsQ0FBQyxDQUFBLGFBQWEsQ0FBQSxDQUFDLENBQUEsMkJBQWEsQ0FBQyxNQUFNO1lBQy9ELGlCQUFpQixFQUFDLElBQUk7WUFDdEIsSUFBSSxFQUFFO2dCQUNGO29CQUNFLGNBQWMsRUFBRTt3QkFDZCxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUc7d0JBQ2xCLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSTt3QkFDbkIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHO3FCQUNuQjtvQkFDRCxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7b0JBQ3JCLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztpQkFDdEI7YUFDSjtTQUNKLENBQUE7UUFDRCxLQUFLLENBQUMsS0FBSyxFQUFDLEVBQUUsRUFBQyxLQUFLLENBQUMsQ0FBQTtRQUNyQixJQUFHLFlBQVksRUFBQztZQUNaLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztJQUNELFlBQVk7UUFDUixPQUFPO1lBQ0gsT0FBTyxFQUFDO2dCQUNKLEtBQUssRUFBQztvQkFDRixNQUFNLEVBQUMsSUFBSSxDQUFDLFVBQVU7aUJBQ3pCO2FBQ0o7U0FDSixDQUFBO0lBQ0wsQ0FBQztJQUNELDZCQUE2QjtRQUN6QixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQzdDLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUk7WUFDdkIsVUFBVSxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2pCLFNBQVMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDbEQsVUFBVSxFQUFFO2dCQUNSLElBQUksRUFBRSxFQUFFLHFCQUFxQixFQUFFLE9BQU8sRUFBRTthQUMzQztTQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBOUNELDRCQThDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBSZW1vdmFsUG9saWN5IH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQnVja2V0IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJ1xuZXhwb3J0IGNsYXNzIFMzQnVja2V0IGV4dGVuZHMgQnVja2V0e1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcscmVtb3ZhbFBvbGljeT86UmVtb3ZhbFBvbGljeSxhZGRUTFNQb2xpY3k6Ym9vbGVhbj1mYWxzZSkge1xuICAgICAgICBjb25zdCBwcm9wcz17XG4gICAgICAgICAgICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuICAgICAgICAgICAgZW5jcnlwdGlvbjogczMuQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxuICAgICAgICAgICAgZW5mb3JjZVNTTDogdHJ1ZSxcbiAgICAgICAgICAgIHZlcnNpb25lZDogdHJ1ZSxcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IHJlbW92YWxQb2xpY3k/cmVtb3ZhbFBvbGljeTpSZW1vdmFsUG9saWN5LlJFVEFJTixcbiAgICAgICAgICAgIGF1dG9EZWxldGVPYmplY3RzOnRydWUsXG4gICAgICAgICAgICBjb3JzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYWxsb3dlZE1ldGhvZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgczMuSHR0cE1ldGhvZHMuR0VULFxuICAgICAgICAgICAgICAgICAgICBzMy5IdHRwTWV0aG9kcy5QT1NULFxuICAgICAgICAgICAgICAgICAgICBzMy5IdHRwTWV0aG9kcy5QVVQsXG4gICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgYWxsb3dlZE9yaWdpbnM6IFsnKiddLFxuICAgICAgICAgICAgICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnKiddLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoc2NvcGUsaWQscHJvcHMpXG4gICAgICAgIGlmKGFkZFRMU1BvbGljeSl7XG4gICAgICAgICAgICB0aGlzLnJlcXVpcmVUTFNBZGRUb1Jlc291cmNlUG9saWN5KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgRXhwb3J0Q29uZmlnKCl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBTdG9yYWdlOntcbiAgICAgICAgICAgICAgICBBV1NTMzp7XG4gICAgICAgICAgICAgICAgICAgIGJ1Y2tldDp0aGlzLmJ1Y2tldE5hbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVxdWlyZVRMU0FkZFRvUmVzb3VyY2VQb2xpY3koKSB7XG4gICAgICAgIHRoaXMuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuREVOWSxcbiAgICAgICAgICAgIHByaW5jaXBhbHM6IFtuZXcgaWFtLkFueVByaW5jaXBhbCgpXSxcbiAgICAgICAgICAgIGFjdGlvbnM6IFsnczM6KiddLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbYCR7dGhpcy5idWNrZXRBcm59LypgLCB0aGlzLmJ1Y2tldEFybl0sXG4gICAgICAgICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgICAgICAgICAgQm9vbDogeyBcImF3czpTZWN1cmVUcmFuc3BvcnRcIjogXCJmYWxzZVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICB9XG59XG4iXX0=