"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoStack = void 0;
const cdk = require("aws-cdk-lib");
const cognito = require("aws-cdk-lib/aws-cognito");
const helpers = require("./helperScripts");
class CognitoStack extends cdk.NestedStack {
    constructor(scope, id, userPasswordAuth, userSRPAuth, cognitoIdentityProviders, samlProviders, openIdProviders) {
        super(scope, id);
        this.id = id;
        this.userPool = this.CreateUserPool(scope, id);
        this.userPoolClient = this.CreateUserPoolClient(id, this.userPool, cognitoIdentityProviders ? cognitoIdentityProviders : [cognito.UserPoolClientIdentityProvider.COGNITO], userPasswordAuth, userSRPAuth);
        this.identityPool = this.CreateIdentityPool(scope, id, false, this.userPool, this.userPoolClient);
        this.identityPool.samlProviderArns = samlProviders;
        this.identityPool.openIdConnectProviderArns = openIdProviders;
        this.authRole = this.GenerateDefaultRoles(scope, id, this.identityPool);
    }
    CreateUserPool(scope, id, props) {
        const userPool = new cognito.UserPool(scope, id + "_UserPool", props);
        return userPool;
    }
    CreateUserPoolClient(id, userPool, supportedProviders, userPasswordBool, userSrpBool) {
        const userPoolClient = userPool.addClient(id + "_Client", {
            supportedIdentityProviders: supportedProviders ? supportedProviders : [cognito.UserPoolClientIdentityProvider.COGNITO],
            authFlows: {
                userPassword: userPasswordBool ? userPasswordBool : true,
                userSrp: userSrpBool ? userSrpBool : true
            }
        });
        return userPoolClient;
    }
    CreateIdentityPool(scope, id, allowUnAuthUsers = false, cognitoUserPool, cognitoUserPoolClient, samlArns, openIdArns) {
        const identityPool = new cognito.CfnIdentityPool(scope, id + "_IdPool", {
            allowUnauthenticatedIdentities: allowUnAuthUsers,
            cognitoIdentityProviders: cognitoUserPool ? [{ clientId: cognitoUserPoolClient?.userPoolClientId, providerName: cognitoUserPool.userPoolProviderName }] : undefined,
            samlProviderArns: samlArns ? samlArns : undefined,
            openIdConnectProviderArns: openIdArns ? openIdArns : undefined
        });
        return identityPool;
    }
    AddUser(scope, id, ParameterName, UserPoolID) {
        const userEmail = helpers.cfnParamString(scope, ParameterName);
        const user = new cognito.CfnUserPoolUser(scope, id, {
            username: userEmail.valueAsString,
            userPoolId: UserPoolID,
            desiredDeliveryMediums: ['EMAIL'],
            userAttributes: [{
                    name: 'email',
                    value: userEmail.valueAsString
                }]
        });
        return userEmail.valueAsString;
    }
    GenerateDefaultRoles(scope, id, identityPool) {
        const unauthenticatedRole = new cdk.aws_iam.Role(scope, id + '_CognitoDefaultUnauthenticatedRole', {
            assumedBy: new cdk.aws_iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
                "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
                "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "unauthenticated" },
            }, "sts:AssumeRoleWithWebIdentity"),
        });
        unauthenticatedRole.addToPolicy(new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            actions: [
                "mobileanalytics:PutEvents",
                "cognito-sync:*"
            ],
            resources: ["*"],
        }));
        const authenticatedRole = new cdk.aws_iam.Role(scope, id + '_CognitoDefaultAuthenticatedRole', {
            assumedBy: new cdk.aws_iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
                "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
                "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "authenticated" },
            }, "sts:AssumeRoleWithWebIdentity"),
        });
        authenticatedRole.addToPolicy(new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            actions: [
                "mobileanalytics:PutEvents",
                "cognito-sync:*",
                "cognito-identity:*"
            ],
            resources: ["*"],
        }));
        const defaultPolicy = new cognito.CfnIdentityPoolRoleAttachment(scope, id + '_CognitoRolesAttachment', {
            identityPoolId: identityPool.ref,
            roles: {
                'unauthenticated': unauthenticatedRole.roleArn,
                'authenticated': authenticatedRole.roleArn
            }
        });
        return authenticatedRole;
    }
    ExportConfig() {
        return {
            Auth: {
                // (required) only for Federated Authentication - Amazon Cognito Identity Pool ID
                identityPoolId: this.identityPool.ref,
                // (required)- Amazon Cognito Region
                region: this.region,
                // (optional) - Amazon Cognito User Pool ID
                userPoolId: this.userPool.userPoolId,
                // (optional) - Amazon Cognito Web Client ID (26-char alphanumeric string, App client secret needs to be disabled)
                userPoolWebClientId: this.userPoolClient.userPoolClientId,
                // (optional) - Enforce user authentication prior to accessing AWS resources or not
                mandatorySignIn: true,
            }
        };
    }
}
exports.CognitoStack = CognitoStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29nbml0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvZ25pdG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLG1EQUFtRDtBQUNuRCwyQ0FBMkM7QUFFM0MsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLFdBQVc7SUFNN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxnQkFBeUIsRUFBRSxXQUFvQixFQUFFLHdCQUFtRSxFQUFFLGFBQXdCLEVBQUUsZUFBMEI7UUFDaE4sS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDOUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMxTSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNsRyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztRQUNuRCxJQUFJLENBQUMsWUFBWSxDQUFDLHlCQUF5QixHQUFHLGVBQWUsQ0FBQztRQUM5RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUQsY0FBYyxDQUFDLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTZCO1FBQ3RFLE1BQU0sUUFBUSxHQUFHLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUNyRSxPQUFPLFFBQVEsQ0FBQTtJQUNuQixDQUFDO0lBRUQsb0JBQW9CLENBQUMsRUFBVSxFQUFFLFFBQTBCLEVBQUUsa0JBQTRELEVBQUUsZ0JBQXlCLEVBQUUsV0FBb0I7UUFDdEssTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxFQUFFO1lBQ3RELDBCQUEwQixFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDO1lBQ3RILFNBQVMsRUFBRTtnQkFDUCxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUN4RCxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUk7YUFDNUM7U0FDSixDQUFDLENBQUE7UUFDRixPQUFPLGNBQWMsQ0FBQztJQUMxQixDQUFDO0lBRUQsa0JBQWtCLENBQUMsS0FBZ0IsRUFBRSxFQUFVLEVBQUUsbUJBQTRCLEtBQUssRUFBRSxlQUFrQyxFQUFFLHFCQUE4QyxFQUFFLFFBQW1CLEVBQUUsVUFBcUI7UUFDOU0sTUFBTSxZQUFZLEdBQUcsSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsU0FBUyxFQUFFO1lBQ3BFLDhCQUE4QixFQUFFLGdCQUFnQjtZQUNoRCx3QkFBd0IsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUscUJBQXFCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDbkssZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDakQseUJBQXlCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVM7U0FDakUsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUNELE9BQU8sQ0FBQyxLQUFnQixFQUFFLEVBQVUsRUFBRSxhQUFxQixFQUFFLFVBQWtCO1FBQzNFLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFO1lBQ2hELFFBQVEsRUFBRSxTQUFTLENBQUMsYUFBYTtZQUNqQyxVQUFVLEVBQUUsVUFBVTtZQUN0QixzQkFBc0IsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNqQyxjQUFjLEVBQUUsQ0FBQztvQkFDYixJQUFJLEVBQUUsT0FBTztvQkFDYixLQUFLLEVBQUUsU0FBUyxDQUFDLGFBQWE7aUJBQ2pDLENBQUM7U0FDTCxDQUFDLENBQUM7UUFDSCxPQUFPLFNBQVMsQ0FBQyxhQUFhLENBQUE7SUFDbEMsQ0FBQztJQUNELG9CQUFvQixDQUFDLEtBQWdCLEVBQUUsRUFBVSxFQUFFLFlBQXFDO1FBQ3BGLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLG9DQUFvQyxFQUFFO1lBQy9GLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsZ0NBQWdDLEVBQUU7Z0JBQzVFLGNBQWMsRUFBRSxFQUFFLG9DQUFvQyxFQUFFLFlBQVksQ0FBQyxHQUFHLEVBQUU7Z0JBQzFFLHdCQUF3QixFQUFFLEVBQUUsb0NBQW9DLEVBQUUsaUJBQWlCLEVBQUU7YUFDeEYsRUFBRSwrQkFBK0IsQ0FBQztTQUN0QyxDQUFDLENBQUM7UUFDSCxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztZQUM1RCxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSztZQUNoQyxPQUFPLEVBQUU7Z0JBQ0wsMkJBQTJCO2dCQUMzQixnQkFBZ0I7YUFDbkI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDbkIsQ0FBQyxDQUFDLENBQUM7UUFDSixNQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxrQ0FBa0MsRUFBRTtZQUMzRixTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLGdDQUFnQyxFQUFFO2dCQUM1RSxjQUFjLEVBQUUsRUFBRSxvQ0FBb0MsRUFBRSxZQUFZLENBQUMsR0FBRyxFQUFFO2dCQUMxRSx3QkFBd0IsRUFBRSxFQUFFLG9DQUFvQyxFQUFFLGVBQWUsRUFBRTthQUN0RixFQUFFLCtCQUErQixDQUFDO1NBQ3RDLENBQUMsQ0FBQztRQUNILGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO1lBQzFELE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ2hDLE9BQU8sRUFBRTtnQkFDTCwyQkFBMkI7Z0JBQzNCLGdCQUFnQjtnQkFDaEIsb0JBQW9CO2FBQ3ZCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0osTUFBTSxhQUFhLEdBQUcsSUFBSSxPQUFPLENBQUMsNkJBQTZCLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyx5QkFBeUIsRUFBRTtZQUNuRyxjQUFjLEVBQUUsWUFBWSxDQUFDLEdBQUc7WUFDaEMsS0FBSyxFQUFFO2dCQUNILGlCQUFpQixFQUFFLG1CQUFtQixDQUFDLE9BQU87Z0JBQzlDLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO2FBQzdDO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsT0FBTyxpQkFBaUIsQ0FBQztJQUM3QixDQUFDO0lBQ0QsWUFBWTtRQUNSLE9BQU87WUFDSCxJQUFJLEVBQUU7Z0JBQ0YsaUZBQWlGO2dCQUNqRixjQUFjLEVBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHO2dCQUVwQyxvQ0FBb0M7Z0JBQ3BDLE1BQU0sRUFBQyxJQUFJLENBQUMsTUFBTTtnQkFFbEIsMkNBQTJDO2dCQUMzQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVO2dCQUVwQyxrSEFBa0g7Z0JBQ2xILG1CQUFtQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCO2dCQUV6RCxtRkFBbUY7Z0JBQ25GLGVBQWUsRUFBRSxJQUFJO2FBRXhCO1NBQ0osQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQW5IRCxvQ0FtSEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgY29nbml0byBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29nbml0byc7XG5pbXBvcnQgKiBhcyBoZWxwZXJzIGZyb20gJy4vaGVscGVyU2NyaXB0cyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmV4cG9ydCBjbGFzcyBDb2duaXRvU3RhY2sgZXh0ZW5kcyBjZGsuTmVzdGVkU3RhY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgaWRlbnRpdHlQb29sOiBjb2duaXRvLkNmbklkZW50aXR5UG9vbDtcbiAgICB1c2VyUG9vbDogY29nbml0by5Vc2VyUG9vbDtcbiAgICB1c2VyUG9vbENsaWVudDogY29nbml0by5Vc2VyUG9vbENsaWVudDtcbiAgICBhdXRoUm9sZTogY2RrLmF3c19pYW0uUm9sZTtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCB1c2VyUGFzc3dvcmRBdXRoOiBib29sZWFuLCB1c2VyU1JQQXV0aDogYm9vbGVhbiwgY29nbml0b0lkZW50aXR5UHJvdmlkZXJzPzogY29nbml0by5Vc2VyUG9vbENsaWVudElkZW50aXR5UHJvdmlkZXJbXSwgc2FtbFByb3ZpZGVycz86IHN0cmluZ1tdLCBvcGVuSWRQcm92aWRlcnM/OiBzdHJpbmdbXSkge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMudXNlclBvb2wgPSB0aGlzLkNyZWF0ZVVzZXJQb29sKHNjb3BlLCBpZClcbiAgICAgICAgdGhpcy51c2VyUG9vbENsaWVudCA9IHRoaXMuQ3JlYXRlVXNlclBvb2xDbGllbnQoaWQsIHRoaXMudXNlclBvb2wsIGNvZ25pdG9JZGVudGl0eVByb3ZpZGVycyA/IGNvZ25pdG9JZGVudGl0eVByb3ZpZGVycyA6IFtjb2duaXRvLlVzZXJQb29sQ2xpZW50SWRlbnRpdHlQcm92aWRlci5DT0dOSVRPXSwgdXNlclBhc3N3b3JkQXV0aCwgdXNlclNSUEF1dGgpO1xuICAgICAgICB0aGlzLmlkZW50aXR5UG9vbCA9IHRoaXMuQ3JlYXRlSWRlbnRpdHlQb29sKHNjb3BlLCBpZCwgZmFsc2UsIHRoaXMudXNlclBvb2wsIHRoaXMudXNlclBvb2xDbGllbnQpO1xuICAgICAgICB0aGlzLmlkZW50aXR5UG9vbC5zYW1sUHJvdmlkZXJBcm5zID0gc2FtbFByb3ZpZGVycztcbiAgICAgICAgdGhpcy5pZGVudGl0eVBvb2wub3BlbklkQ29ubmVjdFByb3ZpZGVyQXJucyA9IG9wZW5JZFByb3ZpZGVycztcbiAgICAgICAgdGhpcy5hdXRoUm9sZSA9IHRoaXMuR2VuZXJhdGVEZWZhdWx0Um9sZXMoc2NvcGUsIGlkLCB0aGlzLmlkZW50aXR5UG9vbCk7XG4gICAgfVxuXG4gICAgQ3JlYXRlVXNlclBvb2woc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjb2duaXRvLlVzZXJQb29sUHJvcHMpIHtcbiAgICAgICAgY29uc3QgdXNlclBvb2wgPSBuZXcgY29nbml0by5Vc2VyUG9vbChzY29wZSwgaWQgKyBcIl9Vc2VyUG9vbFwiLCBwcm9wcylcbiAgICAgICAgcmV0dXJuIHVzZXJQb29sXG4gICAgfVxuXG4gICAgQ3JlYXRlVXNlclBvb2xDbGllbnQoaWQ6IHN0cmluZywgdXNlclBvb2w6IGNvZ25pdG8uVXNlclBvb2wsIHN1cHBvcnRlZFByb3ZpZGVyczogY29nbml0by5Vc2VyUG9vbENsaWVudElkZW50aXR5UHJvdmlkZXJbXSwgdXNlclBhc3N3b3JkQm9vbDogYm9vbGVhbiwgdXNlclNycEJvb2w6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgdXNlclBvb2xDbGllbnQgPSB1c2VyUG9vbC5hZGRDbGllbnQoaWQgKyBcIl9DbGllbnRcIiwge1xuICAgICAgICAgICAgc3VwcG9ydGVkSWRlbnRpdHlQcm92aWRlcnM6IHN1cHBvcnRlZFByb3ZpZGVycyA/IHN1cHBvcnRlZFByb3ZpZGVycyA6IFtjb2duaXRvLlVzZXJQb29sQ2xpZW50SWRlbnRpdHlQcm92aWRlci5DT0dOSVRPXSxcbiAgICAgICAgICAgIGF1dGhGbG93czoge1xuICAgICAgICAgICAgICAgIHVzZXJQYXNzd29yZDogdXNlclBhc3N3b3JkQm9vbCA/IHVzZXJQYXNzd29yZEJvb2wgOiB0cnVlLFxuICAgICAgICAgICAgICAgIHVzZXJTcnA6IHVzZXJTcnBCb29sID8gdXNlclNycEJvb2wgOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiB1c2VyUG9vbENsaWVudDtcbiAgICB9XG5cbiAgICBDcmVhdGVJZGVudGl0eVBvb2woc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgYWxsb3dVbkF1dGhVc2VyczogYm9vbGVhbiA9IGZhbHNlLCBjb2duaXRvVXNlclBvb2w/OiBjb2duaXRvLlVzZXJQb29sLCBjb2duaXRvVXNlclBvb2xDbGllbnQ/OiBjb2duaXRvLlVzZXJQb29sQ2xpZW50LCBzYW1sQXJucz86IHN0cmluZ1tdLCBvcGVuSWRBcm5zPzogc3RyaW5nW10pIHtcbiAgICAgICAgY29uc3QgaWRlbnRpdHlQb29sID0gbmV3IGNvZ25pdG8uQ2ZuSWRlbnRpdHlQb29sKHNjb3BlLCBpZCArIFwiX0lkUG9vbFwiLCB7XG4gICAgICAgICAgICBhbGxvd1VuYXV0aGVudGljYXRlZElkZW50aXRpZXM6IGFsbG93VW5BdXRoVXNlcnMsXG4gICAgICAgICAgICBjb2duaXRvSWRlbnRpdHlQcm92aWRlcnM6IGNvZ25pdG9Vc2VyUG9vbCA/IFt7IGNsaWVudElkOiBjb2duaXRvVXNlclBvb2xDbGllbnQ/LnVzZXJQb29sQ2xpZW50SWQsIHByb3ZpZGVyTmFtZTogY29nbml0b1VzZXJQb29sLnVzZXJQb29sUHJvdmlkZXJOYW1lIH1dIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgc2FtbFByb3ZpZGVyQXJuczogc2FtbEFybnMgPyBzYW1sQXJucyA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9wZW5JZENvbm5lY3RQcm92aWRlckFybnM6IG9wZW5JZEFybnMgPyBvcGVuSWRBcm5zIDogdW5kZWZpbmVkXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBpZGVudGl0eVBvb2w7XG4gICAgfVxuICAgIEFkZFVzZXIoc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgUGFyYW1ldGVyTmFtZTogc3RyaW5nLCBVc2VyUG9vbElEOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdXNlckVtYWlsID0gaGVscGVycy5jZm5QYXJhbVN0cmluZyhzY29wZSwgUGFyYW1ldGVyTmFtZSk7XG4gICAgICAgIGNvbnN0IHVzZXIgPSBuZXcgY29nbml0by5DZm5Vc2VyUG9vbFVzZXIoc2NvcGUsIGlkLCB7XG4gICAgICAgICAgICB1c2VybmFtZTogdXNlckVtYWlsLnZhbHVlQXNTdHJpbmcsXG4gICAgICAgICAgICB1c2VyUG9vbElkOiBVc2VyUG9vbElELFxuICAgICAgICAgICAgZGVzaXJlZERlbGl2ZXJ5TWVkaXVtczogWydFTUFJTCddLFxuICAgICAgICAgICAgdXNlckF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2VtYWlsJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdXNlckVtYWlsLnZhbHVlQXNTdHJpbmdcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdXNlckVtYWlsLnZhbHVlQXNTdHJpbmdcbiAgICB9XG4gICAgR2VuZXJhdGVEZWZhdWx0Um9sZXMoc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgaWRlbnRpdHlQb29sOiBjb2duaXRvLkNmbklkZW50aXR5UG9vbCkge1xuICAgICAgICBjb25zdCB1bmF1dGhlbnRpY2F0ZWRSb2xlID0gbmV3IGNkay5hd3NfaWFtLlJvbGUoc2NvcGUsIGlkICsgJ19Db2duaXRvRGVmYXVsdFVuYXV0aGVudGljYXRlZFJvbGUnLCB7XG4gICAgICAgICAgICBhc3N1bWVkQnk6IG5ldyBjZGsuYXdzX2lhbS5GZWRlcmF0ZWRQcmluY2lwYWwoJ2NvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbScsIHtcbiAgICAgICAgICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiB7IFwiY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmF1ZFwiOiBpZGVudGl0eVBvb2wucmVmIH0sXG4gICAgICAgICAgICAgICAgXCJGb3JBbnlWYWx1ZTpTdHJpbmdMaWtlXCI6IHsgXCJjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb206YW1yXCI6IFwidW5hdXRoZW50aWNhdGVkXCIgfSxcbiAgICAgICAgICAgIH0sIFwic3RzOkFzc3VtZVJvbGVXaXRoV2ViSWRlbnRpdHlcIiksXG4gICAgICAgIH0pO1xuICAgICAgICB1bmF1dGhlbnRpY2F0ZWRSb2xlLmFkZFRvUG9saWN5KG5ldyBjZGsuYXdzX2lhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgZWZmZWN0OiBjZGsuYXdzX2lhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgXCJtb2JpbGVhbmFseXRpY3M6UHV0RXZlbnRzXCIsXG4gICAgICAgICAgICAgICAgXCJjb2duaXRvLXN5bmM6KlwiXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdLFxuICAgICAgICB9KSk7XG4gICAgICAgIGNvbnN0IGF1dGhlbnRpY2F0ZWRSb2xlID0gbmV3IGNkay5hd3NfaWFtLlJvbGUoc2NvcGUsIGlkICsgJ19Db2duaXRvRGVmYXVsdEF1dGhlbnRpY2F0ZWRSb2xlJywge1xuICAgICAgICAgICAgYXNzdW1lZEJ5OiBuZXcgY2RrLmF3c19pYW0uRmVkZXJhdGVkUHJpbmNpcGFsKCdjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb20nLCB7XG4gICAgICAgICAgICAgICAgXCJTdHJpbmdFcXVhbHNcIjogeyBcImNvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbTphdWRcIjogaWRlbnRpdHlQb29sLnJlZiB9LFxuICAgICAgICAgICAgICAgIFwiRm9yQW55VmFsdWU6U3RyaW5nTGlrZVwiOiB7IFwiY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmFtclwiOiBcImF1dGhlbnRpY2F0ZWRcIiB9LFxuICAgICAgICAgICAgfSwgXCJzdHM6QXNzdW1lUm9sZVdpdGhXZWJJZGVudGl0eVwiKSxcbiAgICAgICAgfSk7XG4gICAgICAgIGF1dGhlbnRpY2F0ZWRSb2xlLmFkZFRvUG9saWN5KG5ldyBjZGsuYXdzX2lhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgZWZmZWN0OiBjZGsuYXdzX2lhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgXCJtb2JpbGVhbmFseXRpY3M6UHV0RXZlbnRzXCIsXG4gICAgICAgICAgICAgICAgXCJjb2duaXRvLXN5bmM6KlwiLFxuICAgICAgICAgICAgICAgIFwiY29nbml0by1pZGVudGl0eToqXCJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgY29uc3QgZGVmYXVsdFBvbGljeSA9IG5ldyBjb2duaXRvLkNmbklkZW50aXR5UG9vbFJvbGVBdHRhY2htZW50KHNjb3BlLCBpZCArICdfQ29nbml0b1JvbGVzQXR0YWNobWVudCcsIHtcbiAgICAgICAgICAgIGlkZW50aXR5UG9vbElkOiBpZGVudGl0eVBvb2wucmVmLFxuICAgICAgICAgICAgcm9sZXM6IHtcbiAgICAgICAgICAgICAgICAndW5hdXRoZW50aWNhdGVkJzogdW5hdXRoZW50aWNhdGVkUm9sZS5yb2xlQXJuLFxuICAgICAgICAgICAgICAgICdhdXRoZW50aWNhdGVkJzogYXV0aGVudGljYXRlZFJvbGUucm9sZUFyblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGF1dGhlbnRpY2F0ZWRSb2xlO1xuICAgIH1cbiAgICBFeHBvcnRDb25maWcoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBBdXRoOiB7XG4gICAgICAgICAgICAgICAgLy8gKHJlcXVpcmVkKSBvbmx5IGZvciBGZWRlcmF0ZWQgQXV0aGVudGljYXRpb24gLSBBbWF6b24gQ29nbml0byBJZGVudGl0eSBQb29sIElEXG4gICAgICAgICAgICAgICAgaWRlbnRpdHlQb29sSWQ6dGhpcy5pZGVudGl0eVBvb2wucmVmLFxuXG4gICAgICAgICAgICAgICAgLy8gKHJlcXVpcmVkKS0gQW1hem9uIENvZ25pdG8gUmVnaW9uXG4gICAgICAgICAgICAgICAgcmVnaW9uOnRoaXMucmVnaW9uLFxuXG4gICAgICAgICAgICAgICAgLy8gKG9wdGlvbmFsKSAtIEFtYXpvbiBDb2duaXRvIFVzZXIgUG9vbCBJRFxuICAgICAgICAgICAgICAgIHVzZXJQb29sSWQ6IHRoaXMudXNlclBvb2wudXNlclBvb2xJZCxcblxuICAgICAgICAgICAgICAgIC8vIChvcHRpb25hbCkgLSBBbWF6b24gQ29nbml0byBXZWIgQ2xpZW50IElEICgyNi1jaGFyIGFscGhhbnVtZXJpYyBzdHJpbmcsIEFwcCBjbGllbnQgc2VjcmV0IG5lZWRzIHRvIGJlIGRpc2FibGVkKVxuICAgICAgICAgICAgICAgIHVzZXJQb29sV2ViQ2xpZW50SWQ6IHRoaXMudXNlclBvb2xDbGllbnQudXNlclBvb2xDbGllbnRJZCxcblxuICAgICAgICAgICAgICAgIC8vIChvcHRpb25hbCkgLSBFbmZvcmNlIHVzZXIgYXV0aGVudGljYXRpb24gcHJpb3IgdG8gYWNjZXNzaW5nIEFXUyByZXNvdXJjZXMgb3Igbm90XG4gICAgICAgICAgICAgICAgbWFuZGF0b3J5U2lnbkluOiB0cnVlLFxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=