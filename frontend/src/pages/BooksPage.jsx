import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icons';
import { ErrorMessage, Loading, EmptyState, SuccessMessage } from '../components/Feedback';

const emptyBook = { title: '', author: '', genre: '', isbn: '', quantity: '1' };

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All genres');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  async function loadBooks() {
    const result = await apiRequest('/books');
    setBooks(result.books || []);
  }
  useEffect(() => {
    loadBooks().catch(err => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const genres = useMemo(() => ['All genres', ...new Set(books.map(book => book.genre).filter(Boolean))], [books]);
  const visibleBooks = useMemo(() => books.filter(book => {
    const phrase = `${book.title} ${book.author} ${book.isbn}`.toLowerCase();
    return phrase.includes(search.toLowerCase()) && (genre === 'All genres' || book.genre === genre);
  }), [books, search, genre]);

  function openCreate() {
    setEditing(null); setForm(emptyBook); setError(''); setSuccess(''); setFormOpen(true);
  }
  function openEdit(book) {
    setEditing(book); setForm({ title: book.title, author: book.author, genre: book.genre, isbn: book.isbn, quantity: String(book.quantity) }); setError(''); setSuccess(''); setFormOpen(true);
  }
  function closeForm() { setFormOpen(false); setEditing(null); setForm(emptyBook); }

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      const body = { ...form, quantity: Number(form.quantity) };
      await apiRequest(editing ? `/books/${editing.id}` : '/books', {
        method: editing ? 'PUT' : 'POST', body: JSON.stringify(body)
      });
      await loadBooks();
      setSuccess(editing ? 'Book details updated.' : 'New title added to the collection.');
      closeForm();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function removeBook(book) {
    if (!window.confirm(`Remove “${book.title}” from the catalogue?`)) return;
    setError(''); setSuccess('');
    try { await apiRequest(`/books/${book.id}`, { method: 'DELETE' }); await loadBooks(); setSuccess('Book removed from the catalogue.'); }
    catch (err) { setError(err.message); }
  }

  if (loading) return <Loading label="Opening the catalogue…"/>;
  return <div className="books-page">
    <div className="page-intro-row"><div><p className="intro-copy">A living catalogue of ideas, stories and discoveries. Keep every title accounted for.</p><span className="record-count">{books.length} TITLES <i>·</i> {books.reduce((n, b) => n + Number(b.quantity), 0)} COPIES</span></div>{user?.role === 'Admin' && <button className="primary-button" onClick={openCreate}><Icon name="plus" size={17}/> Add a title</button>}</div>
    <ErrorMessage>{error}</ErrorMessage><SuccessMessage>{success}</SuccessMessage>
    <div className="catalogue-toolbar"><label className="search-box"><Icon name="search" size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, author or ISBN…" aria-label="Search books"/><kbd>⌕</kbd></label><label className="filter-select"><span>FILTER</span><select value={genre} onChange={e => setGenre(e.target.value)}>{genres.map(item => <option key={item}>{item}</option>)}</select></label></div>

    {formOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) closeForm(); }}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="book-form-title"><div className="modal-heading"><div><span className="eyebrow">COLLECTION RECORD</span><h2 id="book-form-title">{editing ? 'Refine this title' : 'Add a new title'}</h2></div><button className="icon-button" onClick={closeForm} aria-label="Close form"><Icon name="close"/></button></div><form onSubmit={submit} className="stacked-form"><div className="form-grid"><label className="field field-wide">Book title<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. The Art of Possibility"/></label><label className="field">Author<input required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Author's name"/></label><label className="field">Genre<input required value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} placeholder="e.g. Fiction"/></label><label className="field field-wide">ISBN<input required value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} placeholder="ISBN identifier"/></label><label className="field">{editing ? 'Current stock' : 'Initial quantity'}<input type="number" min="0" step="1" required disabled={Boolean(editing)} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}/>{editing && <small>Use Circulation to record stock changes and preserve the audit trail.</small>}</label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={closeForm}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add to collection'}</button></div></form></section></div>}

    <div className="catalogue-table-wrap"><table className="data-table catalogue-table"><thead><tr><th>TITLE / AUTHOR</th><th>GENRE</th><th>ISBN</th><th>AVAILABILITY</th>{user?.role === 'Admin' && <th className="align-right">ACTIONS</th>}</tr></thead><tbody>
      {visibleBooks.map(book => <tr key={book.id}><td><div className="book-cell"><div className={`book-cover cover-${Number(book.id) % 5}`}><span>{book.title?.slice(0, 1).toUpperCase()}</span><i/></div><div><strong>{book.title}</strong><span>{book.author}</span></div></div></td><td><span className="genre-label">{book.genre}</span></td><td className="isbn-cell">{book.isbn}</td><td><span className={`availability ${Number(book.quantity) < 2 ? 'availability-low' : 'availability-good'}`}><i/>{Number(book.quantity) === 0 ? 'Out of stock' : `${book.quantity} ${Number(book.quantity) === 1 ? 'copy' : 'copies'}`}</span></td>{user?.role === 'Admin' && <td><div className="table-actions"><button className="icon-button" title="Edit book" onClick={() => openEdit(book)}><Icon name="edit" size={16}/></button><button className="icon-button danger-icon" title="Delete book" onClick={() => removeBook(book)}><Icon name="trash" size={16}/></button></div></td>}</tr>)}
    </tbody></table>{visibleBooks.length === 0 && <EmptyState title="No matching titles" detail="Try a different search phrase or clear the genre filter."/>}</div>
    <div className="table-footnote"><span>SHOWING {visibleBooks.length} OF {books.length} RECORDS</span><span>STOCK BELOW 2 COPIES IS FLAGGED FOR REVIEW</span></div>
  </div>;
}
