import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';
import Icon from '../components/Icons';
import { ErrorMessage, Loading, EmptyState } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [bookData, transactionData] = await Promise.all([
          apiRequest('/books'), apiRequest('/transactions')
        ]);
        let userData = { users: [] };
        if (user?.role === 'Admin') userData = await apiRequest('/users');
        if (!alive) return;
        setBooks(bookData.books || []);
        setTransactions(transactionData.transactions || []);
        setPeople(userData.users || []);
      } catch (err) { if (alive) setError(err.message); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [user?.role]);

  const totalCopies = useMemo(() => books.reduce((sum, book) => sum + Number(book.quantity || 0), 0), [books]);
  const lowStock = useMemo(() => books.filter(book => Number(book.quantity) < 2), [books]);
  const recent = transactions.slice(0, 5);

  if (loading) return <Loading />;
  return <div className="dashboard-page">
    <ErrorMessage>{error}</ErrorMessage>
    <section className="welcome-banner">
      <div className="welcome-copy"><span className="welcome-kicker">THE COLLECTION AT A GLANCE</span><h2>Good day, {user?.name?.split(' ')[0] || 'there'}.</h2><p>A little order goes a long way. Here is what is happening across your library today.</p><Link to="/books" className="text-link">Explore the collection <Icon name="arrow" size={16}/></Link></div>
      <div className="welcome-art" aria-hidden="true"><div className="art-sun"/><div className="art-book book-one"/><div className="art-book book-two"/><div className="art-book book-three"/><div className="art-line"/><span className="art-script">read<br/>slowly</span></div>
      <span className="banner-index">01 / 04</span>
    </section>

    <section className="stats-grid">
      <article className="stat-card stat-featured"><div className="stat-top"><span>CATALOGUED TITLES</span><span className="stat-icon"><Icon name="book" size={18}/></span></div><strong className="stat-number">{String(books.length).padStart(2, '0')}</strong><div className="stat-foot"><span className="stat-marker"/>Distinct titles in the collection</div></article>
      <article className="stat-card"><div className="stat-top"><span>AVAILABLE COPIES</span><span className="stat-icon"><Icon name="grid" size={18}/></span></div><strong className="stat-number">{totalCopies.toLocaleString()}</strong><div className="stat-foot">Across all catalogued titles</div></article>
      <article className="stat-card"><div className="stat-top"><span>NEEDS ATTENTION</span><span className="stat-icon stat-icon-warm"><Icon name="alert" size={18}/></span></div><strong className="stat-number">{String(lowStock.length).padStart(2, '0')}</strong><div className="stat-foot">Titles with fewer than 2 copies</div></article>
      {user?.role === 'Admin' && <article className="stat-card"><div className="stat-top"><span>REGISTERED PEOPLE</span><span className="stat-icon"><Icon name="users" size={18}/></span></div><strong className="stat-number">{String(people.length).padStart(2, '0')}</strong><div className="stat-foot">Across all access roles</div></article>}
    </section>

    <section className="dashboard-columns">
      <div className="panel collection-panel">
        <div className="panel-heading"><div><span className="eyebrow">A CLOSER LOOK</span><h3>Low-stock watchlist</h3></div><Link to="/books" className="subtle-link">All books <Icon name="arrow" size={15}/></Link></div>
        {lowStock.length === 0 ? <EmptyState title="All shelves look healthy" detail="No titles are currently below the two-copy threshold."/> : <div className="watch-list">{lowStock.slice(0, 5).map(book => <div className="watch-item" key={book.id}><div className={`mini-cover cover-${Number(book.id) % 5}`}><span>{book.title?.slice(0, 1).toUpperCase()}</span></div><div className="watch-copy"><strong>{book.title}</strong><span>{book.author} <i>·</i> {book.genre}</span></div><span className={`stock-pill ${Number(book.quantity) === 0 ? 'stock-empty' : 'stock-low'}`}>{book.quantity} left</span></div>)}</div>}
      </div>
      <div className="panel activity-panel">
        <div className="panel-heading"><div><span className="eyebrow">THE PAPER TRAIL</span><h3>Recent circulation</h3></div><Link to="/transactions" className="subtle-link">View log <Icon name="arrow" size={15}/></Link></div>
        {recent.length === 0 ? <EmptyState title="No movements yet" detail="Your stock activity will appear here once recorded."/> : <div className="activity-list">{recent.map(item => <div className="activity-item" key={item.id}><span className={`activity-mark ${item.type === 'IN' ? 'mark-in' : 'mark-out'}`}>{item.type === 'IN' ? '+' : '−'}</span><div className="activity-copy"><strong>{item.bookTitle}</strong><span>{item.userName} <i>·</i> {formatDate(item.createdAt)}</span></div><span className={`activity-quantity ${item.type === 'IN' ? 'quantity-in' : 'quantity-out'}`}>{item.type === 'IN' ? '+' : '−'}{item.quantity}</span></div>)}</div>}
      </div>
    </section>
    <section className="bottom-note"><span className="bottom-note-mark">✳</span><p><strong>A note on stewardship</strong><span>Keeping accurate records helps every reader find their next favourite book.</span></p><Link to="/transactions" className="round-arrow"><Icon name="arrow" size={18}/></Link></section>
  </div>;
}
