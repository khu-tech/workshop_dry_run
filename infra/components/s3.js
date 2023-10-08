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
        // Deployment of local folder
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzMy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx5Q0FBeUM7QUFFekMsNkNBQTRDO0FBQzVDLCtDQUE0QztBQUM1QywyQ0FBMEM7QUFHMUMsTUFBYSxRQUFTLFNBQVEsZUFBTTtJQUNoQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLGFBQTRCLEVBQUMsZUFBcUIsS0FBSztRQUM3RixNQUFNLEtBQUssR0FBQztZQUNSLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1lBQ2pELFVBQVUsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtZQUMxQyxVQUFVLEVBQUUsSUFBSTtZQUNoQixTQUFTLEVBQUUsSUFBSTtZQUNmLGFBQWEsRUFBRSxhQUFhLENBQUEsQ0FBQyxDQUFBLGFBQWEsQ0FBQSxDQUFDLENBQUEsMkJBQWEsQ0FBQyxNQUFNO1lBQy9ELGlCQUFpQixFQUFDLElBQUk7WUFDdEIsSUFBSSxFQUFFO2dCQUNGO29CQUNFLGNBQWMsRUFBRTt3QkFDZCxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUc7d0JBQ2xCLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSTt3QkFDbkIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHO3FCQUNuQjtvQkFDRCxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7b0JBQ3JCLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztpQkFDdEI7YUFDSjtTQUNKLENBQUE7UUFDRCxLQUFLLENBQUMsS0FBSyxFQUFDLEVBQUUsRUFBQyxLQUFLLENBQUMsQ0FBQTtRQUNyQixJQUFHLFlBQVksRUFBQztZQUNaLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1NBQ3hDO1FBRUQsNkJBQTZCO0lBQ2pDLENBQUM7SUFDRCxZQUFZO1FBQ1IsT0FBTztZQUNILE9BQU8sRUFBQztnQkFDSixLQUFLLEVBQUM7b0JBQ0YsTUFBTSxFQUFDLElBQUksQ0FBQyxVQUFVO2lCQUN6QjthQUNKO1NBQ0osQ0FBQTtJQUNMLENBQUM7SUFDRCw2QkFBNkI7UUFDekIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUM3QyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQ3ZCLFVBQVUsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNqQixTQUFTLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ2xELFVBQVUsRUFBRTtnQkFDUixJQUFJLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxPQUFPLEVBQUU7YUFDM0M7U0FDSixDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDSjtBQWhERCw0QkFnREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEJ1Y2tldCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSdcbmltcG9ydCAqIGFzIHMzZGVwbG95IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50JztcblxuZXhwb3J0IGNsYXNzIFMzQnVja2V0IGV4dGVuZHMgQnVja2V0e1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHJlbW92YWxQb2xpY3k/OlJlbW92YWxQb2xpY3ksYWRkVExTUG9saWN5OmJvb2xlYW49ZmFsc2UpIHtcbiAgICAgICAgY29uc3QgcHJvcHM9e1xuICAgICAgICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcbiAgICAgICAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgICAgICAgIGVuZm9yY2VTU0w6IHRydWUsXG4gICAgICAgICAgICB2ZXJzaW9uZWQ6IHRydWUsXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiByZW1vdmFsUG9saWN5P3JlbW92YWxQb2xpY3k6UmVtb3ZhbFBvbGljeS5SRVRBSU4sXG4gICAgICAgICAgICBhdXRvRGVsZXRlT2JqZWN0czp0cnVlLFxuICAgICAgICAgICAgY29yczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGFsbG93ZWRNZXRob2RzOiBbXG4gICAgICAgICAgICAgICAgICAgIHMzLkh0dHBNZXRob2RzLkdFVCxcbiAgICAgICAgICAgICAgICAgICAgczMuSHR0cE1ldGhvZHMuUE9TVCxcbiAgICAgICAgICAgICAgICAgICAgczMuSHR0cE1ldGhvZHMuUFVULFxuICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSxcbiAgICAgICAgICAgICAgICAgIGFsbG93ZWRIZWFkZXJzOiBbJyonXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHNjb3BlLGlkLHByb3BzKVxuICAgICAgICBpZihhZGRUTFNQb2xpY3kpe1xuICAgICAgICAgICAgdGhpcy5yZXF1aXJlVExTQWRkVG9SZXNvdXJjZVBvbGljeSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBEZXBsb3ltZW50IG9mIGxvY2FsIGZvbGRlclxuICAgIH1cbiAgICBFeHBvcnRDb25maWcoKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFN0b3JhZ2U6e1xuICAgICAgICAgICAgICAgIEFXU1MzOntcbiAgICAgICAgICAgICAgICAgICAgYnVja2V0OnRoaXMuYnVja2V0TmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXF1aXJlVExTQWRkVG9SZXNvdXJjZVBvbGljeSgpIHtcbiAgICAgICAgdGhpcy5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5ERU5ZLFxuICAgICAgICAgICAgcHJpbmNpcGFsczogW25ldyBpYW0uQW55UHJpbmNpcGFsKCldLFxuICAgICAgICAgICAgYWN0aW9uczogWydzMzoqJ10sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFtgJHt0aGlzLmJ1Y2tldEFybn0vKmAsIHRoaXMuYnVja2V0QXJuXSxcbiAgICAgICAgICAgIGNvbmRpdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBCb29sOiB7IFwiYXdzOlNlY3VyZVRyYW5zcG9ydFwiOiBcImZhbHNlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgIH1cbn0iXX0=