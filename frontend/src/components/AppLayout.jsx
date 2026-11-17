import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Icon from './Icons';
import { useAuth } from '../context/AuthContext';

const pageNames = {
  '/': ['Your library, in focus', 'OVERVIEW'],
  '/books': ['The collection', 'BOOK MANAGEMENT'],
  '/transactions': ['Movement & memory', 'CIRCULATION'],
  '/users': ['The people behind the pages', 'USER MANAGEMENT']
};

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const [heading, eyebrow] = pageNames[location.pathname] || pageNames['/'];
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return <div className="app-shell">
    <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    <main className="main-panel">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu"/></button>
        <div className="breadcrumb"><span>ATELIER</span><Icon name="chevron" size={13}/><strong>{eyebrow}</strong></div>
        <div className="topbar-right"><span className="date-stamp">{today}</span><span className="topbar-divider"/><div className="topbar-user"><span className="online-dot"/>{user?.name?.split(' ')[0]}</div></div>
      </header>
      <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{heading}</h1></div><div className="heading-decoration">A considered<br/><em>collection.</em></div></div>
      <div className="page-content"><Outlet /></div>
      <footer className="page-footer"><span>ATELIER LIBRARY <span className="footer-separator">/</span> COLLECTION MANAGEMENT</span><span>Thoughtfully catalogued. Carefully circulated.</span></footer>
    </main>
  </div>;
}
