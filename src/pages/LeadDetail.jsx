import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarClock, CalendarPlus, Check, ChevronRight, CircleCheck, ClipboardList, FileText, Flame, Handshake, Hourglass,
  IndianRupee, Landmark, Mail, MapPin, MessageCircle, MonitorPlay, Percent, Phone, PlusCircle, RefreshCw, TrendingUp,
  Trophy, User, XCircle,
} from 'lucide-react';
import { Card, Field, Select } from '../components/ui';
import { LostReasonModal, ScheduleDemoModal } from '../components/Modals';
import { useAuth, useData, useToast, probOf } from '../context/AppContext';
import { MODULES, STAGES, USERS, day } from '../data/mock';
import { firstName, fmtDate, inr, initials, PRIORITY_COLOR, relDay, TODAY, userName } from '../utils/format';

const ACT_ICON = {
  call: [Phone, '#1D4ED8'], whatsapp: [MessageCircle, '#0F9F8F'], meeting: [Handshake, '#EA6A1F'], email: [Mail, '#6D28D9'],
  demo: [MonitorPlay, '#6D28D9'], proposal: [FileText, '#B45309'], audit: [ClipboardList, '#0B6B3A'], stage: [RefreshCw, '#6B7280'],
  create: [PlusCircle, '#0B6B3A'], update: [RefreshCw, '#6B7280'], won: [Trophy, '#0B6B3A'],
};
const FILTERS = [['all', 'All', null], ['calls', 'Calls', ['call', 'whatsapp', 'meeting', 'email']], ['demo', 'Demos', ['demo']], ['proposal', 'Proposals', ['proposal']]];
const CHANNELS = [['call', 'Call', Phone], ['whatsapp', 'WhatsApp', MessageCircle], ['meeting', 'Meeting', Handshake], ['email', 'Email', Mail]];
const FLOW = STAGES.filter((s) => s !== 'Lost');
const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));

