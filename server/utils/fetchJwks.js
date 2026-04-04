/**
 * Fetches Cognito JWKS and caches in memory to avoid hitting the well-known URL on every request.
 */
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cache = { keys: null, fetchedAt: 0 };

/**
 * @param {string} region
 * @param {string} userPoolId
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function getJwks(region, userPoolId) {
  const now = Date.now();
  if (cache.keys && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.keys;
  }

  const url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS: ${res.status} ${res.statusText}`);
  }
  const body = await res.json();
  if (!body.keys || !Array.isArray(body.keys)) {
    throw new Error('Invalid JWKS response');
  }
  cache = { keys: body.keys, fetchedAt: now };
  return body.keys;
}

export function clearJwksCache() {
  cache = { keys: null, fetchedAt: 0 };
}
