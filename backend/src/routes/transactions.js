import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [transactions] = await pool.query(
      `SELECT t.id, t.book_id AS bookId, b.title AS bookTitle,
              t.user_id AS userId, u.name AS userName,
              t.type, t.quantity, t.note, t.created_at AS createdAt
       FROM library_transactions t
       INNER JOIN books b ON b.id = t.book_id
       INNER JOIN library_users u ON u.id = t.user_id
       ORDER BY t.created_at DESC LIMIT 100`
    );
    res.json({ transactions });
  } catch (error) { next(error); }
});

router.post('/', requireStaff, async (req, res, next) => {
  const { bookId, type, quantity, note = '' } = req.body;
  const amount = Number(quantity);
  if (!bookId || !['IN', 'OUT'].includes(type) || !Number.isInteger(amount) || amount < 1) {
    return res.status(400).json({ message: 'Choose a book, select stock received or borrowed, and enter a quantity of at least one.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [books] = await connection.execute('SELECT id, quantity FROM books WHERE id = ? FOR UPDATE', [bookId]);
    if (!books.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'The selected book could not be found.' });
    }
    const current = Number(books[0].quantity);
    if (type === 'OUT' && current < amount) {
      await connection.rollback();
      return res.status(409).json({ message: `Only ${current} copy/copies are currently available.` });
    }

    const updated = type === 'IN' ? current + amount : current - amount;
    await connection.execute('UPDATE books SET quantity = ? WHERE id = ?', [updated, bookId]);
    const [insert] = await connection.execute(
      `INSERT INTO library_transactions (book_id, user_id, type, quantity, note)
       VALUES (?, ?, ?, ?, ?)`,
      [bookId, req.user.id, type, amount, String(note).trim() || null]
    );
    await connection.commit();
    res.status(201).json({ transactionId: insert.insertId, message: 'Stock movement recorded successfully.' });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    connection?.release();
  }
});

export default router;
