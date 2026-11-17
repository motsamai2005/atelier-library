import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { membershipId, password } = req.body;
    if (!membershipId?.trim() || !password) {
      return res.status(400).json({ message: 'Enter your membership ID and password.' });
    }

    const [rows] = await pool.execute(
      `SELECT id, name, membership_id, role, password_hash
       FROM library_users WHERE membership_id = ? LIMIT 1`,
      [membershipId.trim()]
    );
    const user = rows[0];
    const valid = user && await bcrypt.compare(password, user.password_hash);

    if (!valid) return res.status(401).json({ message: 'The membership ID or password is incorrect.' });

    const payload = {
      id: user.id,
      name: user.name,
      membershipId: user.membership_id,
      role: user.role
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'development_only_secret', { expiresIn: '8h' });
    res.json({ token, user: payload });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
