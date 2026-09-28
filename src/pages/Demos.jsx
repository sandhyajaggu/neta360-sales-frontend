import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarDays, CalendarPlus, CheckCircle2, MonitorPlay, Target } from 'lucide-react';
import { Badge, Button, Card, Field, IconTile, Kpi, Modal, PageHead, Select } from '../components/ui';
import { ScheduleDemoModal } from '../components/Modals';
import { useAuth, useData, useScopedLeads, useToast, leadLabel } from '../context/AppContext';
import { PLAYBOOKS, day } from '../data/mock';
import { firstName, fmtDate, TODAY } from '../utils/format';

const STATUS_COLOR = { Scheduled: '#1D4ED8', Completed: '#0B6B3A', Cancelled: '#B91C1C' };

export default function Demos() {
  const { demos, leads, dispatch } = useData();
  const scoped = useScopedLeads();
  const { user, role } = useAuth();
  const toast = useToast();
  const [scheduling, setScheduling] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [status, setStatus] = useState('');
  const ids = new Set(scoped.map((l) => l.id));
  const mine = demos.filter((d) => ids.has(d.leadId)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const week = Array.from({ length: 5 }, (_, i) => day(i));
  const t = TODAY();
  const lead = (id) => leads.find((l) => l.id === id);
  const completed = mine.filter((d) => d.status === 'Completed');
  const toProposal = completed.filter((d) => ['Requirement Collected', 'Proposal Sent', 'Negotiation', 'Pilot', 'Won'].includes(lead(d.leadId)?.stage)).length;

  return (
    <>
      <PageHead title="Demo management" sub="Product Support runs the demo; the BDE owns the follow-up.">
        <Button icon={CalendarPlus} onClick={() => setScheduling(true)}>Schedule demo</Button>
      </PageHead>
      <div className="kpi-row kpi-4">
        <Kpi icon={CalendarDays} label="Scheduled this week" value={mine.filter((d) => d.status === 'Scheduled' && d.date >= t && d.date <= day(6)).length} delta={`${mine.filter((d) => d.date === t && d.status === 'Scheduled').length} today`} color="#1D4ED8" />
        <Kpi icon={CheckCircle2} label="Completed" value={completed.length} delta="All time in this demo" color="#0B6B3A" />
        <Kpi icon={Target} label="Demo → proposal" value={`${completed.length ? Math.round((toProposal / completed.length) * 100) : 0}%`} delta="Target 30%" color="#6D28D9" />
        <Kpi icon={AlertTriangle} label="Cancelled / no-show" value={mine.filter((d) => d.status === 'Cancelled').length} color="#B91C1C" down />
      </div>

      <div className="cols cols-main-side">
        <div className="stack gap-20">
          <Card title="Demo calendar · next 5 days">
            <div className="week">
              {week.map((d) => (
                <div key={d} className={`week-day ${d === t ? 'today' : ''}`}>
                  <div className="week-h">{new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' })}</div>
                  {mine.filter((x) => x.date === d && x.status !== 'Cancelled').sort((a, b) => a.time.localeCompare(b.time)).map((x) => (
                    <Link key={x.id} to={`/leads/${x.leadId}`} className={`ev ${x.type === 'Online' ? 'ev-on' : 'ev-off'}`}>
                      <span className="small strong">{x.time} · {x.type}</span>
                      <span className="small">{leadLabel(lead(x.leadId))}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </Card>
          <Card title="Demo log" action={<Select aria-label="Filter status" options={['Scheduled', 'Completed', 'Cancelled']} value={status} onChange={setStatus} placeholder="All statuses" />}>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Lead</th><th>Date</th><th>Type</th><th>Conducted by</th><th>Playbook</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {mine.filter((d) => !status || d.status === status).map((d) => (
                    <tr key={d.id}>
                      <td><Link to={`/leads/${d.leadId}`} className="strong">{leadLabel(lead(d.leadId))}</Link>{d.feedback && <div className="muted small">“{d.feedback}”</div>}</td>
                      <td>{fmtDate(d.date)} {d.time}</td>
                      <td>{d.type}</td>
                      <td>{firstName(d.conductedBy)}</td>
                      <td>{d.playbook}</td>
                      <td><Badge color={STATUS_COLOR[d.status]}>{d.status}</Badge></td>
                      <td>
                        {d.status === 'Scheduled' && ['ps', 'bde', 'bdm', 'bh'].includes(role) && (
                          <div className="row gap-6">
                            <Button variant="ghost" className="btn-sm" onClick={() => setCompleting(d)}>Complete</Button>
                            <Button variant="ghost" className="btn-sm" onClick={() => { dispatch({ type: 'cancelDemo', id: d.id }); toast('Demo cancelled'); }}>Cancel</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <Card title="Demo playbooks">
          <p className="muted small">A political office should understand Neta360 within 10 minutes.</p>
          {PLAYBOOKS.map((p, i) => (
            <div key={p.name} className="playbook">
              <div className="row gap-10"><IconTile icon={MonitorPlay} color={['#0B6B3A', '#C2410C', '#6D28D9'][i]} size={30} /><b>{p.name}</b></div>
              <p className="small">{p.flow}</p>
            </div>
          ))}
          <p className="note warm">Demo constituency dataset: 2,35,000 citizens, 293 booths, 18 mandals/wards, 1,240 volunteers, 4,850 grievances, 326 development works and 78 events.</p>
        </Card>
      </div>
      {scheduling && <ScheduleDemoModal onClose={() => setScheduling(false)} />}
      {completing && <CompleteDemo demo={completing} lead={lead(completing.leadId)} onClose={() => setCompleting(null)} onSave={(v) => { dispatch({ type: 'completeDemo', id: completing.id, ...v, by: user.id }); toast(v.interested ? 'Demo completed · lead moved to Demo Completed' : 'Demo completed · lead marked lost'); setCompleting(null); }} />}
    </>
  );
}

function CompleteDemo({ demo, lead, onClose, onSave }) {
  const [feedback, setFeedback] = useState('');
  const [interested, setInterested] = useState('Yes');
  const [attendees, setAttendees] = useState(demo.attendees);
  return (
    <Modal title={`Complete demo · ${leadLabel(lead)}`} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={() => onSave({ feedback, interested: interested === 'Yes', attendees: Number(attendees) })}>Save feedback</Button></>}>
      <div className="stack">
        <Field label="Customer feedback"><textarea className="input" rows="3" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What did they like? What is the priority?" /></Field>
        <div className="form-grid">
          <Field label="Interested?"><Select options={['Yes', 'No']} value={interested} onChange={setInterested} /></Field>
          <Field label="Attendees"><input className="input" type="number" min="1" value={attendees} onChange={(e) => setAttendees(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}
