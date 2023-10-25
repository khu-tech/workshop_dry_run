Integration of Backend API into Your Game and Hosting with CloudFront & S3
This guide will walk you through the process of integrating your backend API into your game, running, building, and then hosting your game on CloudFront and S3.

1. Integrating Backend API:
Ensure you have your backend API URL ready.
Navigate to the web/src folder.
Open the amplifyconfigure.js file.
replace 
```
url: 'https://krz9k462q5.execute-api.us-east-1.amazonaws.com/dev/'
```
with the API Gateway URL you've obtained from the console.

2. Testing Locally:
In your terminal, run:
```npm run serve ```
This will start your game locally with the integrated backend. Access the game at localhost:8081.
Install the WebXR plugin and open the developer tools. Select 'Inspect'.
Use the handles of the simulated XR device to interact. Flapping up and down three times will initiate the game. In the 'Network' tab of the Chrome developer tools, you can verify if the API call was successful.

3. Preparing for Production:
Create a production build using:
```npm run build```
This build is ready for upload to the specified S3 bucket.

4. Hosting the Game:
Manual Upload to S3:

Refer to the screenshot below for guidance on how to manually upload to the S3 bucket.
Using AWS CLI for Upload:

Navigate to web/dist in your terminal.
Run the following command to upload your game:
```aws s3 cp . s3://<bucket-root> --recursive```

After uploading, visit the provided CloudFront URL to see your game in action. Remember, using the 'Network' tab in your developer tools will help verify the correct API Gateway endpoint and detect any potential CORS issues.