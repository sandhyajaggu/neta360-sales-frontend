import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code2, Headset, Lock, Mail, MonitorPlay, ShieldCheck, Smartphone, Trophy, User, Users } from 'lucide-react';
import { useAuth } from '../context/AppContext';
import { ROLES } from '../data/roles';
import { USERS } from '../data/mock';
import { Logo } from '../components/Layout';

const ICONS = { bde: User, bdm: Users, ps: MonitorPlay, cs: Headset, ts: Code2, bh: Trophy };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('bde');
  const [email, setEmail] = useState(USERS.find((u) => u.id === ROLES.bde.user).email);
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');

  const pick = (r) => {
    setRole(r);
    setEmail(USERS.find((u) => u.id === ROLES[r].user).email);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || password.length < 4) {
      setError('Enter your work email and a password of at least 4 characters.');
      return;
    }
    login(role);
    navigate(ROLES[role].home);
  };

  return (
    <div className="login">
      <aside className="login-brand">
        <Logo size={46} />
        <h1 className="login-headline">Digital operating system for a constituency.</h1>
        <p className="telugu">మీ నియోజకవర్గం మొత్తం ఒకే యాప్‌లో</p>
        <p className="login-copy">One sales and support workspace for the Neta360 team, covering every prospect from first contact to demo, proposal, pilot, contract and renewal.</p>
        <div className="login-pills">{['Manage', 'Connect', 'Serve', 'Analyze'].map((x) => <span key={x}>{x}</span>)}</div>
      </aside>

      <form className="login-form" onSubmit={submit}>
        <div>
          <div className="login-form-logo"><Logo dark={false} size={52} /></div>
          <h2>Sign in to Neta360 CRM</h2>
          <p className="muted">Choose your role. You will land on your own dashboard.</p>
        </div>
        <fieldset className="role-grid">
          <legend className="sr-only">Role</legend>
          {Object.values(ROLES).map((r) => { const Icon = ICONS[r.key]; return (
            <label key={r.key} className={`role-opt ${role === r.key ? 'on' : ''}`}>
              <input type="radio" name="role" value={r.key} checked={role === r.key} onChange={() => pick(r.key)} className="sr-only" />
              <span className="role-photo">
                <img src={`/roles/${r.key}.jpg`} alt="" width={44} height={44} />
                <span className="role-photo-badge" style={{ background: r.color }}><Icon size={11} /></span>
              </span>
              <span><b>{r.label}</b><span className="muted small">{r.desc}</span></span>
            </label>
          ); })}
        </fieldset>
        <label className="field">
          <span className="field-label">Work email or mobile</span>
          <span className="input-icon"><Mail size={16} aria-hidden="true" /><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></span>
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <span className="input-icon"><Lock size={16} aria-hidden="true" /><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></span>
        </label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary btn-lg">Sign in as {ROLES[role].label} <ArrowRight size={16} /></button>
        <button type="button" className="btn btn-ghost btn-lg" onClick={submit}><Smartphone size={16} /> Sign in with mobile OTP</button>
        <p className="muted small row gap-6"><ShieldCheck size={14} /> Demo mode: any password with 4+ characters works. Data is stored in this browser only.</p>
      </form>
    </div>
  );
}
