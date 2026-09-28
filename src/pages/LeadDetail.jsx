import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Building2, CalendarPlus, Check, CheckCircle2, ClipboardList, FileText, Handshake, MessageCircle, MonitorPlay,
  Phone, PlusCircle, RefreshCw, Trophy, XCircle,
} from 'lucide-react';
import { Badge, Button, Card, IconTile, KV, PriorityBadge, Select, StageBadge, Field } from '../components/ui';
import { FollowUpFields, LostReasonModal, ScheduleDemoModal } from '../components/Modals';
import { useAuth, useData, useToast, probOf } from '../context/AppContext';
import { MODULES, STAGES, USERS, day } from '../data/mock';
import { fmtDate, inr, relDay, userName } from '../utils/format';

const ACT_ICON = { call: [Phone, '#1D4ED8'], whatsapp: [MessageCircle, '#0F766E'], meeting: [Handshake, '#EA6A1F'], email: [MessageCircle, '#6D28D9'], demo: [MonitorPlay, '#6D28D9'], proposal: [FileText, '#B45309'], audit: [ClipboardList, '#0B6B3A'], stage: [RefreshCw, '#6B7280'], create: [PlusCircle, '#0B6B3A'], update: [RefreshCw, '#6B7280'], won: [Trophy, '#0B6B3A'] };
const FLOW = STAGES.filter((s) => s !== 'Lost');

