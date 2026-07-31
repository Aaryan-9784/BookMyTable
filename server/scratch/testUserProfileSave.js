import User from '../models/User.js';

console.log('--- Testing User Model Validation & Role Compatibility ---');

const validRoles = User.schema.path('role').enumValues;
console.log('User schema role enum values:', validRoles);

if (validRoles.includes('user') && validRoles.includes('customer')) {
  console.log('✅ Both "user" and "customer" are valid enums!');
} else {
  console.error('❌ "user" is missing from User schema enum values!');
}
