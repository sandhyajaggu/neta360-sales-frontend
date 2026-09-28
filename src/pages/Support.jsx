import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Activity, Bug, Check, CheckCircle2, Clock, GraduationCap, Inbox, MonitorPlay,
  Plus, RefreshCw, Rocket, Server, ShieldCheck, Ticket,
} from 'lucide-react';
import { BarRow, Badge, Button, Card, ColorKpi, DashHero, DashItem, Field, KV, Modal, PageHead, Progress, Select } from '../components/ui';
import { useAuth, useData, useToast, leadLabel } from '../context/AppContext';
import { ONBOARDING_STEPS, SYSTEM_HEALTH, day } from '../data/mock';
import { firstName, fmtDate, greeting, relDay, TODAY, userName } from '../utils/format';

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

// ---------------------------------------------------------------- Product Support
export function ProductSupport() {
  const { requests, demos, leads, customers, dispatch } = useData();
  const { user, role } = useAuth();
  const toast = useToast();
  const t = TODAY();
  // Product specialists see the demos they run; the Business Head sees all of them.
  const myDemos = demos.filter((d) => d.status === 'Scheduled' && d.date >= t && (role !== 'ps' || d.conductedBy === user.id))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <>
      <DashHero title="Product Support" greeting={`${greeting()}, ${user.name.split(' ')[0]}!`} sub="Product demos, training, configuration and feature guidance." />
      <div className="kpi-row kpi-5">
        <ColorKpi icon={Inbox} bg="#E8F1FC" color="#2A7DE1" value={requests.filter((r) => r.status === 'New').length} label="New Requests" note={`${requests.filter((r) => r.due === t).length} due today`} />
        <ColorKpi icon={Clock} bg="#FDF6D8" color="#F5B819" value={requests.filter((r) => ['In progress', 'Scheduled'].includes(r.status)).length} label="In Progress" note={`${requests.filter((r) => r.status === 'Escalated').length} escalated`} />
        <ColorKpi icon={CheckCircle2} bg="#E6F5EA" color="#2FA84F" value={requests.filter((r) => r.status === 'Resolved').length} label="Resolved" note="Requests closed" />
        <ColorKpi icon={MonitorPlay} bg="#F1EBFB" color="#8A5CD8" value={myDemos.length} label="Demos Scheduled" note={`${myDemos.filter((d) => d.date === t).length} today`} />
        <ColorKpi icon={GraduationCap} bg="#FDEBDC" color="#F07A22" value={TRAININGS.length} label="Trainings This Week" note={`${TRAININGS.reduce((a, [, , n]) => a + n, 0)} users`} />
      </div>
      <div className="cols cols-main-side">
        <Card title="Product Requests">
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
        <Card title={role === 'ps' ? 'Demos Assigned to Me' : 'Upcoming Demos'}>
          {myDemos.length === 0 ? <p className="muted">No demos scheduled.</p> : (
            <ul className="dash-list">
              {myDemos.slice(0, 5).map((d) => {
                const lead = leads.find((l) => l.id === d.leadId);
                return (
                  <li key={d.id}>
                    <Link to={`/leads/${d.leadId}`} className="dash-row">
                      <span className="dash-time">{d.date === t ? 'Today' : fmtDate(d.date)}<br />{d.time}</span>
                      <span className="dash-w">{leadLabel(lead)}<small>{d.type} · {d.playbook} · booked by {firstName(lead?.owner)}</small></span>
                      <span className="dash-tag" style={{ background: d.date === t ? '#E6F5EA' : '#FEF3C7', color: d.date === t ? '#166534' : '#92400E' }}>{d.date === t ? 'Today' : 'Prep'}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
      <div className="cols dash-eq">
        <Card title="Feature Feedback Themes" action={<span className="chip">Last 30 days</span>}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[['Grievance', 34], ['WhatsApp', 28], ['Booth', 21], ['Reports', 17], ['Mobile', 12], ['AI', 9]].map(([n, v]) => ({ n, v }))} margin={{ top: 16, left: -24, right: 0 }}>
              <XAxis dataKey="n" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#F6F5F1' }} />
              <Bar dataKey="v" name="Mentions" radius={[6, 6, 2, 2]} label={{ position: 'top', fontSize: 11 }}>
                {['#2A7DE1', '#2FA84F', '#F07A22', '#8A5CD8', '#0F9F8F', '#9AA3AF'].map((c) => <Cell key={c} fill={c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Onboarding Configuration" action={<Link to="/onboarding" className="link">Open</Link>}>
          <div className="bars">
            {customers.map((c) => {
              const pct = Math.round((c.steps.filter(Boolean).length / c.steps.length) * 100);
              return <BarRow key={c.id} label={c.name} value={pct} max={100} color={pct === 100 ? '#2FA84F' : pct >= 40 ? '#F5B819' : '#F07A22'} shown={`${pct}%`} />;
            })}
          </div>
        </Card>
      </div>
    </>
  );
}

const TRAININGS = [['Campaign agency, Bengaluru', 'Field staff app', 18], ['MLA Office, Kukatpally', 'Admin training', 6], ['MP Office, Medak (pilot)', 'Grievance workflow', 10]];

// ---------------------------------------------------------------- Customer Support
export function CustomerSupport() {
  const { tickets, customers, dispatch } = useData();
  const { user } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);
  const open = tickets.filter((t) => t.status !== 'Resolved');
  const renewals = customers.filter((c) => c.contractEnd <= day(45)).sort((a, b) => a.contractEnd.localeCompare(b.contractEnd));
  const sla = (p) => { const all = tickets.filter((t) => t.priority === p); return all.length ? Math.round((all.filter((t) => t.slaHours >= 0).length / all.length) * 100) : 100; };

  return (
    <>
      <DashHero title="Customer Support" greeting={`${greeting()}, ${user.name.split(' ')[0]}!`} sub="Customer onboarding, queries, SLA and renewals.">
        <button type="button" className="btn btn-saffron btn-lg" onClick={() => setAdding(true)}><Plus size={18} /> New Ticket</button>
      </DashHero>
      <div className="kpi-row kpi-5">
        <ColorKpi icon={Ticket} bg="#FCE7E8" color="#E5484D" value={open.length} label="Open Tickets" note={`${open.filter((t) => t.priority === 'High').length} high priority`} />
        <ColorKpi icon={Clock} bg="#FDF6D8" color="#F5B819" value={tickets.filter((t) => t.status === 'In progress').length} label="In Progress" note={`${open.filter((t) => t.slaHours >= 0 && t.slaHours <= 2).length} near SLA`} />
        <ColorKpi icon={CheckCircle2} bg="#E6F5EA" color="#2FA84F" value={tickets.filter((t) => t.status === 'Resolved').length} label="Resolved" note="Tickets closed" />
        <ColorKpi icon={ShieldCheck} bg="#E8F1FC" color="#2A7DE1" round value={`${Math.round((tickets.filter((t) => t.slaHours >= 0).length / (tickets.length || 1)) * 100)}%`} label="SLA Compliance" note="Target 95%" />
        <ColorKpi icon={RefreshCw} bg="#E3F7F4" color="#0F9F8F" value={renewals.length} label="Renewals Due" note="Next 45 days" />
      </div>
      <div className="cols cols-main-side">
        <Card title="Customer Tickets" action={<Select aria-label="Filter status" options={['Open', 'In progress', 'Resolved']} value={filter} onChange={setFilter} placeholder="All statuses" />}>
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
        <Card title="SLA by Priority" action={<span className="chip">This month</span>}>
          <div className="bars">
            {[['High · 4h', 'High', '#E5484D'], ['Medium · 8h', 'Medium', '#F5B819'], ['Low · 24h', 'Low', '#2FA84F']].map(([label, p, c]) => <BarRow key={p} label={label} value={sla(p)} max={100} color={c} shown={`${sla(p)}%`} />)}
          </div>
          <p className="muted small">Breached tickets escalate to Technical Support and notify the BDM.</p>
        </Card>
      </div>
      <div className="cols dash-eq">
        <Card title="Onboarding Progress" action={<Link to="/onboarding" className="link">Open</Link>}>
          <div className="bars">
            {customers.map((c) => {
              const pct = Math.round((c.steps.filter(Boolean).length / c.steps.length) * 100);
              return <BarRow key={c.id} label={c.name} value={pct} max={100} color={pct === 100 ? '#2FA84F' : pct >= 40 ? '#F5B819' : '#F07A22'} shown={`${pct}%`} />;
            })}
          </div>
        </Card>
        <Card title="Renewal Follow-ups">
          {renewals.length === 0 ? <p className="muted">No renewals in the next 45 days.</p> : (
            <ul className="dash-list">
              {renewals.map((c) => (
                <DashItem key={c.id} icon={RefreshCw} color={c.health >= 70 ? '#0F9F8F' : '#F07A22'} title={c.name}
                  sub={`Renews ${fmtDate(c.contractEnd)} · health ${c.health} · ${firstName(c.accountManager)}`} tag={relDay(c.contractEnd)} />
              ))}
            </ul>
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
const RESOLVED_PER_WEEK = [['W35', 4], ['W36', 6], ['W37', 5], ['W38', 8], ['W39', 7], ['W40', 9]];

export function TechSupport() {
  const { issues, tickets, dispatch } = useData();
  const { user } = useAuth();
  const toast = useToast();
  const escalated = tickets.filter((t) => t.escalated && t.status !== 'Resolved');
  const openIssues = issues.filter((i) => i.status !== 'Resolved');
  return (
    <>
      <DashHero title="Technical Support" greeting={`${greeting()}, ${user.name.split(' ')[0]}!`} sub="Bug fixes, integrations, server and system support." />
      <div className="kpi-row kpi-5">
        <ColorKpi icon={Bug} bg="#FCE7E8" color="#E5484D" value={openIssues.length} label="Open Issues" note={`${openIssues.filter((i) => i.severity === 'Critical').length} critical`} />
        <ColorKpi icon={Clock} bg="#FDF6D8" color="#F5B819" value={issues.filter((i) => i.status === 'In progress').length} label="In Progress" note={`${escalated.length} escalated tickets`} />
        <ColorKpi icon={CheckCircle2} bg="#E6F5EA" color="#2FA84F" value={issues.filter((i) => i.status === 'Resolved').length} label="Resolved" note="Issues closed" />
        <ColorKpi icon={Activity} bg="#E8F1FC" color="#2A7DE1" round value="99.9%" label="Uptime" note="Last 30 days" />
        <ColorKpi icon={Rocket} bg="#F1EBFB" color="#8A5CD8" value="v2.14.0" label="Next Deployment" note={`${fmtDate(day(4))} · 22:00 IST`} />
      </div>
      <div className="cols cols-main-side">
        <Card title="Issues & Escalations">
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
        <Card title="System Health" action={<Badge color="#0B6B3A">Live</Badge>}>
          <ul className="dash-list">
            {SYSTEM_HEALTH.map(([n, s, m]) => (
              <DashItem key={n} icon={Server} color={s === 'Operational' ? '#2FA84F' : '#F07A22'} title={n} sub={m} tag={s} />
            ))}
          </ul>
        </Card>
      </div>
      <div className="cols dash-eq">
        <Card title="Issues Resolved per Week" action={<span className="chip">Last 6 weeks</span>}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RESOLVED_PER_WEEK.map(([w, v]) => ({ w, v }))} margin={{ top: 18, left: -24, right: 0 }}>
              <XAxis dataKey="w" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#D5D3CB' }} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#F6F5F1' }} />
              <Bar dataKey="v" name="Resolved" fill="#2A7DE1" barSize={30} radius={[3, 3, 0, 0]} label={{ position: 'top', fontSize: 11, fontWeight: 600 }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Deployments">
          <ul className="dash-list">
            <DashItem icon={Rocket} color="#8A5CD8" title="v2.14.0 · grievance SLA timers" sub={`${fmtDate(day(4))} · staging passed`} tag="Scheduled" />
            <DashItem icon={Rocket} color="#2FA84F" title="v2.13.2 · booth sync hotfix" sub={fmtDate(day(-4))} tag="Deployed" />
            <DashItem icon={Rocket} color="#2FA84F" title="v2.13.1 · Telugu SMS encoding fix" sub={fmtDate(day(-7))} tag="Deployed" />
          </ul>
        </Card>
      </div>
    </>
  );
}
