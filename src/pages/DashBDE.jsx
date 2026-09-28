import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, NotebookPen, Phone, Plus } from 'lucide-react';
import { Badge, Button, Card, PageHead, PriorityBadge, Progress, StageBadge } from '../components/ui';
import { AddLeadModal, LogFollowUpModal } from '../components/Modals';
import { useAuth, useData, useScopedLeads, leadLabel } from '../context/AppContext';
import { BDE_TARGETS, day, STAGE_META } from '../data/mock';
import { inr, isOpen, relDay, TODAY } from '../utils/format';
import { ActionCenter } from './DashBusinessHead';

const PIPE = [['New', ['New Lead']], ['Contacted', ['Contacted']], ['Qualified', ['Qualified']], ['Demo', ['Demo Scheduled', 'Demo Completed', 'Requirement Collected']], ['Proposal', ['Proposal Sent', 'Negotiation', 'Pilot']], ['Won', ['Won']]];

export default function DashBDE() {
  const { user } = useAuth();
  const { demos, leads: all } = useData();
  const leads = useScopedLeads();
  const nav = useNavigate();
  const [logging, setLogging] = useState(null);
  const [adding, setAdding] = useState(false);
  const t = TODAY();

  const queue = leads
    .filter((l) => isOpen(l) && l.followUp && l.followUp <= day(1))
    .sort((a, b) => a.followUp.localeCompare(b.followUp) || b.score - a.score);
  const openValue = leads.filter(isOpen).reduce((a, l) => a + l.value, 0);
  const done = BDE_TARGETS.reduce((a, [, d]) => a + d, 0);
  const total = BDE_TARGETS.reduce((a, [, , tt]) => a + tt, 0);
  const myIds = new Set(leads.map((l) => l.id));
  const schedule = [
    ...demos.filter((d) => d.date === t && d.status === 'Scheduled' && myIds.has(d.leadId)).map((d) => ({ time: d.time, title: `Demo · ${leadLabel(all.find((l) => l.id === d.leadId))}`, sub: `${d.type} with Product Support`, color: '#6D28D9', to: '/demos' })),
    ...leads.filter((l) => isOpen(l) && l.followUp === t).map((l, i) => ({ time: ['11:00', '12:30', '15:30', '17:30'][i % 4], title: `${l.nextAction} · ${leadLabel(l)}`, sub: 'Follow-up', color: '#0B6B3A', to: `/leads/${l.id}` })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <>
      <PageHead title={`Good morning, ${user.name.split(' ')[0]}`} sub="Start with overdue follow-ups, then today’s demos.">
        <Button variant="primary" icon={Plus} onClick={() => setAdding(true)}>Add lead</Button>
      </PageHead>
      <ActionCenter cols={6} />

      <div className="cols cols-main-side">
        <Card title="Follow-up queue" action={<span className="chip">Overdue, today and tomorrow</span>}>
          {queue.length === 0 ? <p className="muted">No follow-ups due. Pick new prospects from My Leads.</p> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Prospect</th><th>Stage</th><th>Next action</th><th>Due</th><th>Priority</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {queue.map((l) => (
                    <tr key={l.id}>
                      <td><Link to={`/leads/${l.id}`} className="strong">{leadLabel(l)}</Link><div className="muted small">{l.contact} · {l.designation}</div></td>
                      <td><StageBadge stage={l.stage} /></td>
                      <td>{l.nextAction}</td>
                      <td className={`nowrap ${l.followUp < t ? 'danger strong' : ''}`}>{relDay(l.followUp)}</td>
                      <td><PriorityBadge priority={l.priority} /></td>
                      <td>
                        <div className="row gap-6">
                          <a className="icon-btn sq" href={`tel:+91${l.mobile}`} aria-label={`Call ${l.contact}`}><Phone size={16} color="#0B6B3A" /></a>
                          <a className="icon-btn sq" href={`https://wa.me/91${l.mobile}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${l.contact}`}><MessageCircle size={16} color="#0F766E" /></a>
                          <button type="button" className="icon-btn sq" aria-label="Log update" onClick={() => setLogging(l)}><NotebookPen size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Today's targets" action={<Badge color="#0B6B3A">{Math.round((done / total) * 100)}% done</Badge>}>
          <div className="stack gap-14">
            {BDE_TARGETS.map(([label, d, tt], i) => (
              <div key={label} className="stack gap-6">
                <div className="row between small"><span>{label}</span><b>{d} / {tt}</b></div>
                <Progress value={(d / tt) * 100} color={['#1D4ED8', '#0B6B3A', '#0F766E', '#B45309', '#6D28D9', '#EA6A1F'][i]} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="cols cols-2">
        <Card title="My pipeline" action={<button type="button" className="link" onClick={() => nav('/pipeline')}>Open board</button>}>
          <div className="pipe-bar">
            {PIPE.map(([label, stages]) => {
              const n = leads.filter((l) => stages.includes(l.stage)).length;
              return n ? <div key={label} style={{ flex: n, background: STAGE_META[stages[stages.length - 1]].color }} title={label}>{label} · {n}</div> : null;
            })}
          </div>
          <div className="row between"><span className="muted">Open deal value</span><b>{inr(openValue)}</b></div>
        </Card>
        <Card title="Today's schedule">
          {schedule.length === 0 ? <p className="muted">Nothing scheduled. Book a demo from a qualified lead.</p> : (
            <ul className="schedule">
              {schedule.map((s, i) => (
                <li key={i}><Link to={s.to}><span className="bar" style={{ background: s.color }} /><b className="time">{s.time}</b><span><b>{s.title}</b><span className="muted small">{s.sub}</span></span></Link></li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      {logging && <LogFollowUpModal lead={logging} onClose={() => setLogging(null)} />}
      {adding && <AddLeadModal onClose={() => setAdding(false)} onCreated={(id) => nav(`/leads/${id}`)} />}
    </>
  );
}
