import { NavLink } from 'react-router-dom';
import Icon from './Icons';
import { useAuth } from '../context/AuthContext';

const mainLinks = [
  { to: '/', label: 'Overview', icon: 'grid', end: true },
  { to: '/books', label: 'Book collection', icon: 'book' },
  { to: '/transactions', label: 'Circulation', icon: 'swap' }
];

export default function Sidebar({ open = false, onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close menu" onClick={onNavigate} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark">A<span>·</span></div>
          <div><div className="brand-name">atelier</div><div className="brand-caption">LIBRARY & ARCHIVE</div></div>
        </div>
        <div className="sidebar-rule" />
        <p className="nav-caption">WORKSPACE</p>
        <nav className="side-nav">
          {mainLinks.map(link => <NavLink key={link.to} to={link.to} end={link.end} onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon name={link.icon} size={18} /><span>{link.label}</span>{link.to === '/books' && <span className="nav-dot" />}
          </NavLink>)}
          {user?.role === 'Admin' && <>
            <p className="nav-caption nav-caption-spaced">ADMINISTRATION</p>
            <NavLink to="/users" onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon name="users" size={18}/><span>People & access</span></NavLink>
          </>}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><span className="note-mark">✳</span><p>Every book has a story.<br/><strong>Keep each one in circulation.</strong></p></div>
          <div className="profile-row">
            <div className="avatar">{user?.name?.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'AL'}</div>
            <div className="profile-copy"><strong>{user?.name || 'Library staff'}</strong><span>{user?.role || 'Member'}</span></div>
            <button className="icon-button logout-button" title="Sign out" onClick={logout}><Icon name="logout" size={17}/></button>
          </div>
        </div>
      </aside>
    </>
  );
}
