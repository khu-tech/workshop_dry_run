"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSiteDeployment = void 0;
const cdk = require("aws-cdk-lib");
const aws_s3_deployment_1 = require("aws-cdk-lib/aws-s3-deployment");
const wafv2 = require("aws-cdk-lib/aws-wafv2");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const cloudfrontOrigins = require("aws-cdk-lib/aws-cloudfront-origins");
const path = require("path");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
class WebSiteDeployment extends cdk.NestedStack {
    constructor(scope, id, folderPath, rootObject = 'index.html', apiGateway, s3Bucket) {
        super(scope, id);
        const assetPath = path.join(__dirname, folderPath);
        new aws_s3_deployment_1.BucketDeployment(scope, id + "_DeploymentBucket", {
            sources: [s3deploy.Source.asset(assetPath)],
            destinationBucket: s3Bucket
        });
        this.apiUrl = apiGateway.url;
        const originalAccessIdentity = new cloudfront.OriginAccessIdentity(this, id + "_OAI");
        this.deploymentBucket = s3Bucket;
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
                // contentSecurityPolicy: {
                //   contentSecurityPolicy:
                //     `default-src 'none'; style-src 'self' 'unsafe-inline'; `
                //     + `connect-src 'self' https://cognito-idp.${this.region}.amazonaws.com/ https://cognito-identity.${this.region}.amazonaws.com https://${this.apiUrl}; `
                //     + `script-src 'self' https://cognito-idp.${this.region}.amazonaws.com/ https://cognito-identity.${this.region}.amazonaws.com https://${this.apiUrl}; `
                //     + `object-src 'none'; `
                //     + `frame-ancestors 'none'; font-src 'self'; `
                //     + `manifest-src 'self'`,
                //   override: true,
                // }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViU2l0ZURpc3RyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYlNpdGVEaXN0cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLHFFQUF5RTtBQUV6RSwrQ0FBK0M7QUFDL0MseURBQXlEO0FBQ3pELHdFQUF3RTtBQUd4RSw2QkFBNkI7QUFFN0IsMERBQTBEO0FBRTFELE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLFdBQVc7SUFNcEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxVQUFrQixFQUFFLGFBQXFCLFlBQVksRUFBRSxVQUF1QixFQUFFLFFBQWtCO1FBQzFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbkQsSUFBSSxvQ0FBZ0IsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLG1CQUFtQixFQUFFO1lBQ3BELE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLGlCQUFpQixFQUFFLFFBQVE7U0FDNUIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQzdCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUN4RCxNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDckUsb0JBQW9C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QixDQUFDO0lBQ0QsU0FBUyxDQUFDLEtBQWdCLEVBQUUsRUFBVTtRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxTQUFTLEVBQ3pEO1lBQ0UsV0FBVyxFQUFFLFVBQVU7WUFDdkIsYUFBYSxFQUFFO2dCQUNiLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxLQUFLLEVBQUUsWUFBWTtZQUNuQixnQkFBZ0IsRUFBRTtnQkFDaEIsd0JBQXdCLEVBQUUsSUFBSTtnQkFDOUIsVUFBVSxFQUFFLGNBQWM7Z0JBQzFCLHNCQUFzQixFQUFFLElBQUk7YUFDN0I7U0FDRixDQUFDLENBQUM7UUFDTCxPQUFPLFNBQVMsQ0FBQTtJQUNsQixDQUFDO0NBQ0Y7QUE3R0QsOENBNkdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEJ1Y2tldERlcGxveW1lbnQsIFNvdXJjZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgd2FmdjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLXdhZnYyJztcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZGZyb250XCI7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250T3JpZ2lucyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQtb3JpZ2luc1wiO1xuaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICcuL2hlbHBlclNjcmlwdHMnO1xuaW1wb3J0IHsgUzNCdWNrZXQgfSBmcm9tICcuL3MzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZXN0R2F0ZXdheSB9IGZyb20gJy4vYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBzM2RlcGxveSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtZGVwbG95bWVudCc7XG5cbmV4cG9ydCBjbGFzcyBXZWJTaXRlRGVwbG95bWVudCBleHRlbmRzIGNkay5OZXN0ZWRTdGFjayB7XG4gIGRlcGxveW1lbnRCdWNrZXQ6IGNkay5hd3NfczMuQnVja2V0O1xuICAvLyBvcmlnaW5hbEFjY2Vzc0lkZW50aXR5OiBjbG91ZGZyb250Lk9yaWdpbkFjY2Vzc0lkZW50aXR5O1xuICBjbG91ZGZyb250RGlzdHJpYnV0aW9uOiBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbjtcbiAgYXBpVXJsOiBzdHJpbmc7XG4gIHJlZ2lvbjogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBmb2xkZXJQYXRoOiBzdHJpbmcsIHJvb3RPYmplY3Q6IHN0cmluZyA9ICdpbmRleC5odG1sJywgYXBpR2F0ZXdheTogcmVzdEdhdGV3YXksIHMzQnVja2V0OiBTM0J1Y2tldCkge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG4gICAgY29uc3QgYXNzZXRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgZm9sZGVyUGF0aCk7XG4gICAgbmV3IEJ1Y2tldERlcGxveW1lbnQoc2NvcGUsIGlkICsgXCJfRGVwbG95bWVudEJ1Y2tldFwiLCB7XG4gICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KGFzc2V0UGF0aCldLFxuICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IHMzQnVja2V0XG4gICAgfSk7XG4gICAgdGhpcy5hcGlVcmwgPSBhcGlHYXRld2F5LnVybDtcbiAgICBjb25zdCBvcmlnaW5hbEFjY2Vzc0lkZW50aXR5ID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgaWQgKyBcIl9PQUlcIik7XG4gICAgdGhpcy5kZXBsb3ltZW50QnVja2V0ID0gczNCdWNrZXQ7XG4gICAgdGhpcy5kZXBsb3ltZW50QnVja2V0LmdyYW50UmVhZChvcmlnaW5hbEFjY2Vzc0lkZW50aXR5KTtcbiAgICBjb25zdCBzM09yaWdpbiA9IG5ldyBjbG91ZGZyb250T3JpZ2lucy5TM09yaWdpbih0aGlzLmRlcGxveW1lbnRCdWNrZXQsIHtcbiAgICAgIG9yaWdpbkFjY2Vzc0lkZW50aXR5OiBvcmlnaW5hbEFjY2Vzc0lkZW50aXR5XG4gICAgfSk7XG4gICAgY29uc3Qgd2ViYWNsID0gdGhpcy5HZXRXZWJBQ0woc2NvcGUsIGlkKTtcbiAgICB0aGlzLmNsb3VkZnJvbnREaXN0cmlidXRpb249dGhpcy5DcmVhdGVDbG91ZEZyb250RGlzdHJpYnV0aW9uKHNjb3BlLCBpZCArIFwiX0NGRFwiLCBzM09yaWdpbiwgcm9vdE9iamVjdCwgd2ViYWNsKTtcbiAgfVxuICBDcmVhdGVDbG91ZEZyb250RGlzdHJpYnV0aW9uKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHMzT3JpZ2luOiBjbG91ZGZyb250T3JpZ2lucy5TM09yaWdpbiwgZmlsZVBhdGg6IHN0cmluZywgd2ViQUNMOiB3YWZ2Mi5DZm5XZWJBQ0wpIHtcbiAgICByZXR1cm4gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKFxuICAgICAgc2NvcGUsXG4gICAgICBpZCwge1xuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeToge1xuICAgICAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeUlkOiB0aGlzLkdldFJlc3BvbnNlSGVhZGVyc1BvbGljeShzY29wZSwgaWQpLnJlc3BvbnNlSGVhZGVyc1BvbGljeUlkXG4gICAgICAgIH0sXG4gICAgICAgIG9yaWdpbjogczNPcmlnaW4sXG4gICAgICAgIGNhY2hlUG9saWN5OiBuZXcgY2xvdWRmcm9udC5DYWNoZVBvbGljeShzY29wZSwgaWQgKyBcIl9jYWNoZXBvbGljeVwiLCB7XG4gICAgICAgICAgZGVmYXVsdFR0bDogY2RrLkR1cmF0aW9uLmhvdXJzKDEpXG4gICAgICAgIH0pLFxuICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19BTEwsXG4gICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTXG4gICAgICB9LFxuICAgICAgZXJyb3JSZXNwb25zZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGh0dHBTdGF0dXM6IDQwNCxcbiAgICAgICAgICB0dGw6IGNkay5EdXJhdGlvbi5ob3VycygwKSxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiBcIi9cIiArIGZpbGVQYXRoLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGRlZmF1bHRSb290T2JqZWN0OiBmaWxlUGF0aCxcbiAgICAgIHdlYkFjbElkOiB3ZWJBQ0wuYXR0ckFybixcbiAgICAgIG1pbmltdW1Qcm90b2NvbFZlcnNpb246IGNsb3VkZnJvbnQuU2VjdXJpdHlQb2xpY3lQcm90b2NvbC5UTFNfVjFfMl8yMDIxLCAvLyBSZXF1aXJlZCBieSBzZWN1cml0eVxuXG4gICAgfVxuICAgIClcbiAgfVxuICBBZGREaXN0cmlidXRpb25CZWhhdmlvcihwYXRoOiBzdHJpbmcsIGFkZGVkT3JpZ2luOiBjbG91ZGZyb250T3JpZ2lucy5SZXN0QXBpT3JpZ2luIHwgY2xvdWRmcm9udE9yaWdpbnMuUzNPcmlnaW4pIHtcbiAgICB0aGlzLmNsb3VkZnJvbnREaXN0cmlidXRpb24uYWRkQmVoYXZpb3IocGF0aCwgYWRkZWRPcmlnaW4pO1xuICAgIFxuICB9XG4gIEdldFJlc3BvbnNlSGVhZGVyc1BvbGljeShzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzcG9uc2VIZWFkZXJzUG9saWN5ID0gbmV3IGNsb3VkZnJvbnQuUmVzcG9uc2VIZWFkZXJzUG9saWN5KHNjb3BlLCBpZCArIFwiX1Jlc3BvbnNlSGVhZGVyc1BvbGljeVwiLCB7XG4gICAgICBzZWN1cml0eUhlYWRlcnNCZWhhdmlvcjoge1xuICAgICAgICBzdHJpY3RUcmFuc3BvcnRTZWN1cml0eToge1xuICAgICAgICAgIGFjY2Vzc0NvbnRyb2xNYXhBZ2U6IGNkay5EdXJhdGlvbi5kYXlzKDM2NSAqIDEpLFxuICAgICAgICAgIGluY2x1ZGVTdWJkb21haW5zOiB0cnVlLFxuICAgICAgICAgIG92ZXJyaWRlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB4c3NQcm90ZWN0aW9uOiB7XG4gICAgICAgICAgb3ZlcnJpZGU6IHRydWUsXG4gICAgICAgICAgcHJvdGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICBtb2RlQmxvY2s6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGZyYW1lT3B0aW9uczoge1xuICAgICAgICAgIGZyYW1lT3B0aW9uOiBjbG91ZGZyb250LkhlYWRlcnNGcmFtZU9wdGlvbi5TQU1FT1JJR0lOLFxuICAgICAgICAgIG92ZXJyaWRlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBjb250ZW50VHlwZU9wdGlvbnM6IHtcbiAgICAgICAgICBvdmVycmlkZTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gY29udGVudFNlY3VyaXR5UG9saWN5OiB7XG4gICAgICAgIC8vICAgY29udGVudFNlY3VyaXR5UG9saWN5OlxuICAgICAgICAvLyAgICAgYGRlZmF1bHQtc3JjICdub25lJzsgc3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZSc7IGBcbiAgICAgICAgLy8gICAgICsgYGNvbm5lY3Qtc3JjICdzZWxmJyBodHRwczovL2NvZ25pdG8taWRwLiR7dGhpcy5yZWdpb259LmFtYXpvbmF3cy5jb20vIGh0dHBzOi8vY29nbml0by1pZGVudGl0eS4ke3RoaXMucmVnaW9ufS5hbWF6b25hd3MuY29tIGh0dHBzOi8vJHt0aGlzLmFwaVVybH07IGBcbiAgICAgICAgLy8gICAgICsgYHNjcmlwdC1zcmMgJ3NlbGYnIGh0dHBzOi8vY29nbml0by1pZHAuJHt0aGlzLnJlZ2lvbn0uYW1hem9uYXdzLmNvbS8gaHR0cHM6Ly9jb2duaXRvLWlkZW50aXR5LiR7dGhpcy5yZWdpb259LmFtYXpvbmF3cy5jb20gaHR0cHM6Ly8ke3RoaXMuYXBpVXJsfTsgYFxuICAgICAgICAvLyAgICAgKyBgb2JqZWN0LXNyYyAnbm9uZSc7IGBcbiAgICAgICAgLy8gICAgICsgYGZyYW1lLWFuY2VzdG9ycyAnbm9uZSc7IGZvbnQtc3JjICdzZWxmJzsgYFxuICAgICAgICAvLyAgICAgKyBgbWFuaWZlc3Qtc3JjICdzZWxmJ2AsXG4gICAgICAgIC8vICAgb3ZlcnJpZGU6IHRydWUsXG4gICAgICAgIC8vIH1cbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3BvbnNlSGVhZGVyc1BvbGljeTtcblxuXG4gIH1cbiAgR2V0V2ViQUNMKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCB3YWZXZWJBQ0wgPSBuZXcgd2FmdjIuQ2ZuV2ViQUNMKHNjb3BlLCBpZCArIFwiX1dlYkFDTFwiLFxuICAgICAge1xuICAgICAgICBkZXNjcmlwdGlvbjogXCJCYXNpY1dBRlwiLFxuICAgICAgICBkZWZhdWx0QWN0aW9uOiB7XG4gICAgICAgICAgYWxsb3c6IHt9LFxuICAgICAgICB9LFxuICAgICAgICBzY29wZTogJ0NMT1VERlJPTlQnLFxuICAgICAgICB2aXNpYmlsaXR5Q29uZmlnOiB7XG4gICAgICAgICAgY2xvdWRXYXRjaE1ldHJpY3NFbmFibGVkOiB0cnVlLFxuICAgICAgICAgIG1ldHJpY05hbWU6IFwiV0FGQUNMR0xPQkFMXCIsXG4gICAgICAgICAgc2FtcGxlZFJlcXVlc3RzRW5hYmxlZDogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gd2FmV2ViQUNMXG4gIH1cbn1cblxuIl19