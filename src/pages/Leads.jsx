import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarClock, Download, Flame, IndianRupee, MapPin, MessageCircle, Phone, Plus, Search, Trophy, UserPlus, Users } from 'lucide-react';
import { Photo, Select } from '../components/ui';
import { AddLeadModal } from '../components/Modals';
import { useAuth, useScopedLeads } from '../context/AppContext';
import { SOURCES, STAGE_META, STAGES, STATES, USERS } from '../data/mock';
import { downloadFile, firstName, inr, isOpen, PRIORITY_COLOR, relDay, toCSV, TODAY } from '../utils/format';

const PAGE = 10;
const INITIAL_COLORS = [['#E8F1FC', '#1D4ED8'], ['#EEF6F1', '#0B6B3A'], ['#F1EBFB', '#6D28D9'], ['#FDEBDC', '#C2410C'], ['#E3F7F4', '#0F766E']];
const initialsOf = (s = '') => s.split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const stageColor = (s) => STAGE_META[s]?.color || '#6B7280';
const Tag = ({ bg, color, children }) => <span className="dash-tag" style={{ background: bg || `${color}1A`, color }}>{children}</span>;

export default function Leads() {
  const leads = useScopedLeads();
  const { role } = useAuth();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(1);
  const tab = params.get('tab') || 'all';
  const q = params.get('q') || '';
  const [f, setF] = useState({ stage: '', state: '', source: '', owner: '', priority: '' });
  const t = TODAY();

  const setParam = (k, v) => {
    const p = new URLSearchParams(params);
    v ? p.set(k, v) : p.delete(k);
    setParams(p);
    setPage(1);
  };

  const tabs = [
    ['all', role === 'bde' ? 'My Leads' : 'All', () => true],
    ['hot', 'Hot', (l) => l.priority === 'Hot' && isOpen(l)],
    ['due', 'Follow-up due', (l) => isOpen(l) && l.followUp && l.followUp <= t],
    ...(role === 'bde' ? [] : [['unassigned', 'Unassigned', (l) => !l.owner && isOpen(l)]]),
    ['won', 'Won', (l) => l.stage === 'Won'],
  ];
  const count = (k) => leads.filter(tabs.find((x) => x[0] === k)?.[2] || (() => false)).length;

  const rows = useMemo(() => {
    const tabFn = (tabs.find((x) => x[0] === tab) || tabs[0])[2];
    const needle = q.toLowerCase();
    return leads
      .filter(tabFn)
      .filter((l) => !needle || [l.id, l.prospect, l.contact, l.constituency, l.district, l.state, l.mobile].join(' ').toLowerCase().includes(needle))
      .filter((l) => (!f.stage || l.stage === f.stage) && (!f.state || l.state === f.state) && (!f.source || l.source === f.source)
        && (!f.owner || l.owner === f.owner) && (!f.priority || l.priority === f.priority))
      .sort((a, b) => (a.followUp || '9').localeCompare(b.followUp || '9'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, tab, q, f]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice((page - 1) * PAGE, page * PAGE);
  const set = (k) => (v) => { setF((x) => ({ ...x, [k]: v })); setPage(1); };
  const anyFilter = Object.values(f).some(Boolean) || q;
  const open = leads.filter(isOpen);
  const due = leads.filter((l) => isOpen(l) && l.followUp && l.followUp <= t);
  const won = leads.filter((l) => l.stage === 'Won');
  const tabLabel = (tabs.find((x) => x[0] === tab) || tabs[0])[1];

  const exportCSV = () => {
    const head = ['Lead ID', 'Prospect', 'Contact', 'Designation', 'Constituency', 'District', 'State', 'Type', 'Source', 'Owner', 'Stage', 'Score', 'Priority', 'Deal value', 'Next action', 'Follow-up', 'Mobile'];
    const body = rows.map((l) => [l.id, l.prospect, l.contact, l.designation, l.constituency, l.district, l.state, l.type, l.source, firstName(l.owner), l.stage, l.score, l.priority, l.value, l.nextAction, l.followUp, l.mobile]);
    downloadFile(`neta360-leads-${t}.csv`, toCSV([head, ...body]));
  };

  const tiles = [
    ['all', Users, '#E9F6EC', '#2FA84F', leads.length, role === 'bde' ? 'My Leads' : 'Total Leads', `${open.length} open`],
    ['hot', Flame, '#FCE7E8', '#E5484D', count('hot'), 'Hot Leads', 'Score 75+'],
    ['due', CalendarClock, '#FDEBDC', '#F07A22', due.length, 'Follow-up Due', `${due.filter((l) => l.followUp < t).length} overdue`],
    ...(role === 'bde' ? [] : [['unassigned', UserPlus, '#E8F1FC', '#2A7DE1', count('unassigned'), 'Unassigned', 'Needs an owner']]),
    ['won', Trophy, '#E6F5EA', '#0F6B3A', won.length, 'Won', inr(won.reduce((a, l) => a + l.value, 0))],
  ];

  return (
    <>
      <section className="card ld-head">
        <div className="ld-head-top">
          <div className="ld-who">
            <span className="ld-avatar"><Users size={30} aria-hidden="true" /></span>
            <div>
              <h1>Leads</h1>
              <p className="muted small">Every prospect from first contact to contract. Search, filter, assign and act.</p>
            </div>
          </div>
          <div className="ld-actions">
            <button type="button" className="btn btn-ghost" onClick={exportCSV}><Download size={16} />Export CSV</button>
            {role !== 'ps' && <button type="button" className="btn btn-saffron ld-primary" onClick={() => setAdding(true)}><Plus size={16} />Add New Lead</button>}
          </div>
        </div>
        <ol className="ld-stages" aria-label="Filter by stage">
          {STAGES.map((s) => {
            const on = f.stage === s;
            const c = stageColor(s);
            return (
              <li key={s}>
                <button type="button" className="ld-stage lds-count" aria-pressed={on} title={on ? 'Show all stages' : `Show ${s} leads`}
                  style={on ? { background: c, color: '#fff' } : undefined} onClick={() => set('stage')(on ? '' : s)}>
                  <b style={{ color: on ? '#fff' : c }}>{leads.filter((l) => l.stage === s).length}</b>{s}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <div className={`kpi-row ${role === 'bde' ? 'kpi-5' : 'kpi-6'}`}>
        {tiles.map(([k, Icon, bg, color, value, label, note]) => (
          <button type="button" key={k} className={`bh-kpi lds-tile ${tab === k && k !== 'all' ? 'on' : ''}`} style={{ background: bg }} onClick={() => setParam('tab', k === 'all' ? '' : k)}>
            <span className="bh-kpi-ic" style={{ background: color, color: '#fff', borderRadius: 10 }}><Icon size={22} aria-hidden="true" /></span>
            <b>{value}</b><span className="bh-kpi-l">{label}</span><span className="bh-kpi-d">{note}</span>
          </button>
        ))}
        <div className="bh-kpi" style={{ background: '#F1EBFB' }}>
          <span className="bh-kpi-ic" style={{ background: '#8A5CD8', color: '#fff', borderRadius: 10 }}><IndianRupee size={22} aria-hidden="true" /></span>
          <b>{inr(open.reduce((a, l) => a + l.value, 0))}</b><span className="bh-kpi-l">Open Pipeline</span><span className="bh-kpi-d">Value of open deals</span>
        </div>
      </div>

      <section className="card lds-card">
        <div className="lds-head">
          <h2 className="card-title">{tab === 'all' ? (role === 'bde' ? 'My Leads' : 'All Leads') : `${tabLabel} Leads`}{f.stage && ` · ${f.stage}`}</h2>
          <div className="lds-pills" role="tablist">
            {tabs.map(([k, label, fn]) => (
              <button type="button" role="tab" key={k} aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setParam('tab', k === 'all' ? '' : k)}>
                {label}<span>{leads.filter(fn).length}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="filters lds-filters">
          <label className="lds-search"><Search size={16} aria-hidden="true" /><input type="search" aria-label="Search leads" placeholder="Search name, constituency, mobile…" value={q} onChange={(e) => setParam('q', e.target.value)} /></label>
          <Select aria-label="State" options={STATES} value={f.state} onChange={set('state')} placeholder="All states" />
          <Select aria-label="Source" options={SOURCES} value={f.source} onChange={set('source')} placeholder="All sources" />
          <Select aria-label="Priority" options={['Hot', 'Warm', 'Cold']} value={f.priority} onChange={set('priority')} placeholder="All priorities" />
          {role !== 'bde' && <Select aria-label="Owner" options={USERS.filter((u) => u.role === 'bde').map((u) => ({ value: u.id, label: u.name }))} value={f.owner} onChange={set('owner')} placeholder="All owners" />}
          {anyFilter && <button type="button" className="link" onClick={() => { setF({ stage: '', state: '', source: '', owner: '', priority: '' }); setParam('q', ''); }}>Clear filters</button>}
        </div>
        <div className="table-wrap">
          <table className="table clickable lds-table">
            <thead>
              <tr><th>Prospect</th><th>Constituency</th><th>Type · Source</th><th>Stage</th><th>Score</th><th>Owner</th><th>Follow-up</th><th className="right">Deal value</th><th><span className="sr-only">Quick actions</span></th></tr>
            </thead>
            <tbody>
              {view.map((l, i) => {
                const [bg, fg] = INITIAL_COLORS[(l.prospect.length + i) % INITIAL_COLORS.length];
                const late = isOpen(l) && l.followUp && l.followUp < t;
                const today = isOpen(l) && l.followUp === t;
                const pc = PRIORITY_COLOR[l.priority];
                return (
                  <tr key={l.id} onClick={() => nav(`/leads/${l.id}`)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && nav(`/leads/${l.id}`)}>
                    <td>
                      <div className="lds-pros">
                        <span className="lds-ini" style={{ background: bg, color: fg }}>{initialsOf(l.prospect)}</span>
                        <span><b>{l.prospect}</b><small>{l.id} · {l.contact}{l.designation && ` · ${l.designation}`}</small></span>
                      </div>
                    </td>
                    <td className="lds-loc"><span><MapPin size={13} aria-hidden="true" />{l.constituency}</span><small>{[l.district, l.state].filter(Boolean).join(', ')}</small></td>
                    <td>{l.type}<small className="lds-sub">{l.source}</small></td>
                    <td><Tag color={stageColor(l.stage)}>{l.stage}</Tag></td>
                    <td>
                      <div className="lds-score">
                        <Tag color={pc}>{l.priority} · {l.score}</Tag>
                        <span className="ld-meter"><i style={{ width: `${l.score}%`, background: pc }} /></span>
                      </div>
                    </td>
                    <td>{l.owner ? <span className="who"><Photo id={l.owner} name={firstName(l.owner)} size={28} />{firstName(l.owner)}</span> : <Tag color="#B91C1C">Unassigned</Tag>}</td>
                    <td>{isOpen(l) && l.followUp
                      ? <Tag bg={late ? '#FDECEC' : today ? '#FEF3C7' : '#EEF0F4'} color={late ? '#B91C1C' : today ? '#92400E' : '#3A4458'}>{relDay(l.followUp)}</Tag>
                      : '—'}</td>
                    <td className="right strong nowrap">{inr(l.value)}</td>
                    <td>
                      <div className="row gap-6" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <a className="icon-btn sq" href={`tel:+91${l.mobile}`} aria-label={`Call ${l.contact}`}><Phone size={15} color="#0B6B3A" /></a>
                        <a className="icon-btn sq" href={`https://wa.me/91${l.mobile}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${l.contact}`}><MessageCircle size={15} color="#0F9F8F" /></a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {view.length === 0 && <tr><td colSpan="9" className="empty">No leads match these filters. Clear the filters or add a new lead.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <span className="muted small">Showing {rows.length ? (page - 1) * PAGE + 1 : 0}–{Math.min(page * PAGE, rows.length)} of {rows.length} leads</span>
          <div className="row gap-6">
            {Array.from({ length: pages }, (_, i) => (
              <button type="button" key={i} className={`page-btn ${page === i + 1 ? 'on' : ''}`} onClick={() => setPage(i + 1)} aria-label={`Page ${i + 1}`}>{i + 1}</button>
            ))}
          </div>
        </div>
      </section>
      {adding && <AddLeadModal onClose={() => setAdding(false)} onCreated={(id) => nav(`/leads/${id}`)} />}
    </>
  );
}
