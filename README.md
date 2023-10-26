# Workshop Part One:
Welcome to the step-by-step guide to building your game backend using AWS services like API Gateway, Lambda, and DynamoDB. Follow the steps below to set up the backend infrastructure efficiently.

## Prerequisites
Ensure that you have the AWS CDK installed and configured on your machine. If not, refer to the AWS CDK Getting Started Guide.

git checkout -b workshop_step_one

### Step 1: Clean Up CDK Resources
Ensure a clean slate by removing any previously compiled CDK resources, using the following commands:
```
rm -rf cdk.out 
rm -rf dist
```

### Step 2: Run npm install in two folders under workshop folder
infra and web 


### Step 3: Set Up Lambda Functions


#### 3.1 Create Lambda Functions
Navigate to main.ts within the lib directory. Uncomment the following lines to declare two Lambda functions:

```javascript
const getHighScoreLambda = new LambdaStack(scope, "getPlayerInfoLambda", cdk.aws_lambda.Runtime.NODEJS_18_X, '../lambdaScripts/getPlayerInfo', 'handler', cdk.Duration.minutes(5), 512, 512, highScoreEnvs); const putHighScoreLambda = new LambdaStack(scope, "putPlayerRecordLambda", cdk.aws_lambda.Runtime.NODEJS_18_X, '../lambdaScripts/putPlayerRecord', 'handler', cdk.Duration.minutes(5), 512, 512, highScoreEnvs);
```
These lines create two Lambda functions:

getPlayerInfoLambda: Retrieves player information.
putPlayerRecordLambda: Updates player information by setting player ID and score.

The actual Lambda function code is located within "../lambdaScripts/getPlayerInfo" and "../lambdaScripts/putPlayerRecord" respectively.


#### 3.2 Implement Lambda Functions Code
Navigate to the lambdaScripts directory.

In putPlayerRecord.js, uncomment the code block. This code enables the Lambda function to interact with DynamoDB, allowing it to create or update player information.

```
export const handler = async (event, context) => {
    const body = JSON.parse(event.body);
    try {
        const params = {
            TableName: leaderboardTable,
            Item: {
                playerId: { S: body.playerId },
                score: { N: `${body.score}` },
                status: { N: "1" }
            }
        };
        await dbClient.send(new PutItemCommand(params));
    } catch (err) {
        return JsonResponse(500, "Error storing high score.");
    }

    return JsonResponse(200, "High score stored.");
}

```

In getPlayerInfo.js, uncomment the code block. This code enables the Lambda function to retrieve player score information and ranking from DynamoDB.

```
export const handler = async (event, context) => {
    try {
        const playerId = event.pathParameters.playerId.toLowerCase();

        const recordScore = await getPlayerRecordScore(playerId);

        const worldData = await getWorldRecordAndRanking(playerId);

        const response = {
            "recordScore": recordScore,
            "worldRecord": worldData.worldRecord,
            "ranking": worldData.ranking
        };

        return JsonResponse(200, response);
    } catch (err) {
        console.log(err);
        return JsonResponse(500, "Error getting player info.");
    }
}

```


### Step 4: Implement API Gateway
After setting up the Lambda functions, proceed to establish the API Gateway, enabling the Web Client to invoke the API directly.

Return to main.ts within the lib directory, and uncomment the API Gateway creation block. These lines instantiate two API endpoints:

One for creating/updating player information.
One for retrieving player information.
Each API is integrated with the respective Lambda functions crafted earlier.

Uncomment these lines in main.ts 

```
const apiGateway = new restGatewayNestedStack(scope, "gateway", "Main Stack Gateway", "dev").gateway;
const apiAuthorizer = apiGateway.AddCognitoAuthorizer(scope, "API_Authorizer", [cognitoStack.userPool])
apiGateway.AddMethodIntegration(getAssetLambda.MethodIntegration(), "assets", "GET", apiAuthorizer);
apiGateway.AddMethodIntegration(putHighScoreLambda.MethodIntegration(), "leaderboard", "POST");
apiGateway.AddMethodIntegration(getHighScoreLambda.MethodIntegration(), "leaderboard/{playerId}", "GET");

```


### Step 5: Deploy with AWS CDK
5.1 Execute the Deployment
Deploy the constructed AWS infrastructure by executing the following command in your terminal:

```
cdk deploy

```
Wait for the deployment to finish and take note of the API Gateway endpoint URL from the output.

### Step 6: Test the APIs

#### 6.1 Storing a High Score
Utilize cURL to test the POST API endpoint. Ensure to replace the endpoint URL and payload as per your requirements.

```
curl -X POST \ https://ejkjxfylk3.execute-api.us-east-1.amazonaws.com/dev/leaderboard \ -H "Content-Type: application/json" \ -d '{"playerId": "PlayerId123", "score": "123"}'

```
Upon successful execution, you should observe a success message: "High Score stored." Validate the data insertion by navigating to the DynamoDB table via the AWS Console.


#### 6.2 Retrieve Player Information
Test the GET API endpoint to retrieve player information, ensuring to substitute the endpoint URL and PlayerId accordingly.

```
curl -X GET \ https://ejkjxfylk3.execute-api.us-east-1.amazonaws.com/dev/leaderboard/PlayerId123 \ -H "Content-Type: application/json"

```
A successful query will return player information in the following format: {"recordScore":0,"worldRecord":123,"ranking":1}.

🎉 Congratulations! 🎉

You've learned how to build backend APIs using AWS services and will integrate them into your game code in the subsequent stages.


# Part Two:

Integration of Backend API into Your Game and Hosting with CloudFront & S3
This guide will walk you through the process of integrating your backend API into your game, running, building, and then hosting your game on CloudFront and S3.

## 1. Integrating Backend API:
Ensure you have your backend API URL ready.
Navigate to the web/src folder.
Open the amplifyconfigure.js file.
replace 
```
url: 'https://krz9k462q5.execute-api.us-east-1.amazonaws.com/dev/'
```
with the API Gateway URL you've obtained from the console.


## 2. Testing Locally:
In your terminal, run:

```
npm run serve 

```
This will start your game locally with the integrated backend. Access the game at localhost:8081.
Install the WebXR plugin and open the developer tools. Select 'Inspect'.
Use the handles of the simulated XR device to interact. Flapping up and down three times will initiate the game. In the 'Network' tab of the Chrome developer tools, you can verify if the API call was successful.


## 3. Preparing for Production:
Create a production build using:

```
npm run build

```
This build is ready for upload to the specified S3 bucket.


## 4. Hosting the Game:
Manual Upload to S3:

Refer to the screenshot below for guidance on how to manually upload to the S3 bucket.
Using AWS CLI for Upload:

Navigate to web/dist in your terminal.
Run the following command to upload your game:

```
aws s3 cp . s3://<bucket-root> --recursive

```

After uploading, visit the provided CloudFront URL to see your game in action. Remember, using the 'Network' tab in your developer tools will help verify the correct API Gateway endpoint and detect any potential CORS issues.
