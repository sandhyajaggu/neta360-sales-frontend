import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, MessageCircle, Monitor, NotebookPen, Phone, PhoneCall, Plus, Target, Trophy, Users } from 'lucide-react';
import { BarRow, Card, ColorKpi, DashHero, PriorityBadge, StageBadge } from '../components/ui';
import { AddLeadModal, LogFollowUpModal } from '../components/Modals';
import { useAuth, useData, useScopedLeads, leadLabel } from '../context/AppContext';
import { BDE_TARGETS, day, MONTHLY_TARGETS } from '../data/mock';
import { firstName, greeting, inr, isOpen, MONTHS, relDay, TODAY } from '../utils/format';

const PIPE = [
  ['New Lead', ['New Lead'], '#1F66C9'], ['Contacted', ['Contacted'], '#2A8BE0'], ['Qualified', ['Qualified'], '#8A5CD8'],
  ['Demo', ['Demo Scheduled', 'Demo Completed', 'Requirement Collected'], '#F07A22'],
  ['Proposal', ['Proposal Sent', 'Negotiation'], '#F5B819'], ['Pilot', ['Pilot'], '#2FA84F'], ['Won', ['Won'], '#0F6B3A'],
];
const TARGET_COLORS = ['#2A7DE1', '#2FA84F', '#0F9F8F', '#F07A22', '#8A5CD8', '#EA6A1F'];

const shortDate = (iso) => `${Number(iso.slice(8))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
const clock = (hm) => { const [h, m] = hm.split(':').map(Number); return `${String(((h + 11) % 12) + 1).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };

export default function DashBDE() {
  const { user } = useAuth();
  const { demos, proposals, leads: all } = useData();
  const leads = useScopedLeads();
  const nav = useNavigate();
  const [logging, setLogging] = useState(null);
  const [adding, setAdding] = useState(false);
  const t = TODAY();

  const queue = leads
    .filter((l) => isOpen(l) && l.followUp && l.followUp <= day(1))
    .sort((a, b) => a.followUp.localeCompare(b.followUp) || b.score - a.score);
  const overdue = queue.filter((l) => l.followUp < t).length;
  const myIds = new Set(leads.map((l) => l.id));
  const myDemos = demos.filter((d) => d.status === 'Scheduled' && myIds.has(d.leadId) && d.date >= t)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const myProposals = proposals.filter((p) => myIds.has(p.leadId));
  const won = leads.filter((l) => l.stage === 'Won');
  const target = MONTHLY_TARGETS[user.id] || 1;
  // Won value plus half of late-stage deals, the same weighting the BDM team view uses.
  const achieved = won.reduce((a, l) => a + l.value, 0) + leads.filter((l) => ['Pilot', 'Negotiation'].includes(l.stage)).reduce((a, l) => a + l.value * 0.5, 0);
  const pct = Math.round((achieved / target) * 100);
  const done = BDE_TARGETS.reduce((a, [, d]) => a + d, 0);
  const total = BDE_TARGETS.reduce((a, [, , tt]) => a + tt, 0);
  const pipeMax = Math.max(1, ...PIPE.map(([, st]) => leads.filter((l) => st.includes(l.stage)).length));

  return (
    <>
      <DashHero title="My Dashboard" greeting={`${greeting()}, ${user.name.split(' ')[0]}!`} sub="Start with overdue follow-ups, then today's demos.">
        <button type="button" className="btn btn-saffron btn-lg" onClick={() => setAdding(true)}><Plus size={18} /> Add New Lead</button>
      </DashHero>

      <div className="kpi-row kpi-6">
        <ColorKpi icon={Users} bg="#E9F6EC" color="#2FA84F" value={leads.length} label="My Leads" note={`${leads.filter((l) => l.createdAt >= day(-7)).length} new this week`} up />
        <ColorKpi icon={PhoneCall} bg="#FDEBDC" color="#F07A22" value={queue.length} label="Follow-ups Due" note={`${overdue} overdue`} />
        <ColorKpi icon={Monitor} bg="#F1EBFB" color="#8A5CD8" value={myDemos.filter((d) => d.date <= day(7)).length} label="Demos This Week" note={`${myDemos.filter((d) => d.date === t).length} today`} />
        <ColorKpi icon={FileText} bg="#FCE7E8" color="#E5484D" value={myProposals.length} label="Proposals" note={`${myProposals.filter((p) => p.status.startsWith('Pending')).length} awaiting approval`} />
        <ColorKpi icon={Trophy} bg="#E6F5EA" color="#2FA84F" value={won.length} label="Won" note={inr(won.reduce((a, l) => a + l.value, 0))} up />
        <ColorKpi icon={Target} bg="#E8F1FC" color="#2A7DE1" round value={`${pct}%`} label="Monthly Target" note={`${inr(achieved)} of ${inr(target)}`} />
      </div>

      <div className="cols cols-main-side">
        <Card title="Today's Tasks" action={<button type="button" className="link" onClick={() => nav('/leads?tab=due')}>View all</button>}>
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
        <Card title="Today's Targets" action={<span className="chip">{Math.round((done / total) * 100)}% done</span>}>
          <div className="bars">
            {BDE_TARGETS.map(([label, d, tt], i) => <BarRow key={label} label={label} value={d} max={tt} color={TARGET_COLORS[i % TARGET_COLORS.length]} shown={`${d}/${tt}`} />)}
          </div>
        </Card>
      </div>

      <div className="cols dash-2">
        <Card title="My Pipeline" action={<button type="button" className="link" onClick={() => nav('/pipeline')}>Open board</button>}>
          <div className="bars">
            {PIPE.map(([label, stages, color]) => <BarRow key={label} label={label} value={leads.filter((l) => stages.includes(l.stage)).length} max={pipeMax} color={color} />)}
          </div>
          <div className="row between"><span className="muted">Open deal value</span><b>{inr(leads.filter(isOpen).reduce((a, l) => a + l.value, 0))}</b></div>
        </Card>
        <Card title="Upcoming Demos" action={<button type="button" className="link" onClick={() => nav('/demos')}>View all</button>}>
          {myDemos.length === 0 ? <p className="muted">No demos booked. Book one from a qualified lead.</p> : (
            <ul className="dash-list">
              {myDemos.slice(0, 4).map((d) => (
                <li key={d.id}>
                  <Link to={`/leads/${d.leadId}`} className="dash-row">
                    <span className="dash-time">{d.date === t ? 'Today' : shortDate(d.date)}<br />{clock(d.time)}</span>
                    <span className="dash-w">{leadLabel(all.find((l) => l.id === d.leadId))}<small>{d.type} · {d.playbook} · with {firstName(d.conductedBy)}</small></span>
                    <span className="dash-tag" style={{ background: '#E6F5EA', color: '#166534' }}>{d.type}</span>
                  </Link>
                </li>
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
