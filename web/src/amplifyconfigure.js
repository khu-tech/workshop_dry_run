const amplifyConfig = {
  Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:f2f622a7-2260-4acc-a812-564747965b94',
    
    // REQUIRED - Amazon Cognito Region
    region: 'US-EAST-1',
    
    // REQUIRED- Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_FGjVpoMf9',

    userPoolWebClientId: '2rovpsbsqdjlulggqcek57rktd',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: true,
  },
  Api: {
    url: 'https://w5q8mzccr1.execute-api.us-east-1.amazonaws.com/dev'
  }
};

export default amplifyConfig;