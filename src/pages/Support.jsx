import { useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle, BookOpen, Check, CheckCircle2, Clock, Code2, Inbox, KeyRound, Mail, MessageCircle, MonitorPlay,
  Plus, RefreshCw, Rocket, Server, ShieldCheck, Users,
} from 'lucide-react';
import { Badge, Button, Card, Field, IconTile, Kpi, KV, Modal, PageHead, Progress, Select } from '../components/ui';
import { useAuth, useData, useToast } from '../context/AppContext';
import { ONBOARDING_STEPS, SYSTEM_HEALTH, day } from '../data/mock';
import { firstName, fmtDate, relDay, userName } from '../utils/format';

const PRI = { High: '#B91C1C', Critical: '#B91C1C', Medium: '#B45309', Low: '#0B6B3A' };
const ST = { Open: '#1D4ED8', 'In progress': '#B45309', Resolved: '#0B6B3A', New: '#1D4ED8', Scheduled: '#6D28D9', Escalated: '#B91C1C', 'Waiting on vendor': '#6D28D9' };
const slaText = (t) => (t.status === 'Resolved' ? 'Met' : t.slaHours < 0 ? 'Breached' : t.slaHours === 0 ? 'Due now' : `${t.slaHours}h left`);

function StatusSelect({ value, options, onChange, label }) {
  return (
    <select className="input input-sm" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} style={{ color: ST[value] || 'inherit', fontWeight: 600 }}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function ListRows({ items }) {
  return (
    <ul className="list">
      {items.map(([Icon, color, title, sub, badge, bc]) => (
        <li key={title}><IconTile icon={Icon} color={color} size={32} /><span className="grow"><b>{title}</b><span className="muted small">{sub}</span></span>{badge && <Badge color={bc}>{badge}</Badge>}</li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------- Product Support
export function ProductSupport() {
  const { requests, demos, dispatch } = useData();
  const toast = useToast();
  return (
    <>
      <PageHead title="Product support dashboard" sub="Product demos, training, configuration and feature guidance." />
      <div className="kpi-row kpi-4">
        <Kpi icon={Inbox} label="New requests" value={requests.filter((r) => r.status === 'New').length} color="#1D4ED8" />
        <Kpi icon={Clock} label="In progress" value={requests.filter((r) => ['In progress', 'Scheduled'].includes(r.status)).length} color="#B45309" />
        <Kpi icon={CheckCircle2} label="Resolved" value={requests.filter((r) => r.status === 'Resolved').length} color="#0B6B3A" />
        <Kpi icon={MonitorPlay} label="Demos scheduled" value={demos.filter((d) => d.status === 'Scheduled').length} delta={`${demos.filter((d) => d.status === 'Completed').length} completed`} color="#6D28D9" />
      </div>
      <div className="cols cols-main-side">
        <Card title="Product requests">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Request</th><th>Client</th><th>Type</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="strong">{r.title}<div className="muted small">{r.id}</div></td><td>{r.client}</td><td>{r.type}</td>
                    <td>{firstName(r.owner)}</td><td>{relDay(r.due)}</td>
                    <td><StatusSelect label={`Status of ${r.id}`} value={r.status} options={['New', 'In progress', 'Scheduled', 'Escalated', 'Resolved']} onChange={(v) => { dispatch({ type: 'updateRequest', id: r.id, patch: { status: v } }); toast(`${r.id} is now ${v}`); }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Feature feedback themes" action={<span className="chip">Last 30 days</span>}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[['Grievance', 34], ['WhatsApp', 28], ['Booth', 21], ['Reports', 17], ['Mobile', 12], ['AI', 9]].map(([n, v]) => ({ n, v }))} margin={{ top: 16, left: -24, right: 0 }}>
              <XAxis dataKey="n" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#F6F5F1' }} />
              <Bar dataKey="v" name="Mentions" radius={[6, 6, 2, 2]} label={{ position: 'top', fontSize: 11 }}>
                {['#0B6B3A', '#0F766E', '#1D4ED8', '#6D28D9', '#EA6A1F', '#9CA3AF'].map((c) => <Cell key={c} fill={c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="cols cols-2">
        <Card title="Knowledge base">
          <ListRows items={[[BookOpen, '#0B6B3A', 'Run the MLA demo in 10 minutes', 'Playbook', 'Pinned', '#0B6B3A'], [BookOpen, '#1D4ED8', 'Configure mandals, wards and booths', 'Guide · 12 min read', 'Guide', '#1D4ED8'], [BookOpen, '#6D28D9', 'Field staff app onboarding checklist', 'Checklist', 'Checklist', '#6D28D9'], [BookOpen, '#C2410C', 'Demo constituency dataset reference', 'Data sheet', 'Data', '#C2410C']]} />
        </Card>
        <Card title="Upcoming trainings">
          <ListRows items={[[Users, '#6D28D9', 'Campaign agency, Bengaluru', `${fmtDate(day(2))} · Field staff app · 18 users`, 'Online', '#1D4ED8'], [Users, '#6D28D9', 'MLA Office, Kukatpally', `${fmtDate(day(4))} · Admin training · 6 users`, 'Offline', '#C2410C'], [Users, '#6D28D9', 'MP Office, Medak (pilot)', `${fmtDate(day(7))} · Grievance workflow · 10 users`, 'Online', '#1D4ED8']]} />
        </Card>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Customer Support
export function CustomerSupport() {
  const { tickets, customers, dispatch } = useData();
  const toast = useToast();
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);
  const open = tickets.filter((t) => t.status !== 'Resolved');
  const renewals = customers.filter((c) => c.contractEnd <= day(45)).sort((a, b) => a.contractEnd.localeCompare(b.contractEnd));
  const sla = (p) => { const all = tickets.filter((t) => t.priority === p); return all.length ? Math.round((all.filter((t) => t.slaHours >= 0).length / all.length) * 100) : 100; };

  return (
    <>
      <PageHead title="Customer support dashboard" sub="Tickets, onboarding, user queries, SLA and renewals.">
        <Button icon={Plus} onClick={() => setAdding(true)}>New ticket</Button>
      </PageHead>
      <div className="kpi-row kpi-5">
        <Kpi icon={Inbox} label="Open tickets" value={open.length} delta={`${open.filter((t) => t.priority === 'High').length} high priority`} color="#B91C1C" />
        <Kpi icon={Clock} label="In progress" value={tickets.filter((t) => t.status === 'In progress').length} color="#B45309" />
        <Kpi icon={CheckCircle2} label="Resolved" value={tickets.filter((t) => t.status === 'Resolved').length} color="#0B6B3A" />
        <Kpi icon={ShieldCheck} label="SLA compliance" value={`${Math.round((tickets.filter((t) => t.slaHours >= 0).length / tickets.length) * 100)}%`} delta="Target 95%" color="#1D4ED8" />
        <Kpi icon={RefreshCw} label="Renewals due" value={renewals.length} delta="Next 45 days" color="#0F766E" />
      </div>
      <div className="cols cols-main-side">
        <Card title="Customer tickets" action={<Select aria-label="Filter status" options={['Open', 'In progress', 'Resolved']} value={filter} onChange={setFilter} placeholder="All statuses" />}>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Ticket</th><th>Customer</th><th>Priority</th><th>SLA</th><th>Assigned</th><th>Status</th><th><span className="sr-only">Escalate</span></th></tr></thead>
              <tbody>
                {tickets.filter((t) => !filter || t.status === filter).map((t) => (
                  <tr key={t.id}>
                    <td><b>{t.id}</b> {t.subject}<div className="muted small">{t.category}{t.escalated && ' · escalated to Tech'}</div></td>
                    <td>{t.customer}</td>
                    <td><Badge color={PRI[t.priority]}>{t.priority}</Badge></td>
                    <td className={t.slaHours < 0 && t.status !== 'Resolved' ? 'danger strong' : ''}>{slaText(t)}</td>
                    <td>{firstName(t.assignedTo)}</td>
                    <td><StatusSelect label={`Status of ${t.id}`} value={t.status} options={['Open', 'In progress', 'Resolved']} onChange={(v) => { dispatch({ type: 'updateTicket', id: t.id, patch: { status: v } }); toast(`${t.id} is now ${v}`); }} /></td>
                    <td>{!t.escalated && t.status !== 'Resolved' && <Button variant="ghost" className="btn-sm" onClick={() => { dispatch({ type: 'updateTicket', id: t.id, patch: { escalated: true, assignedTo: 'u10' } }); toast(`${t.id} escalated to Technical Support`); }}>Escalate</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="SLA by priority">
          {[['High', '4h response', '#B91C1C'], ['Medium', '8h response', '#B45309'], ['Low', '24h response', '#0B6B3A']].map(([p, r, c]) => (
            <div key={p} className="stack gap-6"><div className="row between small"><span>{p} · {r}</span><b>{sla(p)}%</b></div><Progress value={sla(p)} color={c} /></div>
          ))}
          <p className="muted small">Breached tickets escalate to Technical Support and notify the BDM.</p>
        </Card>
      </div>
      <div className="cols cols-2">
        <Card title="Customer health">
          {customers.map((c) => {
            const color = c.health >= 80 ? '#0B6B3A' : c.health >= 65 ? '#B45309' : '#B91C1C';
            return <div key={c.id} className="health"><span className="grow"><b>{c.name}</b><span className="muted small">{c.package}</span></span><span style={{ width: 140 }}><Progress value={c.health} color={color} /></span><b style={{ color, width: 32 }}>{c.health}</b></div>;
          })}
        </Card>
        <Card title="Renewal follow-ups">
          {renewals.length === 0 ? <p className="muted">No renewals in the next 45 days.</p> : (
            <ListRows items={renewals.map((c) => [RefreshCw, '#0F766E', c.name, `Renews ${fmtDate(c.contractEnd)} · account manager ${firstName(c.accountManager)}`, relDay(c.contractEnd), '#B45309'])} />
          )}
        </Card>
      </div>
      {adding && <NewTicket customers={customers} onClose={() => setAdding(false)} onSave={(t) => { dispatch({ type: 'addTicket', ticket: t }); toast('Ticket created'); setAdding(false); }} />}
    </>
  );
}

function NewTicket({ customers, onClose, onSave }) {
  const [f, setF] = useState({ customer: customers[0]?.name || '', subject: '', category: 'Access', priority: 'Medium' });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));
  const slaHours = { High: 4, Medium: 8, Low: 24 }[f.priority];
  return (
    <Modal title="New support ticket" onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={!f.subject.trim()} onClick={() => onSave({ ...f, slaHours, assignedTo: 'u9' })}>Create ticket</Button></>}>
      <div className="stack">
        <Field label="Customer"><Select options={customers.map((c) => c.name)} value={f.customer} onChange={set('customer')} /></Field>
        <Field label="Subject"><input className="input" value={f.subject} onChange={set('subject')} placeholder="Describe the issue" /></Field>
        <div className="form-grid">
          <Field label="Category"><Select options={['Access', 'Data', 'Reports', 'Users', 'Training', 'Other']} value={f.category} onChange={set('category')} /></Field>
          <Field label="Priority" hint={`SLA: ${slaHours}h response`}><Select options={['High', 'Medium', 'Low']} value={f.priority} onChange={set('priority')} /></Field>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------- Onboarding
export function Onboarding() {
  const { customers, dispatch } = useData();
  const { role } = useAuth();
  const toast = useToast();
  const [sel, setSel] = useState(customers[0]?.id);
  const c = customers.find((x) => x.id === sel) || customers[0];
  if (!c) return <Card><p className="muted">No customers yet. Won deals appear here automatically.</p></Card>;
  const pct = Math.round((c.steps.filter(Boolean).length / c.steps.length) * 100);
  const canEdit = ['cs', 'ps', 'bh'].includes(role);

  return (
    <>
      <PageHead title="Customer onboarding" sub="When a deal is marked Won, the customer appears here automatically." />
      <div className="cols cols-onb">
        <Card title="Onboarding queue">
          <ul className="queue">
            {customers.map((x) => {
              const p = Math.round((x.steps.filter(Boolean).length / x.steps.length) * 100);
              return (
                <li key={x.id}>
                  <button type="button" className={x.id === c.id ? 'on' : ''} onClick={() => setSel(x.id)}>
                    <span className="row between"><b>{x.name}</b><span className="small">{p === 100 ? 'Live' : `${p}%`}</span></span>
                    <Progress value={p} color={p === 100 ? '#0B6B3A' : '#B45309'} height={6} />
                    <span className="muted small">Go-live {fmtDate(x.goLive)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title={`Onboarding tracker · ${c.name}`} action={<Badge color={pct === 100 ? '#0B6B3A' : '#B45309'}>{pct === 100 ? 'Live' : `${pct}% complete`}</Badge>}>
          <Progress value={pct} color="#0B6B3A" height={10} />
          <ol className="checklist">
            {ONBOARDING_STEPS.map((s, i) => (
              <li key={s} className={c.steps[i] ? 'done' : ''}>
                <button type="button" disabled={!canEdit} aria-pressed={c.steps[i]} onClick={() => { dispatch({ type: 'toggleStep', id: c.id, index: i }); toast(c.steps[i] ? `Reopened: ${s}` : `Completed: ${s}`); }}>
                  <span className="check">{c.steps[i] ? <Check size={14} /> : i + 1}</span>
                  <span className="grow">{s}</span>
                  <Badge color={c.steps[i] ? '#0B6B3A' : '#6B7280'}>{c.steps[i] ? 'Done' : 'Pending'}</Badge>
                </button>
              </li>
            ))}
          </ol>
        </Card>
        <Card title="Account">
          <KV cols={1} items={[['Customer ID', c.id], ['Package', c.package], ['Contract', `${fmtDate(c.contractStart)} – ${fmtDate(c.contractEnd)}`], ['Account manager', userName(c.accountManager)], ['Implementation', userName(c.implManager)], ['Support contact', userName(c.supportContact)], ['Go-live target', fmtDate(c.goLive)]]} />
        </Card>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- Technical Support
export function TechSupport() {
  const { issues, tickets, dispatch } = useData();
  const toast = useToast();
  const escalated = tickets.filter((t) => t.escalated && t.status !== 'Resolved');
  return (
    <>
      <PageHead title="Technical support dashboard" sub="Bugs, integrations, server and system health, security and deployments." />
      <div className="kpi-row kpi-4">
        <Kpi icon={AlertTriangle} label="Open issues" value={issues.filter((i) => i.status !== 'Resolved').length} delta={`${issues.filter((i) => i.severity === 'Critical' && i.status !== 'Resolved').length} critical`} color="#B91C1C" />
        <Kpi icon={Inbox} label="Escalated tickets" value={escalated.length} delta="From Customer Support" color="#B45309" />
        <Kpi icon={CheckCircle2} label="Resolved issues" value={issues.filter((i) => i.status === 'Resolved').length} color="#0B6B3A" />
        <Kpi icon={Rocket} label="Next deployment" value="v2.14.0" delta={`${fmtDate(day(4))} · 22:00 IST`} color="#1D4ED8" />
      </div>
      <div className="cols cols-main-side">
        <Card title="Issues and bugs">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Issue</th><th>Customer</th><th>Area</th><th>Severity</th><th>Status</th></tr></thead>
              <tbody>
                {issues.map((i) => (
                  <tr key={i.id}>
                    <td><b>{i.id}</b> {i.title}</td><td>{i.customer}</td><td>{i.area}</td>
                    <td><Badge color={PRI[i.severity]}>{i.severity}</Badge></td>
                    <td><StatusSelect label={`Status of ${i.id}`} value={i.status} options={['Open', 'In progress', 'Waiting on vendor', 'Resolved']} onChange={(v) => { dispatch({ type: 'updateIssue', id: i.id, patch: { status: v } }); toast(`${i.id} is now ${v}`); }} /></td>
                  </tr>
                ))}
                {escalated.map((t) => (
                  <tr key={t.id}>
                    <td><b>{t.id}</b> {t.subject}<div className="muted small">Escalated ticket</div></td><td>{t.customer}</td><td>{t.category}</td>
                    <td><Badge color={PRI[t.priority]}>{t.priority}</Badge></td>
                    <td><Button variant="ghost" className="btn-sm" onClick={() => { dispatch({ type: 'updateTicket', id: t.id, patch: { status: 'Resolved' } }); toast(`${t.id} resolved`); }}>Mark resolved</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="System health" action={<Badge color="#0B6B3A">Live</Badge>}>
          <ListRows items={SYSTEM_HEALTH.map(([n, s, m]) => [Server, s === 'Operational' ? '#0B6B3A' : '#B45309', n, m, s, s === 'Operational' ? '#0B6B3A' : '#B45309'])} />
        </Card>
      </div>
      <div className="cols cols-2">
        <Card title="Integrations">
          <ListRows items={[[MessageCircle, '#0F766E', 'WhatsApp Business API', '4 customers connected', 'Degraded', '#B45309'], [Mail, '#1D4ED8', 'SMS gateway (DLT templates)', '6 customers connected', 'Healthy', '#0B6B3A'], [Code2, '#6D28D9', 'Public REST API', '2 consultants connected', 'Healthy', '#0B6B3A'], [KeyRound, '#0F1F3A', 'SSO / OTP login', 'All customers', 'Healthy', '#0B6B3A']]} />
        </Card>
        <Card title="Deployments">
          <ListRows items={[[Rocket, '#1D4ED8', 'v2.14.0 · grievance SLA timers', `${fmtDate(day(4))} · staging passed`, 'Scheduled', '#1D4ED8'], [Rocket, '#0B6B3A', 'v2.13.2 · booth sync hotfix', fmtDate(day(-4)), 'Deployed', '#0B6B3A'], [Rocket, '#0B6B3A', 'v2.13.1 · Telugu SMS encoding fix', fmtDate(day(-7)), 'Deployed', '#0B6B3A']]} />
        </Card>
      </div>
    </>
  );
}

