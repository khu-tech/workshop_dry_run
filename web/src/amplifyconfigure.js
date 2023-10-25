const amplifyConfig = {
  Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:3ac43afa-eda0-4fa2-88ac-5ff17ad45bb8',
    
    // REQUIRED - Amazon Cognito Region
    region: 'US-EAST-1',
    
    // REQUIRED- Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_KLt4SAmfY',

    userPoolWebClientId: '6futvpjsr7j46oknocr3sq0i16',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: true,
  },
  Api: {
    url: 'https://hpbhmau1re.execute-api.us-east-1.amazonaws.com/dev'
  }
};

export default amplifyConfig;