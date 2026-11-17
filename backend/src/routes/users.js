import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, membership_id AS membershipId, role, created_at AS createdAt
       FROM library_users ORDER BY created_at DESC`
    );
    res.json({ users });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, membershipId, role, password } = req.body;
    if (!name?.trim() || !membershipId?.trim() || !['Admin', 'Librarian', 'Member'].includes(role) || !password || password.length < 8) {
      return res.status(400).json({ message: 'Enter a name, membership ID, valid role, and password of at least 8 characters.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO library_users (name, membership_id, role, password_hash)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), membershipId.trim(), role, passwordHash]
    );
    res.status(201).json({ user: { id: result.insertId, name: name.trim(), membershipId: membershipId.trim(), role } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That membership ID is already registered.' });
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, membershipId, role, password } = req.body;
    if (!name?.trim() || !membershipId?.trim() || !['Admin', 'Librarian', 'Member'].includes(role)) {
      return res.status(400).json({ message: 'Enter a name, membership ID, and valid role.' });
    }
    if (String(req.params.id) === String(req.user.id) && role !== 'Admin') {
      return res.status(400).json({ message: 'You cannot remove administrator access from your own account.' });
    }

    if (password) {
      if (password.length < 8) return res.status(400).json({ message: 'A new password must contain at least 8 characters.' });
      const passwordHash = await bcrypt.hash(password, 12);
      const [result] = await pool.execute(
        `UPDATE library_users SET name = ?, membership_id = ?, role = ?, password_hash = ? WHERE id = ?`,
        [name.trim(), membershipId.trim(), role, passwordHash, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' });
    } else {
      const [result] = await pool.execute(
        `UPDATE library_users SET name = ?, membership_id = ?, role = ? WHERE id = ?`,
        [name.trim(), membershipId.trim(), role, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user: { id: Number(req.params.id), name: name.trim(), membershipId: membershipId.trim(), role } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That membership ID is already registered.' });
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete the account currently signed in.' });
    }
    const [result] = await pool.execute('DELETE FROM library_users WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User account deleted.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'This user has transaction history and cannot be deleted.' });
    }
    next(error);
  }
});

export default router;
