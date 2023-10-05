"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSiteDeployment = void 0;
const cdk = require("aws-cdk-lib");
const aws_s3_deployment_1 = require("aws-cdk-lib/aws-s3-deployment");
const wafv2 = require("aws-cdk-lib/aws-wafv2");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const cloudfrontOrigins = require("aws-cdk-lib/aws-cloudfront-origins");
const s3_1 = require("./s3");
const path = require("path");
class WebSiteDeployment extends cdk.NestedStack {
    constructor(scope, id, folderPath, rootObject = 'index.html', apiGateway) {
        super(scope, id);
        this.deploymentBucket = new s3_1.S3Bucket(scope, id + "_Bucket", cdk.RemovalPolicy.DESTROY, true);
        const bucketDeployment = new aws_s3_deployment_1.BucketDeployment(scope, id + "_DeploymentBucket", {
            sources: [aws_s3_deployment_1.Source.asset(path.join(__dirname, folderPath))],
            destinationBucket: this.deploymentBucket
        });
        this.apiUrl = apiGateway.url;
        const originalAccessIdentity = new cloudfront.OriginAccessIdentity(this, id + "_OAI");
        this.deploymentBucket.grantRead(originalAccessIdentity);
        const s3Origin = new cloudfrontOrigins.S3Origin(this.deploymentBucket, {
            originAccessIdentity: originalAccessIdentity
        });
        const webacl = this.GetWebACL(scope, id);
        this.cloudfrontDistribution = this.CreateCloudFrontDistribution(scope, id + "_CFD", s3Origin, rootObject, webacl);
    }
    CreateCloudFrontDistribution(scope, id, s3Origin, filePath, webACL) {
        return new cloudfront.Distribution(scope, id, {
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
        });
    }
    AddDistributionBehavior(path, addedOrigin) {
        this.cloudfrontDistribution.addBehavior(path, addedOrigin);
    }
    GetResponseHeadersPolicy(scope, id) {
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
                    contentSecurityPolicy: `default-src 'none'; style-src 'self' 'unsafe-inline'; `
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
    GetWebACL(scope, id) {
        const wafWebACL = new wafv2.CfnWebACL(scope, id + "_WebACL", {
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
        return wafWebACL;
    }
}
exports.WebSiteDeployment = WebSiteDeployment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViU2l0ZURpc3RyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYlNpdGVEaXN0cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHFFQUF5RTtBQUV6RSwrQ0FBK0M7QUFDL0MseURBQXlEO0FBQ3pELHdFQUF3RTtBQUV4RSw2QkFBZ0M7QUFDaEMsNkJBQThCO0FBRTlCLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLFdBQVc7SUFNcEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxVQUFrQixFQUFFLGFBQXFCLFlBQVksRUFBRSxVQUF1QjtRQUN0SCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLGFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLFNBQVMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RixNQUFNLGdCQUFnQixHQUFHLElBQUksb0NBQWdCLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxtQkFBbUIsRUFBRTtZQUM3RSxPQUFPLEVBQUUsQ0FBQywwQkFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3pELGlCQUFpQixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7U0FDekMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQzdCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDeEQsTUFBTSxRQUFRLEdBQUcsSUFB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QUNySix5Q0FBeUMsSUFBSSxDQUFDLE1BQU0sNENBQTRDLElBQUksQ0FBQyxNQUFNLDBCQUEwQixJQUFJLENBQUMsTUFBTSxJQUFJOzBCQUNwSixxQkFBcUI7MEJBQ3JCLDJDQUEyQzswQkFDM0MscUJBQXFCO29CQUN6QixRQUFRLEVBQUUsSUFBSTtpQkFDZjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxxQkFBcUIsQ0FBQztJQUcvQixDQUFDO0lBQ0QsU0FBUyxDQUFDLEtBQWdCLEVBQUUsRUFBVTtRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxTQUFTLEVBQ3pEO1lBQ0UsV0FBVyxFQUFFLFVBQVU7WUFDdkIsYUFBYSxFQUFFO2dCQUNiLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxLQUFLLEVBQUUsWUFBWTtZQUNuQixnQkFBZ0IsRUFBRTtnQkFDaEIsd0JBQXdCLEVBQUUsSUFBSTtnQkFDOUIsVUFBVSxFQUFFLGNBQWM7Z0JBQzFCLHNCQUFzQixFQUFFLElBQUk7YUFDN0I7U0FDRixDQUFDLENBQUM7UUFDTCxPQUFPLFNBQVMsQ0FBQTtJQUNsQixDQUFDO0NBQ0Y7QUE1R0QsOENBNEdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEJ1Y2tldERlcGxveW1lbnQsIFNvdXJjZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgd2FmdjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLXdhZnYyJztcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZGZyb250XCI7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250T3JpZ2lucyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQtb3JpZ2luc1wiO1xuaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICcuL2hlbHBlclNjcmlwdHMnO1xuaW1wb3J0IHsgUzNCdWNrZXQgfSBmcm9tICcuL3MzJztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IHsgcmVzdEdhdGV3YXkgfSBmcm9tICcuL2FwaWdhdGV3YXknO1xuZXhwb3J0IGNsYXNzIFdlYlNpdGVEZXBsb3ltZW50IGV4dGVuZHMgY2RrLk5lc3RlZFN0YWNrIHtcbiAgZGVwbG95bWVudEJ1Y2tldDogY2RrLmF3c19zMy5CdWNrZXQ7XG4gIC8vIG9yaWdpbmFsQWNjZXNzSWRlbnRpdHk6IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHk7XG4gIGNsb3VkZnJvbnREaXN0cmlidXRpb246IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uO1xuICBhcGlVcmw6IHN0cmluZztcbiAgcmVnaW9uOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIGZvbGRlclBhdGg6IHN0cmluZywgcm9vdE9iamVjdDogc3RyaW5nID0gJ2luZGV4Lmh0bWwnLCBhcGlHYXRld2F5OiByZXN0R2F0ZXdheSkge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG4gICAgdGhpcy5kZXBsb3ltZW50QnVja2V0ID0gbmV3IFMzQnVja2V0KHNjb3BlLCBpZCArIFwiX0J1Y2tldFwiLCBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCB0cnVlKTtcbiAgICBjb25zdCBidWNrZXREZXBsb3ltZW50ID0gbmV3IEJ1Y2tldERlcGxveW1lbnQoc2NvcGUsIGlkICsgXCJfRGVwbG95bWVudEJ1Y2tldFwiLCB7XG4gICAgICBzb3VyY2VzOiBbU291cmNlLmFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIGZvbGRlclBhdGgpKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogdGhpcy5kZXBsb3ltZW50QnVja2V0XG4gICAgfSk7XG4gICAgdGhpcy5hcGlVcmwgPSBhcGlHYXRld2F5LnVybDtcbiAgICBjb25zdCBvcmlnaW5hbEFjY2Vzc0lkZW50aXR5ID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgaWQgKyBcIl9PQUlcIik7XG4gICAgdGhpcy5kZXBsb3ltZW50QnVja2V0LmdyYW50UmVhZChvcmlnaW5hbEFjY2Vzc0lkZW50aXR5KTtcbiAgICBjb25zdCBzM09yaWdpbiA9IG5ldyBjbG91ZGZyb250T3JpZ2lucy5TM09yaWdpbih0aGlzLmRlcGxveW1lbnRCdWNrZXQsIHtcbiAgICAgIG9yaWdpbkFjY2Vzc0lkZW50aXR5OiBvcmlnaW5hbEFjY2Vzc0lkZW50aXR5XG4gICAgfSk7XG4gICAgY29uc3Qgd2ViYWNsID0gdGhpcy5HZXRXZWJBQ0woc2NvcGUsIGlkKTtcbiAgICB0aGlzLmNsb3VkZnJvbnREaXN0cmlidXRpb249dGhpcy5DcmVhdGVDbG91ZEZyb250RGlzdHJpYnV0aW9uKHNjb3BlLCBpZCArIFwiX0NGRFwiLCBzM09yaWdpbiwgcm9vdE9iamVjdCwgd2ViYWNsKTtcbiAgfVxuICBDcmVhdGVDbG91ZEZyb250RGlzdHJpYnV0aW9uKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHMzT3JpZ2luOiBjbG91ZGZyb250T3JpZ2lucy5TM09yaWdpbiwgZmlsZVBhdGg6IHN0cmluZywgd2ViQUNMOiB3YWZ2Mi5DZm5XZWJBQ0wpIHtcbiAgICByZXR1cm4gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKFxuICAgICAgc2NvcGUsXG4gICAgICBpZCwge1xuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeToge1xuICAgICAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeUlkOiB0aGlzLkdldFJlc3BvbnNlSGVhZGVyc1BvbGljeShzY29wZSwgaWQpLnJlc3BvbnNlSGVhZGVyc1BvbGljeUlkXG4gICAgICAgIH0sXG4gICAgICAgIG9yaWdpbjogczNPcmlnaW4sXG4gICAgICAgIGNhY2hlUG9saWN5OiBuZXcgY2xvdWRmcm9udC5DYWNoZVBvbGljeShzY29wZSwgaWQgKyBcIl9jYWNoZXBvbGljeVwiLCB7XG4gICAgICAgICAgZGVmYXVsdFR0bDogY2RrLkR1cmF0aW9uLmhvdXJzKDEpXG4gICAgICAgIH0pLFxuICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19BTEwsXG4gICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTXG4gICAgICB9LFxuICAgICAgZXJyb3JSZXNwb25zZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGh0dHBTdGF0dXM6IDQwNCxcbiAgICAgICAgICB0dGw6IGNkay5EdXJhdGlvbi5ob3VycygwKSxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiBcIi9cIiArIGZpbGVQYXRoLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGRlZmF1bHRSb290T2JqZWN0OiBmaWxlUGF0aCxcbiAgICAgIHdlYkFjbElkOiB3ZWJBQ0wuYXR0ckFybixcbiAgICAgIG1pbmltdW1Qcm90b2NvbFZlcnNpb246IGNsb3VkZnJvbnQuU2VjdXJpdHlQb2xpY3lQcm90b2NvbC5UTFNfVjFfMl8yMDIxLCAvLyBSZXF1aXJlZCBieSBzZWN1cml0eVxuXG4gICAgfVxuICAgIClcbiAgfVxuICBBZGREaXN0cmlidXRpb25CZWhhdmlvcihwYXRoOiBzdHJpbmcsIGFkZGVkT3JpZ2luOiBjbG91ZGZyb250T3JpZ2lucy5SZXN0QXBpT3JpZ2luIHwgY2xvdWRmcm9udE9yaWdpbnMuUzNPcmlnaW4pIHtcbiAgICB0aGlzLmNsb3VkZnJvbnREaXN0cmlidXRpb24uYWRkQmVoYXZpb3IocGF0aCwgYWRkZWRPcmlnaW4pO1xuICAgIFxuICB9XG4gIEdldFJlc3BvbnNlSGVhZGVyc1BvbGljeShzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzcG9uc2VIZWFkZXJzUG9saWN5ID0gbmV3IGNsb3VkZnJvbnQuUmVzcG9uc2VIZWFkZXJzUG9saWN5KHNjb3BlLCBpZCArIFwiX1Jlc3BvbnNlSGVhZGVyc1BvbGljeVwiLCB7XG4gICAgICBzZWN1cml0eUhlYWRlcnNCZWhhdmlvcjoge1xuICAgICAgICBzdHJpY3RUcmFuc3BvcnRTZWN1cml0eToge1xuICAgICAgICAgIGFjY2Vzc0NvbnRyb2xNYXhBZ2U6IGNkay5EdXJhdGlvbi5kYXlzKDM2NSAqIDEpLFxuICAgICAgICAgIGluY2x1ZGVTdWJkb21haW5zOiB0cnVlLFxuICAgICAgICAgIG92ZXJyaWRlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB4c3NQcm90ZWN0aW9uOiB7XG4gICAgICAgICAgb3ZlcnJpZGU6IHRydWUsXG4gICAgICAgICAgcHJvdGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICBtb2RlQmxvY2s6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGZyYW1lT3B0aW9uczoge1xuICAgICAgICAgIGZyYW1lT3B0aW9uOiBjbG91ZGZyb250LkhlYWRlcnNGcmFtZU9wdGlvbi5TQU1FT1JJR0lOLFxuICAgICAgICAgIG92ZXJyaWRlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBjb250ZW50VHlwZU9wdGlvbnM6IHtcbiAgICAgICAgICBvdmVycmlkZTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudFNlY3VyaXR5UG9saWN5OiB7XG4gICAgICAgICAgY29udGVudFNlY3VyaXR5UG9saWN5OlxuICAgICAgICAgICAgYGRlZmF1bHQtc3JjICdub25lJzsgc3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZSc7IGBcbiAgICAgICAgICAgICsgYGNvbm5lY3Qtc3JjICdzZWxmJyBodHRwczovL2NvZ25pdG8taWRwLiR7dGhpcy5yZWdpb259LmFtYXpvbmF3cy5jb20vIGh0dHBzOi8vY29nbml0by1pZGVudGl0eS4ke3RoaXMucmVnaW9ufS5hbWF6b25hd3MuY29tIGh0dHBzOi8vJHt0aGlzLmFwaVVybH07IGBcbiAgICAgICAgICAgICsgYHNjcmlwdC1zcmMgJ3NlbGYnIGh0dHBzOi8vY29nbml0by1pZHAuJHt0aGlzLnJlZ2lvbn0uYW1hem9uYXdzLmNvbS8gaHR0cHM6Ly9jb2duaXRvLWlkZW50aXR5LiR7dGhpcy5yZWdpb259LmFtYXpvbmF3cy5jb20gaHR0cHM6Ly8ke3RoaXMuYXBpVXJsfTsgYFxuICAgICAgICAgICAgKyBgb2JqZWN0LXNyYyAnbm9uZSc7IGBcbiAgICAgICAgICAgICsgYGZyYW1lLWFuY2VzdG9ycyAnbm9uZSc7IGZvbnQtc3JjICdzZWxmJzsgYFxuICAgICAgICAgICAgKyBgbWFuaWZlc3Qtc3JjICdzZWxmJ2AsXG4gICAgICAgICAgb3ZlcnJpZGU6IHRydWUsXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3BvbnNlSGVhZGVyc1BvbGljeTtcblxuXG4gIH1cbiAgR2V0V2ViQUNMKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCB3YWZXZWJBQ0wgPSBuZXcgd2FmdjIuQ2ZuV2ViQUNMKHNjb3BlLCBpZCArIFwiX1dlYkFDTFwiLFxuICAgICAge1xuICAgICAgICBkZXNjcmlwdGlvbjogXCJCYXNpY1dBRlwiLFxuICAgICAgICBkZWZhdWx0QWN0aW9uOiB7XG4gICAgICAgICAgYWxsb3c6IHt9LFxuICAgICAgICB9LFxuICAgICAgICBzY29wZTogJ0NMT1VERlJPTlQnLFxuICAgICAgICB2aXNpYmlsaXR5Q29uZmlnOiB7XG4gICAgICAgICAgY2xvdWRXYXRjaE1ldHJpY3NFbmFibGVkOiB0cnVlLFxuICAgICAgICAgIG1ldHJpY05hbWU6IFwiV0FGQUNMR0xPQkFMXCIsXG4gICAgICAgICAgc2FtcGxlZFJlcXVlc3RzRW5hYmxlZDogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gd2FmV2ViQUNMXG4gIH1cbn1cblxuIl19