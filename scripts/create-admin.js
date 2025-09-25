// Script to create admin user
// Run with: node scripts/create-admin.js

const bcrypt = require('bcryptjs');

async function createAdminHash() {
  const password = process.argv[2] || 'admin123';
  const hash = await bcrypt.hash(password, 12);
  
  console.log('Admin user SQL:');
  console.log(`INSERT INTO admin_users (username, email, password_hash) VALUES ('admin', 'admin@cleanekiti.com', '${hash}');`);
  console.log('\nPassword:', password);
  console.log('Hash:', hash);
}

createAdminHash().catch(console.error);