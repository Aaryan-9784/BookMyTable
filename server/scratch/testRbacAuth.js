import { requireRole } from '../middleware/requireRole.js';

console.log('--- Testing Role-Based Access Control (RBAC) Middleware ---');

function mockReqRes(userRole, email = 'user@example.com') {
  const req = {
    user: {
      role: userRole,
      email,
    },
  };
  let statusCode = 200;
  let jsonBody = null;
  let nextCalled = false;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      jsonBody = body;
      return this;
    },
  };

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, getResult: () => ({ statusCode, jsonBody, nextCalled }) };
}

function testRoleAccess(testName, userRole, allowedRoles, expectedAllowed, options = {}) {
  const middleware = requireRole(allowedRoles, options);
  const { req, res, next, getResult } = mockReqRes(userRole);
  middleware(req, res, next);
  const { statusCode, nextCalled } = getResult();

  if (nextCalled === expectedAllowed) {
    console.log(`✅ [PASS] ${testName}: role "${userRole}" against [${allowedRoles.join(', ')}] -> ${nextCalled ? 'ALLOWED (200)' : 'DENIED (403)'}`);
  } else {
    console.error(`❌ [FAIL] ${testName}: expected ${expectedAllowed} but got ${nextCalled} (Status: ${statusCode})`);
    process.exit(1);
  }
}

// 1. Admin accessing Admin routes -> Allowed
testRoleAccess('Admin -> Admin Route', 'admin', ['admin'], true);

// 2. Admin accessing Strict Restaurant Partner routes -> DENIED (Strict Mode)
testRoleAccess('Admin -> Strict Partner Route', 'admin', ['restaurant'], false, { strict: true });

// 3. Restaurant role accessing Partner routes -> Allowed
testRoleAccess('Restaurant -> Strict Partner Route', 'restaurant', ['restaurant'], true, { strict: true });

// 4. Customer role accessing Partner routes -> Denied (403)
testRoleAccess('Customer -> Partner Route', 'customer', ['restaurant'], false, { strict: true });

// 5. Customer role accessing Admin routes -> Denied (403)
testRoleAccess('Customer -> Admin Route', 'customer', ['admin'], false);

// 6. User role accessing Customer routes -> Allowed
testRoleAccess('Customer -> Customer Route', 'customer', ['customer'], true);

console.log('\n✨ All strict RBAC role authorization tests passed successfully!');
