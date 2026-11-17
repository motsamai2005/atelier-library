import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from './db.js';

dotenv.config();

try {
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  await pool.execute(
    `INSERT INTO library_users (name, membership_id, role, password_hash)
     VALUES (?, ?, 'Admin', ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), role = 'Admin'`,
    ['Library Administrator', 'LIB-001', passwordHash]
  );
  console.log('Admin account ready. Membership ID: LIB-001 | Password: Admin@123');
  console.log('Change this demo password after your first sign-in.');
} catch (error) {
  console.error('Could not create the admin account:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
