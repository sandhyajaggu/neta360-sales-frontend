import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, ChevronDown, LogOut, Menu, RotateCcw, Search, Repeat } from 'lucide-react';
import { useAuth, useData, useScopedLeads, useToast } from '../context/AppContext';
import { navFor, ROLES } from '../data/roles';
import { isOpen, relDay, shortToday, TODAY } from '../utils/format';
import { Photo } from './ui';

// Brand mark: orange and green arcs over two cupped leaves, a leader with raised arms between two supporters.
export function LogoMark({ size = 36, dark = true }) {
  const green = dark ? '#34A36B' : '#1E7B3A';
  const orange = '#EA6A1F';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M4.7 24.7A16 16 0 0 1 22.5 4.2" fill="none" stroke={orange} strokeWidth="3" strokeLinecap="round" />
      <path d="M25.5 5A16 16 0 0 1 35.3 24.7" fill="none" stroke={green} strokeWidth="3" strokeLinecap="round" />
      <path d="M3.8 23.2C4.4 31.5 11 36.6 19.4 36.9C17.6 31 12.5 26.8 3.8 23.2z" fill={green} />
      <path d="M36.2 23.2C35.6 31.5 29 36.6 20.6 36.9C22.4 31 27.5 26.8 36.2 23.2z" fill={green} />
      <circle cx="11.3" cy="19.6" r="2.1" fill={green} />
      <circle cx="28.7" cy="19.6" r="2.1" fill={green} />
      <path d="M7.6 18.8l3.6 4.6 3.6-4.2M32.4 18.8l-3.6 4.6-3.6-4.2" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.3 23.6l.6 4.4M28.7 23.6l-.6 4.4" stroke={green} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="20" cy="12.6" r="3.1" fill={orange} />
      <path d="M13.8 14.6l4.4 5.4M26.2 14.6l-4.4 5.4" stroke={orange} strokeWidth="3.3" strokeLinecap="round" />
      <path d="M20 19.2v9.4" stroke={orange} strokeWidth="6.4" strokeLinecap="round" />
    </svg>
  );
}

// The "0" of Neta360: an orange-to-green ring around a supporter.
function LogoZero({ green }) {
  return (
    <svg className="logo-zero" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M4.6 20.6A11.5 11.5 0 1 1 24.8 10.1" fill="none" stroke="#EA6A1F" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M25.5 13A11.5 11.5 0 0 1 8.3 24" fill="none" stroke={green} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="14" cy="11" r="3" fill={green} />
      <path d="M8.3 20.5c0-3.6 2.6-5.6 5.7-5.6s5.7 2 5.7 5.6z" fill={green} />
    </svg>
  );
}

export function Logo({ dark = true, size = 36 }) {
  const green = dark ? '#34A36B' : '#1E7B3A';
  return (
    <div className="logo" role="img" aria-label="Neta360">
      <LogoMark size={size} dark={dark} />
      <div>
        <div className="logo-word" style={{ fontSize: size * 0.62, color: green }}>
          Neta<span>36</span><LogoZero green={green} />
        </div>
        <div className="logo-sub" style={{ color: dark ? 'var(--side)' : 'var(--muted)' }}>Sales &amp; Support CRM</div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { role, roleInfo, user, logout, login } = useAuth();
  const { dispatch } = useData();
  const leads = useScopedLeads();
  const toast = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null); // 'bell' | 'user'
  const [navOpen, setNavOpen] = useState(false);

  const today = TODAY();
  const alerts = leads
    .filter((l) => isOpen(l) && l.followUp && l.followUp <= today && ['bh', 'bdm', 'bde'].includes(role))
    .sort((a, b) => a.followUp.localeCompare(b.followUp))
    .slice(0, 8);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/leads?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="app">
      <nav className={`sidebar ${navOpen ? 'open' : ''}`} aria-label="Main">
        <div className="sidebar-logo"><Logo dark={false} size={40} /></div>
        {navFor(role).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="nav-item" onClick={() => setNavOpen(false)}>
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
        <div className="grow" />
        {role === 'bh' ? (
          <div className="side-foot">
            <svg className="side-dome" viewBox="0 0 150 120" fill="#fff" aria-hidden="true">
              <rect x="72" y="0" width="2" height="26" /><path d="M74 2h14l-3 4 3 4H74z" />
              <path d="M30 60a45 34 0 0 1 90 0z" /><rect x="24" y="60" width="102" height="6" /><rect x="8" y="66" width="134" height="6" />
              {[14, 26, 38, 50, 62, 83, 95, 107, 119, 131].map((x) => <rect key={x} x={x} y="74" width="5" height="34" />)}
              <rect x="0" y="108" width="150" height="12" />
            </svg>
            <p>Manage<br />Connect<br />Serve<br />Analyze</p>
          </div>
        ) : (
          <div className="role-card">
            <div className="role-card-k">Signed in as</div>
            <div className="role-card-v">{roleInfo.label}</div>
            <div className="role-card-s">Access limited to your role</div>
          </div>
        )}
      </nav>
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}

      <div className="main-col">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setNavOpen(true)}><Menu size={20} /></button>
          <form className="search" onSubmit={onSearch} role="search">
            <Search size={16} aria-hidden="true" />
            <input type="search" aria-label="Search leads" placeholder="Search leads, contacts, constituencies…" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="grow" />
          <div className="today"><CalendarDays size={20} aria-hidden="true" /><span>Today<b>{shortToday()}</b></span></div>

          <div className="pop-wrap">
            <button type="button" className="icon-btn bell" aria-label={`Notifications: ${alerts.length}`} aria-expanded={open === 'bell'} onClick={() => setOpen(open === 'bell' ? null : 'bell')}>
              <Bell size={18} />
              {alerts.length > 0 && <span className="dot">{alerts.length}</span>}
            </button>
            {open === 'bell' && (
              <div className="popover" onMouseLeave={() => setOpen(null)}>
                <div className="popover-title">Follow-ups due</div>
                {alerts.length === 0 && <div className="muted small">You are all caught up.</div>}
                {alerts.map((l) => (
                  <button type="button" key={l.id} className="pop-row" onClick={() => { setOpen(null); navigate(`/leads/${l.id}`); }}>
                    <span><b>{l.prospect}, {l.constituency}</b><br /><span className="muted small">{l.nextAction}</span></span>
                    <span className={`small ${l.followUp < today ? 'danger' : ''}`}>{relDay(l.followUp)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pop-wrap">
            <button type="button" className="user-btn" aria-expanded={open === 'user'} onClick={() => setOpen(open === 'user' ? null : 'user')}>
              <Photo id={user.id} name={user.name} color={roleInfo.color} size={42} />
              <span className="user-meta"><b>{user.name}</b><span>{roleInfo.label}</span></span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
            {open === 'user' && (
              <div className="popover popover-right" onMouseLeave={() => setOpen(null)}>
                <div className="popover-title"><Repeat size={14} /> Switch role (demo)</div>
                {Object.values(ROLES).map((r) => (
                  <button type="button" key={r.key} className={`pop-row ${r.key === role ? 'active' : ''}`}
                    onClick={() => { login(r.key); setOpen(null); navigate(r.home); }}>
                    <span>{r.label}</span><span className="muted small">{r.desc}</span>
                  </button>
                ))}
                <hr />
                <button type="button" className="pop-row" onClick={() => { dispatch({ type: 'reset' }); setOpen(null); toast('Demo data reset'); }}>
                  <span><RotateCcw size={14} /> Reset demo data</span>
                </button>
                <button type="button" className="pop-row" onClick={() => { logout(); navigate('/login'); }}>
                  <span><LogOut size={14} /> Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
