/**
 * Express middleware: reads Authorization Bearer token, verifies Cognito JWT,
 * upserts User in MongoDB, attaches req.user (document) and req.cognitoPayload.
 */
import User from '../models/User.js';
import { verifyCognitoJwt } from '../utils/verifyCognitoJwt.js';

export async function verifyCognitoToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }

  try {
    const payload = await verifyCognitoJwt(token);
    const cognitoId = payload.sub;
    const email =
      typeof payload.email === 'string'
        ? payload.email
        : typeof payload['cognito:username'] === 'string'
          ? payload['cognito:username']
          : '';
    const fullName = typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim()
      : typeof payload.given_name === 'string' && payload.given_name.trim()
        ? [payload.given_name, payload.family_name].filter(Boolean).join(' ').trim()
        : typeof req.headers['x-user-fullname'] === 'string'
          ? req.headers['x-user-fullname'].trim()
          : '';

    if (!cognitoId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Sync app user — email may be absent in access token; ID token should include email
    const adminList = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const role = email && adminList.includes(email.toLowerCase()) ? 'admin' : 'user';

    const emailNorm = (email || `user-${cognitoId}@cognito.local`).toLowerCase().trim();

    const $set = {
      email: emailNorm,
      ...(adminList.length ? { role } : {}),
    };
    // Only update fullName if we actually have one — never blank out an existing name
    if (fullName) $set.fullName = fullName;

    /**
     * Avoid E11000 duplicate key on `email` when the same person gets a new Cognito `sub`
     * (re-signup, new pool user, etc.): upsert-by-cognitoId alone INSERTs a second row with the
     * same email. Prefer updating the existing email row and re-pointing `cognitoId`.
     */
    let user = await User.findOne({ cognitoId });
    if (user) {
      user = await User.findOneAndUpdate({ _id: user._id }, { $set }, { new: true });
    } else {
      const sameEmail = await User.findOne({ email: emailNorm });
      if (sameEmail) {
        user = await User.findOneAndUpdate(
          { _id: sameEmail._id },
          { $set: { cognitoId, ...$set } },
          { new: true }
        );
      } else {
        const doc = { cognitoId, email: emailNorm };
        if (adminList.length) doc.role = role;
        user = await User.create(doc);
      }
    }

    req.user = user;
    req.cognitoPayload = payload;
    next();
  } catch (err) {
    console.error('[Auth]', err.message);
    return res.status(401).json({ message: 'Unauthorized', detail: err.message });
  }
}
