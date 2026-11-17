import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Please sign in to continue.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'development_only_secret');
    next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ message: 'Administrator permission is required.' });
  }
  next();
}

export function requireStaff(req, res, next) {
  if (!['Admin', 'Librarian'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'A librarian or administrator account is required to record stock movements.' });
  }
  next();
}
