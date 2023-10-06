const amplifyConfig = {
  Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:066342bc-b010-4d0a-b5db-32dcfba97a96',
    
    // REQUIRED - Amazon Cognito Region
    region: 'US-EAST-1',
    
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_PFnBz6vVg',

    userPoolWebClientId: '4jcmhmdd6leuq5r9gt0rkpemmc',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: true,
  },
  Api: {
    url: 'https://796zj1c6jj.execute-api.us-east-1.amazonaws.com/dev'
  }
};

export default amplifyConfig;