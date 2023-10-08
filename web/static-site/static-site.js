#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticSite = void 0;
const s3 = require("aws-cdk-lib/aws-s3");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const aws_cdk_lib_1 = require("aws-cdk-lib");
/**
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 */
class StaticSite extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //   //const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: props.domainName });
        //   //const siteDomain = props.siteSubDomain + '.' + props.domainName;
        //   const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
        //     comment: `OAI for ${id}`
        //   });
        //   //new CfnOutput(this, 'Site', { value: 'https://' + siteDomain });
        //  // Content bucket
        //  const siteBucket = new s3.Bucket(this, 'SiteBucket', {
        //   //bucketName: siteDomain,
        //   publicReadAccess: false,
        //   blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        //   /**
        //    * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
        //    * the new bucket, and it will remain in your account until manually deleted. By setting the policy to
        //    * DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
        //    */
        //   removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
        //   /**
        //    * For sample purposes only, if you create an S3 bucket then populate it, stack destruction fails.  This
        //    * setting will enable full cleanup of the demo.
        //    */
        //   autoDeleteObjects: true, // NOT recommended for production code
        // });
        //   // Grant access to cloudfront
        //   siteBucket.addToResourcePolicy(new iam.PolicyStatement({
        //     actions: ['s3:GetObject'],
        //     resources: [siteBucket.arnForObjects('*')],
        //     principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
        //   }));
        //   new CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });
        //   // TLS certificate
        //  // const certificate = new acm.Certificate(this, 'SiteCertificate', {
        //   //  domainName: siteDomain,
        //   //  validation: acm.CertificateValidation.fromDns(zone),
        //  // });
        //  // new CfnOutput(this, 'Certificate', { value: certificate.certificateArn });
        //   // CloudFront distribution
        //   const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
        //     //certificate: certificate,
        //     defaultRootObject: "index.html",
        //    // domainNames: [siteDomain],
        //     minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        //     errorResponses:[
        //       {
        //         httpStatus: 403,
        //         responseHttpStatus: 403,
        //         responsePagePath: '/error.html',
        //         ttl: Duration.minutes(30),
        //       }
        //     ],
        //     defaultBehavior: {
        //       origin: new cloudfront_origins.S3Origin(siteBucket, {originAccessIdentity: cloudfrontOAI}),
        //       compress: true,
        //       allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        //       viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        //     }
        //   })
        //   new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
        //   // Route53 alias record for the CloudFront distribution
        //  // new route53.ARecord(this, 'SiteAliasRecord', {
        //  //   recordName: siteDomain,
        //  //   target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        //  //   zone
        //  // });
        const existingbucket = s3.Bucket.fromBucketName(this, "exsitingbucket", "mainstack-storagebucket19db2ff8-hdoge9e7rg6a");
        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [s3deploy.Source.asset('../dist')],
            destinationBucket: existingbucket,
        });
    }
}
exports.StaticSite = StaticSite;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljLXNpdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGF0aWMtc2l0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQ0EseUNBQXlDO0FBRXpDLDBEQUEwRDtBQUUxRCw2Q0FBd0U7QUFVeEU7Ozs7O0dBS0c7QUFDSCxNQUFhLFVBQVcsU0FBUSxtQkFBSztJQUNuQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQzFELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTFCLGtHQUFrRztRQUNsRyx1RUFBdUU7UUFDdkUsd0ZBQXdGO1FBQ3hGLCtCQUErQjtRQUMvQixRQUFRO1FBRVIsdUVBQXVFO1FBRXZFLHFCQUFxQjtRQUNyQiwwREFBMEQ7UUFDMUQsOEJBQThCO1FBQzlCLDZCQUE2QjtRQUM3Qix1REFBdUQ7UUFFdkQsUUFBUTtRQUNSLHFHQUFxRztRQUNyRywyR0FBMkc7UUFDM0csMEdBQTBHO1FBQzFHLFFBQVE7UUFDUixpRkFBaUY7UUFFakYsUUFBUTtRQUNSLDZHQUE2RztRQUM3RyxxREFBcUQ7UUFDckQsUUFBUTtRQUNSLG9FQUFvRTtRQUNwRSxNQUFNO1FBRU4sa0NBQWtDO1FBQ2xDLDZEQUE2RDtRQUM3RCxpQ0FBaUM7UUFDakMsa0RBQWtEO1FBQ2xELGtIQUFrSDtRQUNsSCxTQUFTO1FBQ1QscUVBQXFFO1FBRXJFLHVCQUF1QjtRQUN2Qix5RUFBeUU7UUFDekUsZ0NBQWdDO1FBQ2hDLDZEQUE2RDtRQUM3RCxVQUFVO1FBRVYsaUZBQWlGO1FBRWpGLCtCQUErQjtRQUMvQixpRkFBaUY7UUFDakYsa0NBQWtDO1FBQ2xDLHVDQUF1QztRQUN2QyxtQ0FBbUM7UUFDbkMsK0VBQStFO1FBQy9FLHVCQUF1QjtRQUN2QixVQUFVO1FBQ1YsMkJBQTJCO1FBQzNCLG1DQUFtQztRQUNuQywyQ0FBMkM7UUFDM0MscUNBQXFDO1FBQ3JDLFVBQVU7UUFDVixTQUFTO1FBQ1QseUJBQXlCO1FBQ3pCLG9HQUFvRztRQUNwRyx3QkFBd0I7UUFDeEIsMEVBQTBFO1FBQzFFLGlGQUFpRjtRQUNqRixRQUFRO1FBQ1IsT0FBTztRQUVQLG1GQUFtRjtRQUVuRiw0REFBNEQ7UUFDNUQscURBQXFEO1FBQ3JELGdDQUFnQztRQUNoQyw0RkFBNEY7UUFDNUYsYUFBYTtRQUNiLFVBQVU7UUFDUixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsOENBQThDLENBQUMsQ0FBQztRQUN4SCxvQ0FBb0M7UUFDcEMsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQzVELE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLGlCQUFpQixFQUFFLGNBQWM7U0FDbEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBckZELGdDQXFGQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCAqIGFzIHMzZGVwbG95IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnRfb3JpZ2lucyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zJztcbmltcG9ydCB7IENmbk91dHB1dCwgRHVyYXRpb24sIFN0YWNrLCBSZW1vdmFsUG9saWN5IH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQge1N0YWNrUHJvcHN9IGZyb20gJ2F3cy1jZGstbGliJztcblxuZXhwb3J0IGludGVyZmFjZSBTdGF0aWNTaXRlUHJvcHMge1xuICBkb21haW5OYW1lOiBzdHJpbmc7XG4gIHNpdGVTdWJEb21haW46IHN0cmluZztcbn1cblxuLyoqXG4gKiBTdGF0aWMgc2l0ZSBpbmZyYXN0cnVjdHVyZSwgd2hpY2ggZGVwbG95cyBzaXRlIGNvbnRlbnQgdG8gYW4gUzMgYnVja2V0LlxuICpcbiAqIFRoZSBzaXRlIHJlZGlyZWN0cyBmcm9tIEhUVFAgdG8gSFRUUFMsIHVzaW5nIGEgQ2xvdWRGcm9udCBkaXN0cmlidXRpb24sXG4gKiBSb3V0ZTUzIGFsaWFzIHJlY29yZCwgYW5kIEFDTSBjZXJ0aWZpY2F0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0YXRpY1NpdGUgZXh0ZW5kcyBTdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gIC8vICAgLy9jb25zdCB6b25lID0gcm91dGU1My5Ib3N0ZWRab25lLmZyb21Mb29rdXAodGhpcywgJ1pvbmUnLCB7IGRvbWFpbk5hbWU6IHByb3BzLmRvbWFpbk5hbWUgfSk7XG4gIC8vICAgLy9jb25zdCBzaXRlRG9tYWluID0gcHJvcHMuc2l0ZVN1YkRvbWFpbiArICcuJyArIHByb3BzLmRvbWFpbk5hbWU7XG4gIC8vICAgY29uc3QgY2xvdWRmcm9udE9BSSA9IG5ldyBjbG91ZGZyb250Lk9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsICdjbG91ZGZyb250LU9BSScsIHtcbiAgLy8gICAgIGNvbW1lbnQ6IGBPQUkgZm9yICR7aWR9YFxuICAvLyAgIH0pO1xuXG4gIC8vICAgLy9uZXcgQ2ZuT3V0cHV0KHRoaXMsICdTaXRlJywgeyB2YWx1ZTogJ2h0dHBzOi8vJyArIHNpdGVEb21haW4gfSk7XG5cbiAgLy8gIC8vIENvbnRlbnQgYnVja2V0XG4gIC8vICBjb25zdCBzaXRlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnU2l0ZUJ1Y2tldCcsIHtcbiAgLy8gICAvL2J1Y2tldE5hbWU6IHNpdGVEb21haW4sXG4gIC8vICAgcHVibGljUmVhZEFjY2VzczogZmFsc2UsXG4gIC8vICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcblxuICAvLyAgIC8qKlxuICAvLyAgICAqIFRoZSBkZWZhdWx0IHJlbW92YWwgcG9saWN5IGlzIFJFVEFJTiwgd2hpY2ggbWVhbnMgdGhhdCBjZGsgZGVzdHJveSB3aWxsIG5vdCBhdHRlbXB0IHRvIGRlbGV0ZVxuICAvLyAgICAqIHRoZSBuZXcgYnVja2V0LCBhbmQgaXQgd2lsbCByZW1haW4gaW4geW91ciBhY2NvdW50IHVudGlsIG1hbnVhbGx5IGRlbGV0ZWQuIEJ5IHNldHRpbmcgdGhlIHBvbGljeSB0b1xuICAvLyAgICAqIERFU1RST1ksIGNkayBkZXN0cm95IHdpbGwgYXR0ZW1wdCB0byBkZWxldGUgdGhlIGJ1Y2tldCwgYnV0IHdpbGwgZXJyb3IgaWYgdGhlIGJ1Y2tldCBpcyBub3QgZW1wdHkuXG4gIC8vICAgICovXG4gIC8vICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBOT1QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb24gY29kZVxuXG4gIC8vICAgLyoqXG4gIC8vICAgICogRm9yIHNhbXBsZSBwdXJwb3NlcyBvbmx5LCBpZiB5b3UgY3JlYXRlIGFuIFMzIGJ1Y2tldCB0aGVuIHBvcHVsYXRlIGl0LCBzdGFjayBkZXN0cnVjdGlvbiBmYWlscy4gIFRoaXNcbiAgLy8gICAgKiBzZXR0aW5nIHdpbGwgZW5hYmxlIGZ1bGwgY2xlYW51cCBvZiB0aGUgZGVtby5cbiAgLy8gICAgKi9cbiAgLy8gICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSwgLy8gTk9UIHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uIGNvZGVcbiAgLy8gfSk7XG5cbiAgLy8gICAvLyBHcmFudCBhY2Nlc3MgdG8gY2xvdWRmcm9udFxuICAvLyAgIHNpdGVCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gIC8vICAgICBhY3Rpb25zOiBbJ3MzOkdldE9iamVjdCddLFxuICAvLyAgICAgcmVzb3VyY2VzOiBbc2l0ZUJ1Y2tldC5hcm5Gb3JPYmplY3RzKCcqJyldLFxuICAvLyAgICAgcHJpbmNpcGFsczogW25ldyBpYW0uQ2Fub25pY2FsVXNlclByaW5jaXBhbChjbG91ZGZyb250T0FJLmNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eVMzQ2Fub25pY2FsVXNlcklkKV1cbiAgLy8gICB9KSk7XG4gIC8vICAgbmV3IENmbk91dHB1dCh0aGlzLCAnQnVja2V0JywgeyB2YWx1ZTogc2l0ZUJ1Y2tldC5idWNrZXROYW1lIH0pO1xuXG4gIC8vICAgLy8gVExTIGNlcnRpZmljYXRlXG4gIC8vICAvLyBjb25zdCBjZXJ0aWZpY2F0ZSA9IG5ldyBhY20uQ2VydGlmaWNhdGUodGhpcywgJ1NpdGVDZXJ0aWZpY2F0ZScsIHtcbiAgLy8gICAvLyAgZG9tYWluTmFtZTogc2l0ZURvbWFpbixcbiAgLy8gICAvLyAgdmFsaWRhdGlvbjogYWNtLkNlcnRpZmljYXRlVmFsaWRhdGlvbi5mcm9tRG5zKHpvbmUpLFxuICAvLyAgLy8gfSk7XG5cbiAgLy8gIC8vIG5ldyBDZm5PdXRwdXQodGhpcywgJ0NlcnRpZmljYXRlJywgeyB2YWx1ZTogY2VydGlmaWNhdGUuY2VydGlmaWNhdGVBcm4gfSk7XG4gICAgXG4gIC8vICAgLy8gQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cbiAgLy8gICBjb25zdCBkaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5EaXN0cmlidXRpb24odGhpcywgJ1NpdGVEaXN0cmlidXRpb24nLCB7XG4gIC8vICAgICAvL2NlcnRpZmljYXRlOiBjZXJ0aWZpY2F0ZSxcbiAgLy8gICAgIGRlZmF1bHRSb290T2JqZWN0OiBcImluZGV4Lmh0bWxcIixcbiAgLy8gICAgLy8gZG9tYWluTmFtZXM6IFtzaXRlRG9tYWluXSxcbiAgLy8gICAgIG1pbmltdW1Qcm90b2NvbFZlcnNpb246IGNsb3VkZnJvbnQuU2VjdXJpdHlQb2xpY3lQcm90b2NvbC5UTFNfVjFfMl8yMDIxLFxuICAvLyAgICAgZXJyb3JSZXNwb25zZXM6W1xuICAvLyAgICAgICB7XG4gIC8vICAgICAgICAgaHR0cFN0YXR1czogNDAzLFxuICAvLyAgICAgICAgIHJlc3BvbnNlSHR0cFN0YXR1czogNDAzLFxuICAvLyAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvZXJyb3IuaHRtbCcsXG4gIC8vICAgICAgICAgdHRsOiBEdXJhdGlvbi5taW51dGVzKDMwKSxcbiAgLy8gICAgICAgfVxuICAvLyAgICAgXSxcbiAgLy8gICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAvLyAgICAgICBvcmlnaW46IG5ldyBjbG91ZGZyb250X29yaWdpbnMuUzNPcmlnaW4oc2l0ZUJ1Y2tldCwge29yaWdpbkFjY2Vzc0lkZW50aXR5OiBjbG91ZGZyb250T0FJfSksXG4gIC8vICAgICAgIGNvbXByZXNzOiB0cnVlLFxuICAvLyAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19HRVRfSEVBRF9PUFRJT05TLFxuICAvLyAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgLy8gICAgIH1cbiAgLy8gICB9KVxuXG4gIC8vICAgbmV3IENmbk91dHB1dCh0aGlzLCAnRGlzdHJpYnV0aW9uSWQnLCB7IHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWQgfSk7XG5cbiAgLy8gICAvLyBSb3V0ZTUzIGFsaWFzIHJlY29yZCBmb3IgdGhlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uXG4gIC8vICAvLyBuZXcgcm91dGU1My5BUmVjb3JkKHRoaXMsICdTaXRlQWxpYXNSZWNvcmQnLCB7XG4gIC8vICAvLyAgIHJlY29yZE5hbWU6IHNpdGVEb21haW4sXG4gIC8vICAvLyAgIHRhcmdldDogcm91dGU1My5SZWNvcmRUYXJnZXQuZnJvbUFsaWFzKG5ldyB0YXJnZXRzLkNsb3VkRnJvbnRUYXJnZXQoZGlzdHJpYnV0aW9uKSksXG4gIC8vICAvLyAgIHpvbmVcbiAgLy8gIC8vIH0pO1xuICAgIGNvbnN0IGV4aXN0aW5nYnVja2V0ID0gczMuQnVja2V0LmZyb21CdWNrZXROYW1lKHRoaXMsIFwiZXhzaXRpbmdidWNrZXRcIiwgXCJtYWluc3RhY2stc3RvcmFnZWJ1Y2tldDE5ZGIyZmY4LWhkb2dlOWU3cmc2YVwiKTtcbiAgICAvLyBEZXBsb3kgc2l0ZSBjb250ZW50cyB0byBTMyBidWNrZXRcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnRGVwbG95V2l0aEludmFsaWRhdGlvbicsIHtcbiAgICAgIHNvdXJjZXM6IFtzM2RlcGxveS5Tb3VyY2UuYXNzZXQoJy4uL2Rpc3QnKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogZXhpc3RpbmdidWNrZXQsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==