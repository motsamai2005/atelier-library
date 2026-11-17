import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icons';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [membershipId, setMembershipId] = useState('LIB-001');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace/>;

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(membershipId, password); navigate('/', { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <div className="login-screen"><div className="login-visual"><div className="login-brand"><div className="brand-mark">A<span>·</span></div><div><div className="brand-name">atelier</div><div className="brand-caption">LIBRARY & ARCHIVE</div></div></div><div className="login-art"><div className="login-orbit orbit-one"/><div className="login-orbit orbit-two"/><div className="login-arch"><div className="arch-book arch-a"/><div className="arch-book arch-b"/><div className="arch-book arch-c"/><span>✳</span></div><p>For the love<br/>of <em>reading.</em></p></div><div className="login-visual-foot"><span>EST. FOR CURIOUS MINDS</span><span>MASERU · LESOTHO</span></div></div>
    <div className="login-main"><div className="login-form-wrap"><span className="eyebrow">WELCOME BACK</span><h1>Open the<br/><em>right chapter.</em></h1><p className="login-subtitle">Sign in to tend to your collection and keep good stories moving.</p><form onSubmit={submit} className="login-form"><label className="field">Membership ID<div className="input-with-icon"><Icon name="users" size={17}/><input required value={membershipId} onChange={e => setMembershipId(e.target.value)} placeholder="Your membership ID" autoComplete="username"/></div></label><label className="field">Password<div className="input-with-icon"><Icon name="book" size={17}/><input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password"/></div></label>{error && <div className="feedback error-feedback">{error}</div>}<button className="primary-button login-submit" disabled={busy}>{busy ? 'Opening your library…' : 'Enter the library'}<Icon name="arrow" size={17}/></button></form><div className="login-hint"><span className="hint-dot"/><p>DEMO ACCESS <strong>LIB-001</strong> / <strong>Admin@123</strong><br/><small>Change the demo password after signing in.</small></p></div></div><div className="login-footer">ATELIER LIBRARY <span>·</span> A CONSIDERED COLLECTION</div></div></div>;
}
