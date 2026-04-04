/**
 * Must run after verifyCognitoToken — restricts route to admin role or ADMIN_EMAILS match.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const adminList = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin =
    req.user.role === 'admin' ||
    (req.user.email && adminList.includes(req.user.email.toLowerCase()));

  if (!isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}
