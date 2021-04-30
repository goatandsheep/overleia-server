const CognitoExpress = require('cognito-express');

const cognito = new CognitoExpress({
  region: process.env.AWS_REGION,
  cognitoUserPoolId: process.env.COGNITO_POOL_ID,
  tokenUse: 'access', // Possible Values: access | id
  tokenExpiration: 3600000, // Up to default expiration of 1 hour (3600000 ms)
});

const authenticate = function authenticate(req, res, next) {
  let accessTokenFromClient = req.headers.authorization;
  // https://stackoverflow.com/questions/45116793/how-to-get-cognito-identity-id-in-backend-that-is-requested-by-aws-api-gateway
  const identityId = req.headers['x-auth-token'] || '';
  if (!accessTokenFromClient) {
    return res.status(401)
      .json({
        UserMessage: 'Unauthorized: User cannot access this route.',
        DeveloperMessage: 'Unauthorized: User cannot access this route. Bearer token is missing from header',
        ErrorCode: '0003',
        Data: req.headers,
      });
  }
  accessTokenFromClient = accessTokenFromClient.replace('Bearer', '').trim();
  function validateTokenCallback(err, response) {
    if (err) {
      return res.status(401)
        .json({
          UserMessage: 'Unauthorized: User cannot access this route.',
          DeveloperMessage: `Unauthorized: User cannot access this route. ${err}`,
          ErrorCode: '0004',
        });
    }

    req.user = response;
    req.user.identityId = identityId;
    next();
  }
  cognito.validate(accessTokenFromClient, validateTokenCallback);
};

module.exports = authenticate;
