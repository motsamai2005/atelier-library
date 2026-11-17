import { Router } from 'express';
import pool from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [books] = await pool.query(
      `SELECT id, title, author, genre, isbn, quantity, created_at AS createdAt,
              updated_at AS updatedAt
       FROM books ORDER BY created_at DESC`
    );
    res.json({ books });
  } catch (error) { next(error); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const stock = Number(quantity);
    if (!title?.trim() || !author?.trim() || !genre?.trim() || !isbn?.trim() || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: 'Complete every field and enter a whole-number quantity of zero or more.' });
    }
    const [result] = await pool.execute(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), stock]
    );
    const [rows] = await pool.execute('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json({ book: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A book with that ISBN already exists.' });
    next(error);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const stock = Number(quantity);
    if (!title?.trim() || !author?.trim() || !genre?.trim() || !isbn?.trim() || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: 'Complete every field and enter a whole-number quantity of zero or more.' });
    }
    const [result] = await pool.execute(
      `UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?`,
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), stock, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found.' });
    const [rows] = await pool.execute('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json({ book: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A book with that ISBN already exists.' });
    next(error);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found.' });
    res.json({ message: 'Book removed from the catalogue.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'This book has transaction history and cannot be deleted. Keep the record for audit purposes.' });
    }
    next(error);
  }
});

export default router;
