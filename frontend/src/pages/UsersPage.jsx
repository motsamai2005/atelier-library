import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import Icon from '../components/Icons';
import { ErrorMessage, Loading, EmptyState, SuccessMessage } from '../components/Feedback';

const blankUser = { name: '', membershipId: '', role: 'Member', password: '' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blankUser);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() { const result = await apiRequest('/users'); setUsers(result.users || []); }
  useEffect(() => { load().catch(err => setError(err.message)).finally(() => setLoading(false)); }, []);

  function create() { setEditing(null); setForm(blankUser); setError(''); setSuccess(''); setFormOpen(true); }
  function edit(user) { setEditing(user); setForm({ name: user.name, membershipId: user.membershipId, role: user.role, password: '' }); setError(''); setSuccess(''); setFormOpen(true); }
  function close() { setFormOpen(false); setEditing(null); setForm(blankUser); }

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      const body = { ...form };
      if (editing && !body.password) delete body.password;
      await apiRequest(editing ? `/users/${editing.id}` : '/users', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
      await load(); setSuccess(editing ? 'User details updated.' : 'New user account created.'); close();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function remove(user) {
    if (!window.confirm(`Delete the account for ${user.name}?`)) return;
    setError(''); setSuccess('');
    try { await apiRequest(`/users/${user.id}`, { method: 'DELETE' }); await load(); setSuccess('User account deleted.'); }
    catch (err) { setError(err.message); }
  }

  if (loading) return <Loading label="Loading people and access…"/>;
  return <div className="users-page">
    <div className="page-intro-row"><div><p className="intro-copy">Manage the people who care for and borrow from the collection. Assign each person the access they need.</p><span className="record-count">{users.length} REGISTERED ACCOUNTS</span></div><button className="primary-button" onClick={create}><Icon name="plus" size={17}/> Add a person</button></div>
    <ErrorMessage>{error}</ErrorMessage><SuccessMessage>{success}</SuccessMessage>
    {formOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}><section className="form-modal user-modal" role="dialog" aria-modal="true" aria-labelledby="user-form-title"><div className="modal-heading"><div><span className="eyebrow">PEOPLE & PERMISSIONS</span><h2 id="user-form-title">{editing ? 'Update account' : 'Welcome someone new'}</h2></div><button className="icon-button" onClick={close} aria-label="Close form"><Icon name="close"/></button></div><form onSubmit={submit} className="stacked-form"><div className="form-grid"><label className="field field-wide">Full name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name"/></label><label className="field field-wide">Membership ID<input required value={form.membershipId} onChange={e => setForm({ ...form, membershipId: e.target.value })} placeholder="e.g. LIB-024"/></label><label className="field field-wide">Access role<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option>Member</option><option>Librarian</option><option>Admin</option></select></label><label className="field field-wide">{editing ? 'New password (leave blank to keep current)' : 'Temporary password'}<input type="password" minLength="8" required={!editing} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters"/></label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save account' : 'Create account'}</button></div></form></section></div>}

    <section className="panel people-panel"><div className="panel-heading"><div><span className="eyebrow">THE LIBRARY COMMUNITY</span><h3>Registered people</h3></div><span className="record-count">ACCESS REGISTER</span></div>
      <div className="people-list">{users.map((person, index) => <div className="person-row" key={person.id}><div className={`person-avatar person-avatar-${index % 5}`}>{person.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</div><div className="person-identity"><strong>{person.name}</strong><span>{person.membershipId}</span></div><span className={`role-badge role-${person.role.toLowerCase()}`}>{person.role}</span><span className="person-since">Joined {new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(person.createdAt))}</span><div className="table-actions"><button className="icon-button" title="Edit user" onClick={() => edit(person)}><Icon name="edit" size={16}/></button><button className="icon-button danger-icon" title="Delete user" onClick={() => remove(person)}><Icon name="trash" size={16}/></button></div></div>)}{users.length === 0 && <EmptyState title="No registered people" detail="Create the first account to begin managing library access."/>}</div>
      <div className="table-footnote"><span>ADMINISTRATORS CAN MANAGE ACCOUNTS AND THE CATALOGUE</span><span>MEMBERSHIP ID IS USED TO SIGN IN</span></div>
    </section>
    <div className="permission-note"><Icon name="alert" size={17}/><p><strong>Access note</strong><span>Admins can manage books and user accounts. Librarians can record stock movements. All signed-in users can view the catalogue and circulation history.</span></p></div>
  </div>;
}
