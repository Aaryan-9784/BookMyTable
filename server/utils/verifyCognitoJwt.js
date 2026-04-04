/**
 * Verifies Cognito ID token: signature (RS256) via JWKS, issuer, audience (app client id), expiry.
 */
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { getJwks } from './fetchJwks.js';

/**
 * @param {string} token - Raw JWT without "Bearer " prefix
 * @returns {Promise<{ sub: string, email?: string, [k: string]: unknown }>}
 */
export async function verifyCognitoJwt(token) {
  const region = process.env.AWS_REGION;
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const appClientId = process.env.COGNITO_APP_CLIENT_ID;

  if (!region || !userPoolId || !appClientId) {
    throw new Error('Server missing COGNITO / AWS_REGION configuration');
  }

  const decodedHeader = jwt.decode(token, { complete: true });
  if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
    throw new Error('Invalid token header');
  }

  const kid = decodedHeader.header.kid;
  const keys = await getJwks(region, userPoolId);
  const jwk = keys.find((k) => k.kid === kid);
  if (!jwk) {
    throw new Error('Signing key not found in JWKS');
  }

  const pem = jwkToPem(jwk);
  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  const payload = jwt.verify(token, pem, {
    algorithms: ['RS256'],
    issuer,
    audience: appClientId,
    // Small leeway for laptop clock drift vs Cognito
    clockTolerance: 60,
  });

  return payload;
}
