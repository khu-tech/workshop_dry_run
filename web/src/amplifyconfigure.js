const amplifyConfig = {
  Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:f1531ed2-3118-43a7-a4f3-88feaae51769',
    
    // REQUIRED - Amazon Cognito Region
    region: 'US-EAST-1',
    
    // REQUIRED- Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_mDcWBpaVl',

    userPoolWebClientId: '243vfvlsvhb1bdrmffm75lsre4',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: true,
  },
  Api: {
    url: 'https://mc15bipyy2.execute-api.us-east-1.amazonaws.com/dev'
  }
};

export default amplifyConfig;