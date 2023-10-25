"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoStack = void 0;
const cdk = require("aws-cdk-lib");
const cognito = require("aws-cdk-lib/aws-cognito");
const lambda_1 = require("./lambda");
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
        //const postConfirmationLambda = this.createPreSignupLambda();
        //this.userPool.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, postConfirmationLambda);
    }
    CreateUserPool(scope, id, props) {
        const preSignupLambda = new lambda_1.LambdaStack(scope, "preSignupLambda", cdk.aws_lambda.Runtime.NODEJS_18_X, '../lambdaScripts/preSignup', 'handler', cdk.Duration.minutes(5), 512, 512);
        const preSignupFunction = preSignupLambda.getLambdaFunction();
        console.log("lambda function is" + preSignupFunction);
        const userPool = new cognito.UserPool(scope, id + "_UserPool_test", {
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true,
            },
            autoVerify: {
                email: false,
                phone: false
            },
            lambdaTriggers: {
                preSignUp: preSignupFunction
            },
            // standardAttributes: {
            //     email: {
            //         required: false,
            //         mutable: true,
            //     }
            // },
            //Allowing users to recover their account via SMS without MFA and using email 
            ...props
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29nbml0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvZ25pdG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLG1EQUFtRDtBQU1uRCxxQ0FBdUM7QUFFdkMsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLFdBQVc7SUFNN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxnQkFBeUIsRUFBRSxXQUFvQixFQUFFLHdCQUFtRSxFQUFFLGFBQXdCLEVBQUUsZUFBMEI7UUFDaE4sS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDOUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMxTSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNsRyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztRQUNuRCxJQUFJLENBQUMsWUFBWSxDQUFDLHlCQUF5QixHQUFHLGVBQWUsQ0FBQztRQUM5RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENB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RTtnQkFDTCwyQkFBMkI7Z0JBQzNCLGdCQUFnQjtnQkFDaEIsb0JBQW9CO2FBQ3ZCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0osTUFBTSxhQUFhLEdBQUcsSUFBSSxPQUFPLENBQUMsNkJBQTZCLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyx5QkFBeUIsRUFBRTtZQUNuRyxjQUFjLEVBQUUsWUFBWSxDQUFDLEdBQUc7WUFDaEMsS0FBSyxFQUFFO2dCQUNILGlCQUFpQixFQUFFLG1CQUFtQixDQUFDLE9BQU87Z0JBQzlDLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPO2FBQzdDO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsT0FBTyxpQkFBaUIsQ0FBQztJQUM3QixDQUFDO0lBRUQsWUFBWTtRQUNSLE9BQU87WUFDSCxJQUFJLEVBQUU7Z0JBQ0YsaUZBQWlGO2dCQUNqRixjQUFjLEVBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHO2dCQUVwQyxvQ0FBb0M7Z0JBQ3BDLE1BQU0sRUFBQyxJQUFJLENBQUMsTUFBTTtnQkFFbEIsMkNBQTJDO2dCQUMzQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVO2dCQUVwQyxrSEFBa0g7Z0JBQ2xILG1CQUFtQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCO2dCQUV6RCxtRkFBbUY7Z0JBQ25GLGVBQWUsRUFBRSxJQUFJO2FBRXhCO1NBQ0osQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQWxJRCxvQ0FrSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgY29nbml0byBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29nbml0byc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBoZWxwZXJzIGZyb20gJy4vaGVscGVyU2NyaXB0cyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IE5vZGVqc0Z1bmN0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgTGFtYmRhU3RhY2sgfSBmcm9tICcuL2xhbWJkYSc7XG5cbmV4cG9ydCBjbGFzcyBDb2duaXRvU3RhY2sgZXh0ZW5kcyBjZGsuTmVzdGVkU3RhY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgaWRlbnRpdHlQb29sOiBjb2duaXRvLkNmbklkZW50aXR5UG9vbDtcbiAgICB1c2VyUG9vbDogY29nbml0by5Vc2VyUG9vbDtcbiAgICB1c2VyUG9vbENsaWVudDogY29nbml0by5Vc2VyUG9vbENsaWVudDtcbiAgICBhdXRoUm9sZTogY2RrLmF3c19pYW0uUm9sZTtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCB1c2VyUGFzc3dvcmRBdXRoOiBib29sZWFuLCB1c2VyU1JQQXV0aDogYm9vbGVhbiwgY29nbml0b0lkZW50aXR5UHJvdmlkZXJzPzogY29nbml0by5Vc2VyUG9vbENsaWVudElkZW50aXR5UHJvdmlkZXJbXSwgc2FtbFByb3ZpZGVycz86IHN0cmluZ1tdLCBvcGVuSWRQcm92aWRlcnM/OiBzdHJpbmdbXSwgKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy51c2VyUG9vbCA9IHRoaXMuQ3JlYXRlVXNlclBvb2woc2NvcGUsIGlkKVxuICAgICAgICB0aGlzLnVzZXJQb29sQ2xpZW50ID0gdGhpcy5DcmVhdGVVc2VyUG9vbENsaWVudChpZCwgdGhpcy51c2VyUG9vbCwgY29nbml0b0lkZW50aXR5UHJvdmlkZXJzID8gY29nbml0b0lkZW50aXR5UHJvdmlkZXJzIDogW2NvZ25pdG8uVXNlclBvb2xDbGllbnRJZGVudGl0eVByb3ZpZGVyLkNPR05JVE9dLCB1c2VyUGFzc3dvcmRBdXRoLCB1c2VyU1JQQXV0aCk7XG4gICAgICAgIHRoaXMuaWRlbnRpdHlQb29sID0gdGhpcy5DcmVhdGVJZGVudGl0eVBvb2woc2NvcGUsIGlkLCBmYWxzZSwgdGhpcy51c2VyUG9vbCwgdGhpcy51c2VyUG9vbENsaWVudCk7XG4gICAgICAgIHRoaXMuaWRlbnRpdHlQb29sLnNhbWxQcm92aWRlckFybnMgPSBzYW1sUHJvdmlkZXJzO1xuICAgICAgICB0aGlzLmlkZW50aXR5UG9vbC5vcGVuSWRDb25uZWN0UHJvdmlkZXJBcm5zID0gb3BlbklkUHJvdmlkZXJzO1xuICAgICAgICB0aGlzLmF1dGhSb2xlID0gdGhpcy5HZW5lcmF0ZURlZmF1bHRSb2xlcyhzY29wZSwgaWQsIHRoaXMuaWRlbnRpdHlQb29sKTtcbiAgICAgICAgLy9jb25zdCBwb3N0Q29uZmlybWF0aW9uTGFtYmRhID0gdGhpcy5jcmVhdGVQcmVTaWdudXBMYW1iZGEoKTtcbiAgICAgICAgLy90aGlzLnVzZXJQb29sLmFkZFRyaWdnZXIoY29nbml0by5Vc2VyUG9vbE9wZXJhdGlvbi5QUkVfU0lHTl9VUCwgcG9zdENvbmZpcm1hdGlvbkxhbWJkYSk7XG4gICAgfVxuXG4gICAgIENyZWF0ZVVzZXJQb29sKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY29nbml0by5Vc2VyUG9vbFByb3BzKSB7XG4gICAgICAgIGNvbnN0IHByZVNpZ251cExhbWJkYSA9IG5ldyBMYW1iZGFTdGFjayhzY29wZSwgXCJwcmVTaWdudXBMYW1iZGFcIiwgY2RrLmF3c19sYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCwgJy4uL2xhbWJkYVNjcmlwdHMvcHJlU2lnbnVwJywgJ2hhbmRsZXInLCBjZGsuRHVyYXRpb24ubWludXRlcyg1KSwgNTEyLCA1MTIpO1xuICAgICAgICBjb25zdCBwcmVTaWdudXBGdW5jdGlvbiA9IHByZVNpZ251cExhbWJkYS5nZXRMYW1iZGFGdW5jdGlvbigpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImxhbWJkYSBmdW5jdGlvbiBpc1wiICsgcHJlU2lnbnVwRnVuY3Rpb24pO1xuICAgICAgICBjb25zdCB1c2VyUG9vbCA9IG5ldyBjb2duaXRvLlVzZXJQb29sKHNjb3BlLCBpZCArIFwiX1VzZXJQb29sX3Rlc3RcIiwge1xuICAgICAgICAgICAgc2VsZlNpZ25VcEVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBzaWduSW5BbGlhc2VzOiB7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW1haWw6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXV0b1ZlcmlmeToge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwaG9uZTogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYW1iZGFUcmlnZ2Vyczoge1xuICAgICAgICAgICAgICAgIHByZVNpZ25VcDogcHJlU2lnbnVwRnVuY3Rpb25cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBzdGFuZGFyZEF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIC8vICAgICBlbWFpbDoge1xuICAgICAgICAgICAgLy8gICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgICAgICAvLyAgICAgICAgIG11dGFibGU6IHRydWUsXG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgICAgIC8vQWxsb3dpbmcgdXNlcnMgdG8gcmVjb3ZlciB0aGVpciBhY2NvdW50IHZpYSBTTVMgd2l0aG91dCBNRkEgYW5kIHVzaW5nIGVtYWlsIFxuICAgICAgICAgICAgLi4ucHJvcHNcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB1c2VyUG9vbDtcbiAgICB9XG5cbiAgICBDcmVhdGVVc2VyUG9vbENsaWVudChpZDogc3RyaW5nLCB1c2VyUG9vbDogY29nbml0by5Vc2VyUG9vbCwgc3VwcG9ydGVkUHJvdmlkZXJzOiBjb2duaXRvLlVzZXJQb29sQ2xpZW50SWRlbnRpdHlQcm92aWRlcltdLCB1c2VyUGFzc3dvcmRCb29sOiBib29sZWFuLCB1c2VyU3JwQm9vbDogYm9vbGVhbikge1xuICAgICAgICBjb25zdCB1c2VyUG9vbENsaWVudCA9IHVzZXJQb29sLmFkZENsaWVudChpZCArIFwiX0NsaWVudFwiLCB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRJZGVudGl0eVByb3ZpZGVyczogc3VwcG9ydGVkUHJvdmlkZXJzID8gc3VwcG9ydGVkUHJvdmlkZXJzIDogW2NvZ25pdG8uVXNlclBvb2xDbGllbnRJZGVudGl0eVByb3ZpZGVyLkNPR05JVE9dLFxuICAgICAgICAgICAgYXV0aEZsb3dzOiB7XG4gICAgICAgICAgICAgICAgdXNlclBhc3N3b3JkOiB1c2VyUGFzc3dvcmRCb29sID8gdXNlclBhc3N3b3JkQm9vbCA6IHRydWUsXG4gICAgICAgICAgICAgICAgdXNlclNycDogdXNlclNycEJvb2wgPyB1c2VyU3JwQm9vbCA6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHVzZXJQb29sQ2xpZW50O1xuICAgIH1cblxuICAgIENyZWF0ZUlkZW50aXR5UG9vbChzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBhbGxvd1VuQXV0aFVzZXJzOiBib29sZWFuID0gZmFsc2UsIGNvZ25pdG9Vc2VyUG9vbD86IGNvZ25pdG8uVXNlclBvb2wsIGNvZ25pdG9Vc2VyUG9vbENsaWVudD86IGNvZ25pdG8uVXNlclBvb2xDbGllbnQsIHNhbWxBcm5zPzogc3RyaW5nW10sIG9wZW5JZEFybnM/OiBzdHJpbmdbXSkge1xuICAgICAgICBjb25zdCBpZGVudGl0eVBvb2wgPSBuZXcgY29nbml0by5DZm5JZGVudGl0eVBvb2woc2NvcGUsIGlkICsgXCJfSWRQb29sXCIsIHtcbiAgICAgICAgICAgIGFsbG93VW5hdXRoZW50aWNhdGVkSWRlbnRpdGllczogYWxsb3dVbkF1dGhVc2VycyxcbiAgICAgICAgICAgIGNvZ25pdG9JZGVudGl0eVByb3ZpZGVyczogY29nbml0b1VzZXJQb29sID8gW3sgY2xpZW50SWQ6IGNvZ25pdG9Vc2VyUG9vbENsaWVudD8udXNlclBvb2xDbGllbnRJZCwgcHJvdmlkZXJOYW1lOiBjb2duaXRvVXNlclBvb2wudXNlclBvb2xQcm92aWRlck5hbWUgfV0gOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBzYW1sUHJvdmlkZXJBcm5zOiBzYW1sQXJucyA/IHNhbWxBcm5zIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgb3BlbklkQ29ubmVjdFByb3ZpZGVyQXJuczogb3BlbklkQXJucyA/IG9wZW5JZEFybnMgOiB1bmRlZmluZWRcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5UG9vbDtcbiAgICB9XG5cbiAgICBHZW5lcmF0ZURlZmF1bHRSb2xlcyhzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBpZGVudGl0eVBvb2w6IGNvZ25pdG8uQ2ZuSWRlbnRpdHlQb29sKSB7XG4gICAgICAgIGNvbnN0IHVuYXV0aGVudGljYXRlZFJvbGUgPSBuZXcgY2RrLmF3c19pYW0uUm9sZShzY29wZSwgaWQgKyAnX0NvZ25pdG9EZWZhdWx0VW5hdXRoZW50aWNhdGVkUm9sZScsIHtcbiAgICAgICAgICAgIGFzc3VtZWRCeTogbmV3IGNkay5hd3NfaWFtLkZlZGVyYXRlZFByaW5jaXBhbCgnY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tJywge1xuICAgICAgICAgICAgICAgIFwiU3RyaW5nRXF1YWxzXCI6IHsgXCJjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb206YXVkXCI6IGlkZW50aXR5UG9vbC5yZWYgfSxcbiAgICAgICAgICAgICAgICBcIkZvckFueVZhbHVlOlN0cmluZ0xpa2VcIjogeyBcImNvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbTphbXJcIjogXCJ1bmF1dGhlbnRpY2F0ZWRcIiB9LFxuICAgICAgICAgICAgfSwgXCJzdHM6QXNzdW1lUm9sZVdpdGhXZWJJZGVudGl0eVwiKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHVuYXV0aGVudGljYXRlZFJvbGUuYWRkVG9Qb2xpY3kobmV3IGNkay5hd3NfaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBlZmZlY3Q6IGNkay5hd3NfaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICBcIm1vYmlsZWFuYWx5dGljczpQdXRFdmVudHNcIixcbiAgICAgICAgICAgICAgICBcImNvZ25pdG8tc3luYzoqXCJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgY29uc3QgYXV0aGVudGljYXRlZFJvbGUgPSBuZXcgY2RrLmF3c19pYW0uUm9sZShzY29wZSwgaWQgKyAnX0NvZ25pdG9EZWZhdWx0QXV0aGVudGljYXRlZFJvbGUnLCB7XG4gICAgICAgICAgICBhc3N1bWVkQnk6IG5ldyBjZGsuYXdzX2lhbS5GZWRlcmF0ZWRQcmluY2lwYWwoJ2NvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbScsIHtcbiAgICAgICAgICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiB7IFwiY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmF1ZFwiOiBpZGVudGl0eVBvb2wucmVmIH0sXG4gICAgICAgICAgICAgICAgXCJGb3JBbnlWYWx1ZTpTdHJpbmdMaWtlXCI6IHsgXCJjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb206YW1yXCI6IFwiYXV0aGVudGljYXRlZFwiIH0sXG4gICAgICAgICAgICB9LCBcInN0czpBc3N1bWVSb2xlV2l0aFdlYklkZW50aXR5XCIpLFxuICAgICAgICB9KTtcbiAgICAgICAgYXV0aGVudGljYXRlZFJvbGUuYWRkVG9Qb2xpY3kobmV3IGNkay5hd3NfaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBlZmZlY3Q6IGNkay5hd3NfaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICBcIm1vYmlsZWFuYWx5dGljczpQdXRFdmVudHNcIixcbiAgICAgICAgICAgICAgICBcImNvZ25pdG8tc3luYzoqXCIsXG4gICAgICAgICAgICAgICAgXCJjb2duaXRvLWlkZW50aXR5OipcIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgICAgfSkpO1xuICAgICAgICBjb25zdCBkZWZhdWx0UG9saWN5ID0gbmV3IGNvZ25pdG8uQ2ZuSWRlbnRpdHlQb29sUm9sZUF0dGFjaG1lbnQoc2NvcGUsIGlkICsgJ19Db2duaXRvUm9sZXNBdHRhY2htZW50Jywge1xuICAgICAgICAgICAgaWRlbnRpdHlQb29sSWQ6IGlkZW50aXR5UG9vbC5yZWYsXG4gICAgICAgICAgICByb2xlczoge1xuICAgICAgICAgICAgICAgICd1bmF1dGhlbnRpY2F0ZWQnOiB1bmF1dGhlbnRpY2F0ZWRSb2xlLnJvbGVBcm4sXG4gICAgICAgICAgICAgICAgJ2F1dGhlbnRpY2F0ZWQnOiBhdXRoZW50aWNhdGVkUm9sZS5yb2xlQXJuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXV0aGVudGljYXRlZFJvbGU7XG4gICAgfVxuXG4gICAgRXhwb3J0Q29uZmlnKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgQXV0aDoge1xuICAgICAgICAgICAgICAgIC8vIChyZXF1aXJlZCkgb25seSBmb3IgRmVkZXJhdGVkIEF1dGhlbnRpY2F0aW9uIC0gQW1hem9uIENvZ25pdG8gSWRlbnRpdHkgUG9vbCBJRFxuICAgICAgICAgICAgICAgIGlkZW50aXR5UG9vbElkOnRoaXMuaWRlbnRpdHlQb29sLnJlZixcblxuICAgICAgICAgICAgICAgIC8vIChyZXF1aXJlZCktIEFtYXpvbiBDb2duaXRvIFJlZ2lvblxuICAgICAgICAgICAgICAgIHJlZ2lvbjp0aGlzLnJlZ2lvbixcblxuICAgICAgICAgICAgICAgIC8vIChvcHRpb25hbCkgLSBBbWF6b24gQ29nbml0byBVc2VyIFBvb2wgSURcbiAgICAgICAgICAgICAgICB1c2VyUG9vbElkOiB0aGlzLnVzZXJQb29sLnVzZXJQb29sSWQsXG5cbiAgICAgICAgICAgICAgICAvLyAob3B0aW9uYWwpIC0gQW1hem9uIENvZ25pdG8gV2ViIENsaWVudCBJRCAoMjYtY2hhciBhbHBoYW51bWVyaWMgc3RyaW5nLCBBcHAgY2xpZW50IHNlY3JldCBuZWVkcyB0byBiZSBkaXNhYmxlZClcbiAgICAgICAgICAgICAgICB1c2VyUG9vbFdlYkNsaWVudElkOiB0aGlzLnVzZXJQb29sQ2xpZW50LnVzZXJQb29sQ2xpZW50SWQsXG5cbiAgICAgICAgICAgICAgICAvLyAob3B0aW9uYWwpIC0gRW5mb3JjZSB1c2VyIGF1dGhlbnRpY2F0aW9uIHByaW9yIHRvIGFjY2Vzc2luZyBBV1MgcmVzb3VyY2VzIG9yIG5vdFxuICAgICAgICAgICAgICAgIG1hbmRhdG9yeVNpZ25JbjogdHJ1ZSxcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19