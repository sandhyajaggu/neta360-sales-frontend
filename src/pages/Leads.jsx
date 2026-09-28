import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, Plus, X } from 'lucide-react';
import { Button, Card, PageHead, PriorityBadge, Select, StageBadge } from '../components/ui';
import { AddLeadModal } from '../components/Modals';
import { useAuth, useScopedLeads } from '../context/AppContext';
import { SOURCES, STAGES, STATES, USERS } from '../data/mock';
import { downloadFile, firstName, inr, isOpen, relDay, toCSV, TODAY } from '../utils/format';

const PAGE = 10;

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
    ['all', role === 'bde' ? 'My leads' : 'All leads', () => true],
    ['hot', 'Hot', (l) => l.priority === 'Hot' && isOpen(l)],
    ['due', 'Follow-up due', (l) => isOpen(l) && l.followUp && l.followUp <= t],
    ...(role === 'bde' ? [] : [['unassigned', 'Unassigned', (l) => !l.owner && isOpen(l)]]),
    ['won', 'Won', (l) => l.stage === 'Won'],
  ];

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

  const exportCSV = () => {
    const head = ['Lead ID', 'Prospect', 'Contact', 'Designation', 'Constituency', 'District', 'State', 'Type', 'Source', 'Owner', 'Stage', 'Score', 'Priority', 'Deal value', 'Next action', 'Follow-up', 'Mobile'];
    const body = rows.map((l) => [l.id, l.prospect, l.contact, l.designation, l.constituency, l.district, l.state, l.type, l.source, firstName(l.owner), l.stage, l.score, l.priority, l.value, l.nextAction, l.followUp, l.mobile]);
    downloadFile(`neta360-leads-${t}.csv`, toCSV([head, ...body]));
  };

  return (
    <>
      <PageHead title="Leads" sub="Every prospect from first contact to contract. Search, filter, assign and act.">
        <Button variant="ghost" icon={Download} onClick={exportCSV}>Export CSV</Button>
        {role !== 'ps' && <Button icon={Plus} onClick={() => setAdding(true)}>Add new lead</Button>}
      </PageHead>
      <Card>
        <div className="tabs" role="tablist">
          {tabs.map(([k, label, fn]) => (
            <button type="button" role="tab" key={k} aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setParam('tab', k === 'all' ? '' : k)}>
              {label} <span className="tab-n">{leads.filter(fn).length}</span>
            </button>
          ))}
        </div>
        <div className="filters">
          <input className="input" type="search" aria-label="Search leads" placeholder="Search name, constituency, mobile…" value={q} onChange={(e) => setParam('q', e.target.value)} />
          <Select aria-label="Stage" options={STAGES} value={f.stage} onChange={set('stage')} placeholder="All stages" />
          <Select aria-label="State" options={STATES} value={f.state} onChange={set('state')} placeholder="All states" />
          <Select aria-label="Source" options={SOURCES} value={f.source} onChange={set('source')} placeholder="All sources" />
          <Select aria-label="Priority" options={['Hot', 'Warm', 'Cold']} value={f.priority} onChange={set('priority')} placeholder="All priorities" />
          {role !== 'bde' && <Select aria-label="Owner" options={USERS.filter((u) => u.role === 'bde').map((u) => ({ value: u.id, label: u.name }))} value={f.owner} onChange={set('owner')} placeholder="All owners" />}
          {anyFilter && <Button variant="ghost" icon={X} onClick={() => { setF({ stage: '', state: '', source: '', owner: '', priority: '' }); setParam('q', ''); }}>Clear</Button>}
        </div>
        <div className="table-wrap">
          <table className="table clickable">
            <thead>
              <tr><th>Lead ID</th><th>Prospect</th><th>Constituency</th><th>Type</th><th>Source</th><th>Stage</th><th>Score</th><th>Owner</th><th>Follow-up</th><th className="right">Deal value</th></tr>
            </thead>
            <tbody>
              {view.map((l) => (
                <tr key={l.id} onClick={() => nav(`/leads/${l.id}`)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && nav(`/leads/${l.id}`)}>
                  <td className="muted">{l.id}</td>
                  <td><b>{l.prospect}</b><div className="muted small">{l.contact}{l.designation && ` · ${l.designation}`}</div></td>
                  <td>{l.constituency}<div className="muted small">{l.state}</div></td>
                  <td>{l.type}</td>
                  <td>{l.source}</td>
                  <td><StageBadge stage={l.stage} /></td>
                  <td><PriorityBadge priority={l.priority} score={l.score} /></td>
                  <td>{l.owner ? firstName(l.owner) : <span className="danger">Unassigned</span>}</td>
                  <td className={isOpen(l) && l.followUp && l.followUp < t ? 'danger strong' : ''}>{isOpen(l) ? relDay(l.followUp) : '—'}</td>
                  <td className="right strong">{inr(l.value)}</td>
                </tr>
              ))}
              {view.length === 0 && <tr><td colSpan="10" className="empty">No leads match these filters. Clear the filters or add a new lead.</td></tr>}
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
      </Card>
      {adding && <AddLeadModal onClose={() => setAdding(false)} onCreated={(id) => nav(`/leads/${id}`)} />}
    </>
  );
}
