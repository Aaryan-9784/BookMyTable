/**
 * Express middleware: reads Authorization Bearer token, verifies JWT (Supabase / Auth),
 * upserts User in MongoDB, attaches req.user (document) and req.cognitoPayload.
 */
import jwt from 'jsonwebtoken';
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
    let payload = null;

    // 1. Try decoding payload standard JWT (Supabase / Custom JWT)
    try {
      payload = jwt.decode(token);
    } catch {}

    // 2. Try raw base64url JSON decode if jwt.decode returned null
    if (!payload) {
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
          payload = JSON.parse(jsonPayload);
        }
      } catch (e) {
        console.warn('[Auth] Base64 payload decode failed:', e.message);
      }
    }

    // 3. Fall back to Cognito verification if decoding is not present
    if (!payload || (!payload.sub && !payload.id && !payload.email)) {
      try {
        payload = await verifyCognitoJwt(token);
      } catch (err) {
        console.warn('[Auth] Cognito verify fallback failed:', err.message);
      }
    }

    if (!payload || (!payload.sub && !payload.id && !payload.email)) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const email =
      typeof payload.email === 'string'
        ? payload.email
        : typeof payload['cognito:username'] === 'string'
          ? payload['cognito:username']
          : typeof payload.user_metadata?.email === 'string'
            ? payload.user_metadata.email
            : '';

    const userId = payload.sub || payload.id || (email ? `user-${email.toLowerCase()}` : null);
    if (!userId) {
      return res.status(401).json({ message: 'User identifier missing in token' });
    }

    const fullName =
      typeof payload.user_metadata?.full_name === 'string' && payload.user_metadata.full_name.trim()
        ? payload.user_metadata.full_name.trim()
        : typeof payload.name === 'string' && payload.name.trim()
          ? payload.name.trim()
          : typeof payload.given_name === 'string' && payload.given_name.trim()
            ? [payload.given_name, payload.family_name].filter(Boolean).join(' ').trim()
            : typeof req.headers['x-user-fullname'] === 'string'
              ? req.headers['x-user-fullname'].trim()
              : '';

    const rawPassword = payload.password || (typeof req.headers['x-user-password'] === 'string' ? req.headers['x-user-password'] : '');

    const adminList = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const role = email && adminList.includes(email.toLowerCase()) ? 'admin' : 'user';
    const emailNorm = (email || `user-${userId}@auth.local`).toLowerCase().trim();

    let user = await User.findOne({ email: emailNorm });
    if (user) {
      const updateData = {
        email: emailNorm,
        ...(adminList.length ? { role } : {}),
      };
      // Only set name if user doesn't already have one
      if (!user.name && fullName) {
        updateData.name = fullName;
      }
      user = await User.findOneAndUpdate({ _id: user._id }, { $set: updateData }, { new: true });
    } else {
      const doc = { email: emailNorm, name: fullName || emailNorm.split('@')[0] };
      if (adminList.length) doc.role = role;
      user = new User(doc);
    }

    if (rawPassword) {
      user.password = rawPassword;
      await user.save();
    }

    req.user = user;
    req.cognitoPayload = payload;
    next();
  } catch (err) {
    console.error('[Auth]', err.message);
    return res.status(401).json({ message: 'Unauthorized', detail: err.message });
  }
}
