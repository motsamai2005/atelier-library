import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import Icon from '../components/Icons';
import { ErrorMessage, Loading, EmptyState, SuccessMessage } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';

function dateTime(value) {
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const canRecord = ['Admin', 'Librarian'].includes(user?.role);
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bookId, setBookId] = useState('');
  const [type, setType] = useState('OUT');
  const [quantity, setQuantity] = useState('1');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const [bookData, transactionData] = await Promise.all([apiRequest('/books'), apiRequest('/transactions')]);
    setBooks(bookData.books || []);
    setTransactions(transactionData.transactions || []);
    if (!bookId && bookData.books?.length) setBookId(String(bookData.books[0].id));
  }
  useEffect(() => { load().catch(err => setError(err.message)).finally(() => setLoading(false)); }, []);

  const selectedBook = books.find(book => String(book.id) === String(bookId));
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      const result = await apiRequest('/transactions', { method: 'POST', body: JSON.stringify({ bookId: Number(bookId), type, quantity: Number(quantity), note }) });
      await load(); setSuccess(result.message || 'Stock movement recorded.'); setQuantity('1'); setNote('');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  if (loading) return <Loading label="Preparing circulation ledger…"/>;
  return <div className="transactions-page">
    <p className="intro-copy transactions-intro">Record every arrival and every loan. Each movement updates the shelf count and leaves a permanent entry in the circulation ledger.</p>
    <ErrorMessage>{error}</ErrorMessage><SuccessMessage>{success}</SuccessMessage>
    {canRecord && <section className="circulation-layout">
      <div className="panel movement-panel"><div className="panel-heading"><div><span className="eyebrow">NEW STOCK MOVEMENT</span><h3>Record a transaction</h3></div><span className="panel-number">01</span></div>
        <form onSubmit={submit} className="movement-form">
          <div className="movement-toggle"><button type="button" className={type === 'OUT' ? 'toggle-active' : ''} onClick={() => setType('OUT')}><span>−</span> Borrow / deduct</button><button type="button" className={type === 'IN' ? 'toggle-active toggle-in' : ''} onClick={() => setType('IN')}><span>+</span> Receive / add stock</button></div>
          <label className="field">Select a title<select required value={bookId} onChange={e => setBookId(e.target.value)}><option value="" disabled>Choose from collection</option>{books.map(book => <option value={book.id} key={book.id}>{book.title} — {book.author}</option>)}</select></label>
          {selectedBook && <div className="selected-book"><div className={`mini-cover cover-${Number(selectedBook.id) % 5}`}><span>{selectedBook.title?.slice(0, 1).toUpperCase()}</span></div><div><strong>{selectedBook.title}</strong><span>{selectedBook.author}</span></div><div className="selected-stock"><small>ON SHELF</small><strong>{selectedBook.quantity}</strong></div></div>}
          <div className="form-grid movement-fields"><label className="field">Quantity<input type="number" min="1" step="1" required value={quantity} onChange={e => setQuantity(e.target.value)}/></label><label className="field">Reference note <span className="optional-label">OPTIONAL</span><input value={note} onChange={e => setNote(e.target.value)} maxLength="255" placeholder={type === 'OUT' ? 'Reader or loan reference' : 'Delivery or purchase reference'}/></label></div>
          <button className="primary-button movement-submit" type="submit" disabled={saving || !books.length || !bookId}>{saving ? 'Recording…' : type === 'IN' ? 'Record stock received' : 'Record borrowed copies'}<Icon name="arrow" size={17}/></button>
        </form>
        <div className="movement-footnote"><Icon name="alert" size={15}/><span>Borrowing more copies than are available is blocked automatically.</span></div>
      </div>
      <aside className="circulation-aside"><div className="aside-illustration"><div className="ledger-shape"><span/><span/><span/><span/></div><span className="ledger-star">✳</span><p>THE<br/><em>ledger</em></p></div><div className="aside-caption"><span>GOOD PRACTICE / 01</span><p>Record stock movements as they happen. A clear history makes the collection easier to trust and manage.</p></div></aside>
    </section>}

    <section className="panel ledger-panel"><div className="panel-heading"><div><span className="eyebrow">A RECORD OF MOVEMENT</span><h3>Circulation history</h3></div><span className="record-count">LATEST {transactions.length} ENTRIES</span></div>
      <div className="ledger-table-wrap"><table className="data-table ledger-table"><thead><tr><th>DATE & TIME</th><th>TITLE</th><th>RECORDED BY</th><th>TYPE</th><th>QUANTITY</th><th>NOTE</th></tr></thead><tbody>{transactions.map(item => <tr key={item.id}><td className="date-cell">{dateTime(item.createdAt)}</td><td><strong>{item.bookTitle}</strong></td><td>{item.userName}</td><td><span className={`transaction-type ${item.type === 'IN' ? 'type-in' : 'type-out'}`}>{item.type === 'IN' ? 'Stock in' : 'Borrowed'}</span></td><td><strong className={item.type === 'IN' ? 'quantity-in' : 'quantity-out'}>{item.type === 'IN' ? '+' : '−'}{item.quantity}</strong></td><td className="note-cell">{item.note || '—'}</td></tr>)}</tbody></table>{transactions.length === 0 && <EmptyState title="The ledger is clear" detail="Once you record a stock movement, it will appear here."/>}</div>
      <div className="table-footnote"><span>TRANSACTION RECORDS ARE RETAINED FOR AUDIT HISTORY</span><span>{transactions.length} TOTAL ENTRIES</span></div>
    </section>
  </div>;
}
