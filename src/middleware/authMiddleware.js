import * as jwt from 'jsonwebtoken';

const jwkToPem = require('jwk-to-pem');

const cognitoPoolId = process.env.COGNITO_POOL_ID || '';
const jwk = process.env.JWK || '';

if (!cognitoPoolId || !jwk) {
  throw new Error('env var JWK COGNITO_POOL_ID are required for cognito pool');
}
const cognitoIssuer = `https://cognito-idp.us-east-1.amazonaws.com/${cognitoPoolId}`;

module.exports = function setCurrentUser(req, res, next) {
  const header = req.header('authorization');
  const [type, token] = header.split(' ');

  const pem = jwkToPem(jwk);
  jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decodedToken) => {
    const currentSeconds = Math.floor((new Date()).valueOf() / 1000);
    if (currentSeconds > decodedToken.exp || currentSeconds < decodedToken.auth_time) {
      throw new Error('claim is expired or invalid');
    }
    if (decodedToken.iss !== cognitoIssuer) {
      throw new Error('claim issuer is invalid');
    }
    if (decodedToken.token_use !== 'access') {
      throw new Error('claim use is not access');
    }
    console.log(`claim confirmed for ${decodedToken.username}`);
    next();
  });
};