export default function LeadDetail() {
  const { id } = useParams();
  const { leads, activities, proposals, demos, dispatch } = useData();
  const { user, role } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const lead = leads.find((l) => l.id === id);
  const [demoOpen, setDemoOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [editMods, setEditMods] = useState(false);
  const [filter, setFilter] = useState('all');
  const [fu, setFu] = useState({ channel: 'call', conversation: '', nextAction: lead?.nextAction || '', followUp: day(2), stage: '' });

  if (!lead) return <Card><p>Lead {id} was not found. <Link to="/leads">Back to leads</Link></p></Card>;
  if (role === 'bde' && lead.owner !== user.id) return <Card><p>This lead belongs to another BDE. <Link to="/leads">Back to my leads</Link></p></Card>;

  const t = TODAY();
  const canEdit = ['bde', 'bdm', 'bh'].includes(role);
  const idx = FLOW.indexOf(lead.stage);
  const acts = activities.filter((a) => a.leadId === lead.id);
  const shownActs = acts.filter((a) => { const f = FILTERS.find(([k]) => k === filter)[2]; return !f || f.includes(a.type); });
  const leadProps = proposals.filter((p) => p.leadId === lead.id);
  const leadDemos = demos.filter((d) => d.leadId === lead.id).sort((a, b) => b.date.localeCompare(a.date));
  const prob = probOf(lead.stage);
  const overdue = lead.followUp && lead.followUp < t && lead.stage !== 'Won' && lead.stage !== 'Lost';
  // Date each stage was reached, when the activity history records it.
  const stageDate = (s) => acts.find((a) => a.type === 'stage' && a.title === `Stage changed to ${s}`)?.at || (s === 'New Lead' ? lead.createdAt : null);
  const curSince = stageDate(lead.stage);
  const setF = (k) => (v) => setFu((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));

  const move = (stage) => {
    if (!canEdit) return;
    dispatch({ type: 'moveStage', id: lead.id, stage, by: user.id });
    toast(`Moved to ${stage}`);
  };
  const saveFollowUp = () => {
    if (!fu.conversation.trim()) return toast('Add a short note about the conversation', 'warn');
    dispatch({ type: 'logFollowUp', id: lead.id, ...fu, stage: fu.stage || null, by: user.id });
    setFu((x) => ({ ...x, conversation: '', stage: '' }));
    toast('Follow-up saved');
  };
  const toggleModule = (m) => {
    const modules = lead.modules.includes(m) ? lead.modules.filter((x) => x !== m) : [...lead.modules, m];
    dispatch({ type: 'updateLead', id: lead.id, patch: { modules }, by: user.id });
  };

  return (
    <>
      <nav className="crumbs ld-crumbs" aria-label="Breadcrumb"><Link to="/leads">Leads</Link><ChevronRight size={14} aria-hidden="true" />{lead.prospect}, {lead.constituency}</nav>

      <section className="card ld-head">
        <div className="ld-head-top">
          <div className="ld-who">
            <span className="ld-avatar"><Landmark size={30} aria-hidden="true" /></span>
            <div>
              <h1>{lead.prospect}, {lead.constituency}</h1>
              <div className="ld-meta">
                <span>{lead.id}</span>
                <span><MapPin size={14} aria-hidden="true" />{[lead.constituency, lead.district, lead.state].filter(Boolean).join(' · ')}</span>
                <span><User size={14} aria-hidden="true" />Owner: {userName(lead.owner)}</span>
              </div>
              <div className="ld-tags">
                <Tag color={PRIORITY_COLOR[lead.priority]}>{lead.priority} · {lead.score}</Tag>
                <Tag color="#1D4ED8">{lead.type}</Tag>
                <Tag color="#6D28D9">Source: {lead.source}</Tag>
                <Tag color="#92400E">Timeline: {lead.timeline}</Tag>
                {overdue && <Tag color="#B91C1C">Follow-up overdue {daysBetween(lead.followUp, t)} days</Tag>}
                {lead.stage === 'Lost' && <Tag color="#B91C1C">Lost: {lead.lostReason}</Tag>}
              </div>
            </div>
          </div>
          <div className="ld-actions">
            <a className="btn btn-ghost ld-call" href={`tel:+91${lead.mobile}`}><Phone size={16} />Call</a>
            <a className="btn btn-ghost ld-wa" href={`https://wa.me/91${lead.mobile}`} target="_blank" rel="noreferrer"><MessageCircle size={16} />WhatsApp</a>
            {canEdit && <button type="button" className="btn btn-ghost" onClick={() => setDemoOpen(true)}><CalendarPlus size={16} />Schedule demo</button>}
            {canEdit && lead.stage !== 'Lost' && <button type="button" className="btn btn-ghost" onClick={() => setLostOpen(true)}><XCircle size={16} />Mark lost</button>}
            {canEdit && <button type="button" className="btn btn-saffron ld-primary" onClick={() => nav(`/proposals/new?lead=${lead.id}`)}><FileText size={16} />Create proposal</button>}
          </div>
        </div>
        <ol className="ld-stages" aria-label="Lead stage">
          {FLOW.map((s, i) => {
            const state = lead.stage === 'Lost' ? '' : i < idx ? 'done' : i === idx ? 'cur' : '';
            const when = state === 'cur' ? `Current${curSince ? ` · ${daysBetween(curSince, t)} days` : ''}` : state === 'done' && stageDate(s) ? fmtDate(stageDate(s)) : '';
            return (
              <li key={s}>
                <button type="button" className={`ld-stage ${state}`} disabled={!canEdit} onClick={() => move(s)}
                  aria-current={state === 'cur' ? 'step' : undefined} title={canEdit ? `Move to ${s}` : s}>
                  {s}{when && <small>{when}</small>}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="kpi-row kpi-6">
        <Tile icon={IndianRupee} bg="#E9F6EC" color="#2FA84F" value={inr(lead.value)} label="Deal Value" note={lead.users ? `${lead.users} users` : 'Set the deal value below'} />
        <Tile icon={Percent} bg="#E8F1FC" color="#2A7DE1" value={`${prob}%`} label="Win Probability" meter={prob} />
        <Tile icon={TrendingUp} bg="#E3F7F4" color="#0F9F8F" value={inr((lead.value * prob) / 100)} label="Expected Revenue" note="Value × probability" />
        <Tile icon={Flame} bg="#FCE7E8" color="#E5484D" value={lead.score} label={`Lead Score · ${lead.priority}`} meter={lead.score} />
        <Tile icon={CalendarClock} bg="#FDEBDC" color="#F07A22" value={lead.followUp ? relDay(lead.followUp) : '—'} label="Next Follow-up" note={lead.nextAction} />
        <Tile icon={Hourglass} bg="#F1EBFB" color="#8A5CD8" value={lead.createdAt ? `${daysBetween(lead.createdAt, t)} days` : '—'} label="In Pipeline" note={lead.createdAt ? `Created ${fmtDate(lead.createdAt)}` : ''} />
      </div>

      <div className="ld-grid">
        <div className="ld-col">
          <div className="ld-two">
            <Card title="Contact">
              <div className="ld-contact">
                <span className="ld-initials">{initials(lead.contact || lead.prospect)}</span>
                <span className="ld-contact-w"><b>{lead.contact || '—'}</b><small>{[lead.designation, lead.mobile && `+91 ${lead.mobile}`].filter(Boolean).join(' · ')}</small></span>
                <a className="icon-btn sq" href={`tel:+91${lead.mobile}`} aria-label={`Call ${lead.contact}`}><Phone size={16} color="#0B6B3A" /></a>
                <a className="icon-btn sq" href={`https://wa.me/91${lead.mobile}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${lead.contact}`}><MessageCircle size={16} color="#0F9F8F" /></a>
              </div>
              <div className="ld-loc">
                <div><small>State</small><b>{lead.state || '—'}</b></div>
                <div><small>District</small><b>{lead.district || '—'}</b></div>
                <div><small>Constituency</small><b>{lead.constituency || '—'}</b></div>
              </div>
              <div className="ld-kv">
                <div><small>Email</small><b>{lead.email || '—'}</b></div>
                <div><small>Current software</small><b>{lead.currentSoftware || '—'}</b></div>
              </div>
            </Card>
            <Card title="Qualification">
              <div className="ld-kv">
                <div><small>Constituency size</small><b>{lead.size ? `${lead.size.toLocaleString('en-IN')} citizens` : '—'}</b></div>
                <div><small>Estimated users</small><b>{lead.users || '—'}</b></div>
                <div><small>Budget range</small><b>{lead.budget || '—'}</b></div>
                <div><small>Purchase timeline</small><b>{lead.timeline || '—'}</b></div>
              </div>
              {canEdit && (
                <>
                  <Field label="Owner">
                    <Select options={USERS.filter((u) => u.role === 'bde').map((u) => ({ value: u.id, label: u.name }))} value={lead.owner || ''} placeholder="Unassigned"
                      disabled={role === 'bde'} onChange={(v) => { dispatch({ type: 'updateLead', id: lead.id, patch: { owner: v || null }, log: `Owner changed to ${userName(v)}`, by: user.id }); toast('Owner updated'); }} />
                  </Field>
                  <Field label="Lead score">
                    <span className="ld-score">
                      <input type="range" min="1" max="100" value={lead.score} onChange={(e) => dispatch({ type: 'updateLead', id: lead.id, patch: { score: Number(e.target.value) }, by: user.id })} />
                      <b>{lead.score}</b>
                    </span>
                  </Field>
                  <Field label="Deal value (₹)">
                    <input className="input" type="number" min="0" step="10000" value={lead.value}
                      onChange={(e) => dispatch({ type: 'updateLead', id: lead.id, patch: { value: Number(e.target.value) }, by: user.id })} />
                  </Field>
                </>
              )}
            </Card>
          </div>

          <Card title="Interested Modules" action={canEdit && <button type="button" className="link" onClick={() => setEditMods(!editMods)}>{editMods ? 'Done' : 'Edit'}</button>}>
            <div className="chips">
              {(editMods ? MODULES : lead.modules).map((m) => {
                const on = lead.modules.includes(m);
                return editMods
                  ? <button type="button" key={m} className={`ld-mod ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleModule(m)}>{on && <Check size={14} />}{m}</button>
                  : <span key={m} className="ld-mod on"><Check size={14} />{m}</span>;
              })}
              {!editMods && lead.modules.length === 0 && <span className="muted">No modules captured yet. Select Edit to add them.</span>}
            </div>
          </Card>

          <Card title="Activity Timeline" action={
            <div className="ld-filters" role="group" aria-label="Filter activity">
              {FILTERS.map(([k, label]) => <button type="button" key={k} className={filter === k ? 'on' : ''} aria-pressed={filter === k} onClick={() => setFilter(k)}>{label}</button>)}
            </div>
          }>
            {shownActs.length === 0 && <p className="muted">{acts.length === 0 ? 'No activity yet. Log the first call or WhatsApp message.' : 'Nothing of this type yet.'}</p>}
            <ol className="ld-tl">
              {shownActs.map((a) => {
                const [Icon, color] = ACT_ICON[a.type] || ACT_ICON.update;
                return (
                  <li key={a.id}>
                    <span className="ld-dot" style={{ background: `${color}1A`, color }}><Icon size={18} aria-hidden="true" /></span>
                    <div><b>{a.title}</b>{a.detail && <p>{a.detail}</p>}<small>{fmtDate(a.at)} · {userName(a.by)}</small></div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <div className="ld-col ld-side">
          {canEdit && (
            <section className="card ld-fu">
              <div className="card-head">
                <h2 className="card-title">Log Follow-up</h2>
                {overdue && <Tag color="#B91C1C">Due {daysBetween(lead.followUp, t)} days ago</Tag>}
              </div>
              <div className="ld-channels" role="group" aria-label="Channel">
                {CHANNELS.map(([k, label, Icon]) => (
                  <button type="button" key={k} className={fu.channel === k ? 'on' : ''} aria-pressed={fu.channel === k} onClick={() => setF('channel')(k)}>
                    <Icon size={18} aria-hidden="true" />{label}
                  </button>
                ))}
              </div>
              <Field label="Conversation"><textarea className="input" rows="3" value={fu.conversation} onChange={setF('conversation')} placeholder="What was discussed?" /></Field>
              <div className="form-grid">
                <Field label="Next action"><input className="input" value={fu.nextAction} onChange={setF('nextAction')} /></Field>
                <Field label="Next follow-up"><input className="input" type="date" value={fu.followUp} onChange={setF('followUp')} /></Field>
              </div>
              <Field label="Move stage (optional)"><Select options={FLOW} value={fu.stage} onChange={setF('stage')} placeholder={`Keep ${lead.stage}`} /></Field>
              <button type="button" className="btn btn-primary btn-lg" onClick={saveFollowUp}><CircleCheck size={18} />Save follow-up</button>
            </section>
          )}

          <Card title="Proposals" action={canEdit && <button type="button" className="link" onClick={() => nav(`/proposals/new?lead=${lead.id}`)}>+ New</button>}>
            {leadProps.length === 0 ? <p className="muted small">No proposals yet.</p> : leadProps.map((p) => (
              <Link key={p.id} to={`/proposals/${p.id}`} className="ld-prop">
                <span><b>{p.id}</b><small>{fmtDate(p.date)} · {p.discount}% discount</small></span>
                <Tag color={p.status.startsWith('Pending') ? '#92400E' : p.status === 'Accepted' ? '#166534' : '#1D4ED8'}>{p.status}</Tag>
              </Link>
            ))}
          </Card>

          <Card title="Demos" action={canEdit && <button type="button" className="link" onClick={() => setDemoOpen(true)}>+ Schedule</button>}>
            {leadDemos.length === 0 ? <p className="muted small">No demos yet.</p> : (
              <ul className="dash-list">
                {leadDemos.map((d) => (
                  <li key={d.id}>
                    <span className="dash-row">
                      <span className="ld-demo-dot" style={{ background: d.status === 'Completed' ? '#2FA84F' : '#8A5CD8' }} />
                      <span className="dash-w">{d.type} demo · {d.playbook}<small>{fmtDate(d.date)} {d.time} · {firstName(d.conductedBy)}{d.attendees ? ` · ${d.attendees} attendees` : ''}</small></span>
                      <Tag color={d.status === 'Completed' ? '#166534' : '#6D28D9'}>{d.status}</Tag>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
      {demoOpen && <ScheduleDemoModal lead={lead} onClose={() => setDemoOpen(false)} />}
      {lostOpen && <LostReasonModal lead={lead} onClose={() => setLostOpen(false)} onConfirm={(r) => { dispatch({ type: 'moveStage', id: lead.id, stage: 'Lost', lostReason: r, by: user.id }); setLostOpen(false); toast('Marked as lost'); }} />}
    </>
  );
}

const Tag = ({ color, children }) => <span className="dash-tag" style={{ background: `${color}1A`, color }}>{children}</span>;

function Tile({ icon: Icon, bg, color, value, label, note, meter }) {
  return (
    <div className="bh-kpi" style={{ background: bg }}>
      <span className="bh-kpi-ic" style={{ background: color, color: '#fff', borderRadius: 10 }}><Icon size={22} aria-hidden="true" /></span>
      <b>{value}</b>
      <span className="bh-kpi-l">{label}</span>
      {meter != null && <span className="ld-meter"><i style={{ width: `${meter}%`, background: color }} /></span>}
      {note && <span className="bh-kpi-d ld-note">{note}</span>}
    </div>
  );
}