export default function LeadDetail() {
  const { id } = useParams();
  const { leads, activities, proposals, dispatch } = useData();
  const { user, role } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const lead = leads.find((l) => l.id === id);
  const [demoOpen, setDemoOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [editMods, setEditMods] = useState(false);
  const [fu, setFu] = useState({ channel: 'call', conversation: '', nextAction: lead?.nextAction || '', followUp: day(2), stage: '' });

  if (!lead) return <Card><p>Lead {id} was not found. <Link to="/leads">Back to leads</Link></p></Card>;
  if (role === 'bde' && lead.owner !== user.id) return <Card><p>This lead belongs to another BDE. <Link to="/leads">Back to my leads</Link></p></Card>;

  const canEdit = ['bde', 'bdm', 'bh'].includes(role);
  const idx = FLOW.indexOf(lead.stage);
  const acts = activities.filter((a) => a.leadId === lead.id);
  const leadProps = proposals.filter((p) => p.leadId === lead.id);
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
      <nav className="crumbs muted small" aria-label="Breadcrumb"><Link to="/leads">Leads</Link> › {lead.prospect}, {lead.constituency}</nav>
      <Card>
        <div className="lead-head">
          <div className="row gap-14">
            <IconTile icon={Building2} color="#0B6B3A" size={52} />
            <div>
              <h1 className="lead-title">{lead.prospect}, {lead.constituency}</h1>
              <div className="muted small">{lead.id} · {lead.district && `${lead.district} district · `}{lead.state} · Owner: {userName(lead.owner)}</div>
              <div className="row gap-6 wrap mt-8">
                <PriorityBadge priority={lead.priority} score={lead.score} />
                <Badge color="#1D4ED8">{lead.type}</Badge>
                <Badge color="#6D28D9">Source: {lead.source}</Badge>
                <Badge color="#B45309">Timeline: {lead.timeline}</Badge>
                {lead.stage === 'Lost' && <Badge color="#B91C1C">Lost: {lead.lostReason}</Badge>}
              </div>
            </div>
          </div>
          <div className="row gap-8 wrap">
            <a className="btn btn-ghost" href={`tel:+91${lead.mobile}`}><Phone size={16} />Call</a>
            <a className="btn btn-ghost" href={`https://wa.me/91${lead.mobile}`} target="_blank" rel="noreferrer"><MessageCircle size={16} />WhatsApp</a>
            {canEdit && <Button variant="ghost" icon={CalendarPlus} onClick={() => setDemoOpen(true)}>Schedule demo</Button>}
            {canEdit && lead.stage !== 'Lost' && <Button variant="ghost" icon={XCircle} onClick={() => setLostOpen(true)}>Mark lost</Button>}
            {canEdit && <Button icon={FileText} onClick={() => nav(`/proposals/new?lead=${lead.id}`)}>Create proposal</Button>}
          </div>
        </div>
        <ol className="stepper" aria-label="Lead stage">
          {FLOW.map((s, i) => {
            const state = lead.stage === 'Lost' ? 'todo' : i < idx ? 'done' : i === idx ? 'cur' : 'todo';
            return (
              <li key={s} className={state}>
                <button type="button" disabled={!canEdit} onClick={() => move(s)} aria-current={state === 'cur' ? 'step' : undefined} title={canEdit ? `Move to ${s}` : s}>
                  <span className="step-dot">{state === 'done' ? <Check size={14} /> : i + 1}</span>
                  <span className="step-l">{s}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="cols cols-lead">
        <div className="stack gap-20">
          <Card title="Prospect and qualification">
            <KV items={[
              ['Contact', `${lead.contact || '—'}${lead.designation ? ` (${lead.designation})` : ''}`],
              ['Mobile / WhatsApp', lead.mobile ? `+91 ${lead.mobile}` : ''],
              ['Email', lead.email], ['Current software', lead.currentSoftware],
              ['Constituency size', lead.size ? `${lead.size.toLocaleString('en-IN')} citizens` : ''],
              ['Estimated users', lead.users], ['Budget range', lead.budget], ['Purchase timeline', lead.timeline],
            ]} />
            {canEdit && (
              <div className="form-grid mt-8">
                <Field label="Owner">
                  <Select options={USERS.filter((u) => u.role === 'bde').map((u) => ({ value: u.id, label: u.name }))} value={lead.owner || ''} placeholder="Unassigned"
                    disabled={role === 'bde'} onChange={(v) => { dispatch({ type: 'updateLead', id: lead.id, patch: { owner: v || null }, log: `Owner changed to ${userName(v)}`, by: user.id }); toast('Owner updated'); }} />
                </Field>
                <Field label={`Lead score: ${lead.score}`}>
                  <input type="range" min="1" max="100" value={lead.score} onChange={(e) => dispatch({ type: 'updateLead', id: lead.id, patch: { score: Number(e.target.value) }, by: user.id })} />
                </Field>
              </div>
            )}
          </Card>
          <Card title="Interested modules" action={canEdit && <button type="button" className="link" onClick={() => setEditMods(!editMods)}>{editMods ? 'Done' : 'Edit'}</button>}>
            <div className="chips">
              {(editMods ? MODULES : lead.modules).map((m) => {
                const on = lead.modules.includes(m);
                return editMods
                  ? <button type="button" key={m} className={`mod ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleModule(m)}>{on && <Check size={12} />}{m}</button>
                  : <span key={m} className="mod on"><Check size={12} />{m}</span>;
              })}
              {!editMods && lead.modules.length === 0 && <span className="muted">No modules captured yet. Select Edit to add them.</span>}
            </div>
          </Card>
        </div>

        <div className="stack gap-20">
          <Card title="Opportunity">
            <KV items={[
              ['Stage', <StageBadge key="s" stage={lead.stage} />], ['Deal value', inr(lead.value)],
              ['Probability', `${probOf(lead.stage)}%`], ['Expected revenue', inr((lead.value * probOf(lead.stage)) / 100)],
              ['Next action', lead.nextAction], ['Next follow-up', relDay(lead.followUp)],
            ]} />
            {canEdit && (
              <Field label="Deal value (₹)">
                <input className="input" type="number" min="0" step="10000" value={lead.value}
                  onChange={(e) => dispatch({ type: 'updateLead', id: lead.id, patch: { value: Number(e.target.value) }, by: user.id })} />
              </Field>
            )}
            {leadProps.length > 0 && (
              <div className="stack gap-6">
                <span className="field-label">Proposals</span>
                {leadProps.map((p) => <Link key={p.id} to={`/proposals/${p.id}`} className="row between list-link"><b>{p.id}</b><span className="muted small">{p.status}</span></Link>)}
              </div>
            )}
          </Card>
          <Card title="Activity timeline">
            {acts.length === 0 && <p className="muted">No activity yet. Log the first call or WhatsApp message.</p>}
            <ol className="timeline">
              {acts.map((a) => {
                const [Icon, color] = ACT_ICON[a.type] || ACT_ICON.update;
                return (
                  <li key={a.id}>
                    <IconTile icon={Icon} color={color} size={32} />
                    <div><b>{a.title}</b>{a.detail && <p>{a.detail}</p>}<span className="muted small">{fmtDate(a.at)} · {userName(a.by)}</span></div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        {canEdit && (
          <Card title="Log follow-up" className="sticky">
            <FollowUpFields f={fu} set={setF} />
            <Button icon={CheckCircle2} onClick={saveFollowUp}>Save follow-up</Button>
          </Card>
        )}
      </div>
      {demoOpen && <ScheduleDemoModal lead={lead} onClose={() => setDemoOpen(false)} />}
      {lostOpen && <LostReasonModal lead={lead} onClose={() => setLostOpen(false)} onConfirm={(r) => { dispatch({ type: 'moveStage', id: lead.id, stage: 'Lost', lostReason: r, by: user.id }); setLostOpen(false); toast('Marked as lost'); }} />}
    </>
  );
}
