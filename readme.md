# Workshop Part Two: Implementing Secured User Sign-in, Authentication and Autherization 

## Overview:
In this portion of the workshop, we'll dive into the implementation of user sign-in and authentication for securing your API calls. Ensuring authentication is not merely a best practice, but a critical component of a robust security strategy. Without it, your API is exposed, making it vulnerable to threats like DDoS attacks.

## What You'll Learn:

- How to use the AWS Amplify SDK to simplify user registration and sign-in.
- How to configure AWS Cognito within the Amplify SDK to generate authentication tokens.
- Understanding how AWS Amplify streamlines the authentication process by offering dedicated libraries.
Components:

__AWS Amplify SDK__: A tool that offers a simplified experience for user registration and sign-in. <br> 
__AWS Cognito__: Utilized within the Amplify SDK to handle user authentication and token generation. <br>

__Files and UI Elements__:
The main logic behind our authentication experience is encapsulated within the auth.js file. Additionally, be prepared to engage with some essential UI components, which will be presented in HTML and CSS formats.

Make sure to checkout branch workshop_step_two from this github repository. 

### Step One: 
Go to the root folder, and run 
```git checkout -b workshopTwo origin/workshop_two``` to checkout the base code of workshop two. 

We will walk through the change in the code in order to implement Cognito, run the cdk deploy and then copy paste the output value of Cogino and replace the values under the amplifyconfigure.js 

#### 1.1 Make these changes before deploy 
Go to main.ts under infra/lib folder 
Uncomment these three lines:

```
const apiAuthorizer = apiGateway.AddCognitoAuthorizer(scope, "API_Authorizer", [cognitoStack.userPool])

apiGateway.AddMethodIntegration(putHighScoreLambda.MethodIntegration(), "leaderboard", "POST", apiAuthorizer);

apiGateway.AddMethodIntegration(getHighScoreLambda.MethodIntegration(), "leaderboard/{playerId}", "GET", apiAuthorizer);

```

Notice that the difference with previous API Gateway integration is that it has put a API authorizer in the code, that make sure that API Gateway request passed this authorizer. 

#### 1.2 Also, go to cognito.ts under infra/components and uncomment this code 

```json
lambdaTriggers: {
                preSignUp: preSignupFunction
            },
```

This enables the Cognito user pool to trigger a Lambda function after user enter the sign up information. You can have your own custom logic here for example like MFA, but in this workshop we just auto approve the signup. 

### Step Two: 

#### 2.1 run and then  ```cdk deploy ``` and update this Auth file below with the relevant output from your command line tool. 

```
Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    identityPoolId: '{your_own_value}',
    
    // REQUIRED - Amazon Cognito Region
    region: 'US-EAST-1',
    
    // REQUIRED- Amazon Cognito User Pool ID
    userPoolId: '{your_own_value}',

    userPoolWebClientId: '{your_own_value}',
}

```

#### 2.2 And then go to auth.js, uncomment this code:

```javascript
try {
        const { user } = await Auth.signUp({
            username,
            password,
            attributes: {
                email // If using email
            }
        });
        console.log('Sign up success!', user);
        // Handle successful sign-up logic here
        // Displaying success message 
        showMessage('Sign up successful! Please use the same username and password to sign in', 'success');
    } catch (error) {
        console.error('Error signing up:', error);
        // Handle errors or show messages to user
        showMessage('Error signing up: ' + error.message, 'error');
    }

```
#### 2.3 Also go under the signin function, and uncomment this code: 

```javascript
try {
        const user = await Auth.signIn(username, password);
        console.log('Sign in success!', user);
        // Ensuring the session is established before fetching it and redirecting.
        await new Promise(resolve => setTimeout(resolve, 1000));  // wait for a second
        const session = await Auth.currentSession();
        console.log("session is", session);
    
        window.location.href = "main.html";
    } catch (error) {
        console.error('Error signing in:', error);
    }

```

Doing this will enable you to create the both the sign up and sign in page and have it connect to the to the Coginito user pool. 

#### 2.4 After you got the auth information through sign in, you could use it by calling auth.token everywhere without having to worry about the constructing the object. 

Go to file game.js under web and uncomment these two lines: 

```javascript 
const session = await Auth.currentSession();
this.ID_TOKEN = session.getIdToken().getJwtToken();
```

#### 2.5 The previous step will give you the token you need to authenticate API Gateway call, once you have this token, go to the same game.js file and uncomment: 

```javascript
getPlayerInfo() {
		return fetch(`${API_GATEWAY_URL}/leaderboard/${this._playerId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.ID_TOKEN}`
			}
		})
}

```

Run the Application from local server

```
  npm run serve 

```

From now your API you will be authenticated, you can play around it by comment it back and try to load the page again, inspect the dev tool and you will see the error such as "No Auth"  

