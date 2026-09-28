import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { initials, PRIORITY_COLOR, stageColor } from '../utils/format';

export const Badge = ({ color = '#6B7280', children, title }) => (
  <span className="badge" style={{ color, background: `${color}1A` }} title={title}>{children}</span>
);
export const StageBadge = ({ stage }) => <Badge color={stageColor(stage)}>{stage}</Badge>;
export const PriorityBadge = ({ priority, score }) => (
  <Badge color={PRIORITY_COLOR[priority]}>{score != null ? `${priority} · ${score}` : priority}</Badge>
);

export function Button({ variant = 'primary', icon: Icon, children, className = '', ...rest }) {
  return (
    <button type="button" className={`btn btn-${variant} ${className}`} {...rest}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Card({ title, action, children, className = '', pad = true }) {
  return (
    <section className={`card ${pad ? '' : 'card-flush'} ${className}`}>
      {(title || action) && (
        <header className="card-head">
          {title && <h2 className="card-title">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export const IconTile = ({ icon: Icon, color, size = 36 }) => (
  <span className="icon-tile" style={{ width: size, height: size, background: `${color}1A`, color }}>
    <Icon size={Math.round(size * 0.5)} aria-hidden="true" />
  </span>
);

export function Kpi({ icon, label, value, delta, color, down }) {
  return (
    <div className="kpi">
      <IconTile icon={icon} color={color} size={34} />
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {delta && <div className={`kpi-delta ${down ? 'down' : ''}`}>{delta}</div>}
    </div>
  );
}

export function ActionTile({ n, label, color, icon, onClick }) {
  return (
    <button type="button" className="action-tile" style={{ background: `${color}12`, borderColor: `${color}33` }} onClick={onClick}>
      <IconTile icon={icon} color={color} />
      <span>
        <span className="action-n" style={{ color }}>{n}</span>
        <span className="action-l">{label}</span>
      </span>
    </button>
  );
}

export const Avatar = ({ name, color = '#0B6B3A', size = 34 }) => (
  <span className="avatar" style={{ width: size, height: size, background: `${color}22`, color, fontSize: size * 0.36 }} aria-hidden="true">
    {initials(name)}
  </span>
);

// A person's photo from /public/people/<userId>.jpg, falling back to initials if the file is missing.
export function Photo({ id, name, color, size = 34 }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Avatar name={name} color={color} size={size} />;
  return <img className="photo" src={`/people/${id}.jpg`} alt="" width={size} height={size} onError={() => setFailed(true)} />;
}

export const Progress = ({ value, color = '#0B6B3A', height = 8 }) => (
  <div className="progress" style={{ height }} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
    <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
  </div>
);

export function Ring({ value, color, label, size = 128 }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E4E2DA" strokeWidth="13" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="13" strokeLinecap="round"
          strokeDasharray={`${(c * value) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="ring-text">{value}%</text>
      </svg>
      <div className="muted small center">{label}</div>
    </div>
  );
}

export function Modal({ title, onClose, children, footer, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector('input, select, textarea, button')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function Field({ label, error, hint, children, className = '' }) {
  return (
    <label className={`field ${error ? 'has-error' : ''} ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

// Options may be strings, { value, label } objects, or { group, options } for an <optgroup>.
const renderOption = (o) => (typeof o === 'string'
  ? <option key={o} value={o}>{o}</option>
  : <option key={o.value} value={o.value}>{o.label}</option>);

export const Select = ({ options, value, onChange, placeholder, ...rest }) => (
  <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => (o.group
      ? <optgroup key={o.group} label={o.group}>{o.options.map(renderOption)}</optgroup>
      : renderOption(o)))}
  </select>
);

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      <div className="page-actions">{children}</div>
    </div>
  );
}

export const Empty = ({ children }) => <div className="empty">{children}</div>;

export const KV = ({ items, cols = 2 }) => (
  <dl className="kv" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
    {items.map(([k, v]) => (
      <div key={k}><dt>{k}</dt><dd>{v || '—'}</dd></div>
    ))}
  </dl>
);
