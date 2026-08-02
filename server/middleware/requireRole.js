/**
 * Middleware: Enforces Role-Based Access Control (RBAC).
 * Supports 'admin', 'restaurant', and 'customer' / 'user' roles.
 */
export function requireRole(allowedRoles = [], { strict = false } = {}) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = (req.user.role || 'customer').toLowerCase();
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const restaurantEmails = (process.env.RESTAURANT_EMAILS || process.env.RESTAURANT_OWNER_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = (req.user.email || '').toLowerCase();
    const isSuperAdmin = userRole === 'admin' || (userEmail && adminEmails.includes(userEmail));
    const isRestaurantPartner = userRole === 'restaurant' || (userEmail && restaurantEmails.includes(userEmail));

    // Strict mode: requires exact role match
    if (strict) {
      const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
      const isAllowed =
        (normalizedAllowed.includes('restaurant') && isRestaurantPartner) ||
        normalizedAllowed.includes(userRole);

      if (isAllowed) {
        return next();
      }
      return res.status(403).json({
        message: `Forbidden: Access restricted strictly to ${allowedRoles.join(', ')} role.`,
      });
    }

    // Standard mode: Super admin can access all roles/dashboards
    if (isSuperAdmin) {
      return next();
    }

    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
    const isAllowed =
      (normalizedAllowed.includes('restaurant') && isRestaurantPartner) ||
      (normalizedAllowed.includes('customer') && (userRole === 'customer' || userRole === 'user')) ||
      (normalizedAllowed.includes('user') && (userRole === 'customer' || userRole === 'user')) ||
      normalizedAllowed.includes(userRole);

    if (!isAllowed) {
      return res.status(403).json({
        message: `Forbidden: Access restricted to ${allowedRoles.join(', ')} roles.`,
      });
    }

    next();
  };
}
