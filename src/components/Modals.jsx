import { useState } from 'react';
import { Modal, Field, Select, Button } from './ui';
import { useAuth, useData, useToast, leadLabel } from '../context/AppContext';
import { SOURCES, CUSTOMER_TYPES, STATES, TIMELINES, BUDGETS, USERS, STAGES, LOST_REASONS, PLAYBOOKS, day } from '../data/mock';
import { CONSTITUENCIES } from '../data/geo';

export function AddLeadModal({ onClose, onCreated }) {
  const { user, role } = useAuth();
  const { dispatch } = useData();
  const toast = useToast();
  const [f, setF] = useState({
    prospect: '', contact: '', designation: '', constituency: '', district: '', state: 'Telangana',
    type: 'MLA', source: 'LinkedIn', mobile: '', email: '', budget: '₹5–10 L', timeline: '3 Months',
    score: 50, owner: role === 'bde' ? user.id : '', followUp: day(1), nextAction: 'First call',
  });
  const [errors, setErrors] = useState({});
  // Whether District / Constituency are being typed instead of picked from the list.
  const [manual, setManual] = useState({ district: false, constituency: false });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));

  const districts = CONSTITUENCIES[f.state];
  const seats = districts && !manual.district ? districts[f.district] : null;
  const setState = (state) => { setF((x) => ({ ...x, state, district: '', constituency: '' })); setManual({ district: false, constituency: false }); };
  const setDistrict = (district) => { setF((x) => ({ ...x, district, constituency: '' })); setManual((m) => ({ ...m, constituency: false })); };
  const typeDistrict = (on) => { setF((x) => ({ ...x, district: '', constituency: '' })); setManual({ district: on, constituency: false }); };
  const typeConstituency = (on) => { setF((x) => ({ ...x, constituency: '' })); setManual((m) => ({ ...m, constituency: on })); };

  const save = () => {
    const e = {};
    if (!f.prospect.trim()) e.prospect = 'Enter the prospect or office name';
    if (!f.constituency.trim()) e.constituency = 'Enter the constituency';
    if (!/^\d{10}$/.test(f.mobile.replace(/\s/g, ''))) e.mobile = 'Enter a 10-digit mobile number';
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch({
      type: 'addLead', by: user.id,
      lead: { ...f, score: Number(f.score), owner: f.owner || null, whatsapp: f.mobile },
      onId: (id) => { toast(`Lead ${id} added`); onCreated?.(id); },
    });
    onClose();
  };

  return (
    <Modal title="Add new lead" onClose={onClose} wide
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save lead</Button></>}>
      <div className="form-grid">
        <Field label="Prospect / office name" error={errors.prospect}><input className="input" value={f.prospect} onChange={set('prospect')} placeholder="MLA Office" /></Field>
        <Field label="Customer type"><Select options={CUSTOMER_TYPES} value={f.type} onChange={set('type')} /></Field>
        <Field label="Contact person"><input className="input" value={f.contact} onChange={set('contact')} placeholder="R. Suresh" /></Field>
        <Field label="Designation"><input className="input" value={f.designation} onChange={set('designation')} placeholder="PA / Secretary" /></Field>
        <div className="form-row-3">
          <Field label="State"><Select options={STATES} value={f.state} onChange={setState} /></Field>
          <Field label="District" hint={districts && !manual.district ? `${Object.keys(districts).length} districts` : null}>
            {districts
              ? <PickOrType options={Object.keys(districts)} value={f.district} onChange={setDistrict} placeholder="Select district"
                  manual={manual.district} onManual={typeDistrict} typePlaceholder="Type district" />
              : <input className="input" value={f.district} onChange={set('district')} placeholder="Type district" />}
          </Field>
          <Field label="Constituency" error={errors.constituency}
            hint={seats ? `${seats.length} constituencies in ${f.district}` : districts && manual.district ? 'District typed manually, so type the constituency too' : null}>
            {districts && !manual.district
              ? <PickOrType options={seats || []} value={f.constituency} onChange={set('constituency')}
                  placeholder={f.district ? 'Select constituency' : 'Select district first'} disabled={!f.district}
                  manual={manual.constituency} onManual={typeConstituency} typePlaceholder="Type constituency" />
              : <input className="input" value={f.constituency} onChange={set('constituency')} placeholder="Type constituency" />}
          </Field>
        </div>
        <Field label="Lead source"><Select options={SOURCES} value={f.source} onChange={set('source')} /></Field>
        <Field label="Mobile / WhatsApp" error={errors.mobile}><input className="input" inputMode="numeric" value={f.mobile} onChange={set('mobile')} placeholder="98480 12345" /></Field>
        <Field label="Email"><input className="input" type="email" value={f.email} onChange={set('email')} /></Field>
        <Field label="Budget range"><Select options={BUDGETS} value={f.budget} onChange={set('budget')} /></Field>
        <Field label="Purchase timeline"><Select options={TIMELINES} value={f.timeline} onChange={set('timeline')} /></Field>
        <Field label={`Lead score: ${f.score}`} hint="75+ is Hot, 50–74 Warm, below 50 Cold">
          <input type="range" min="1" max="100" value={f.score} onChange={set('score')} />
        </Field>
        <Field label="Lead owner">
          <Select options={USERS.filter((u) => u.role === 'bde').map((u) => ({ value: u.id, label: u.name }))} value={f.owner} onChange={set('owner')} placeholder="Unassigned" disabled={role === 'bde'} />
        </Field>
        <Field label="First follow-up"><input className="input" type="date" value={f.followUp} onChange={set('followUp')} /></Field>
        <Field label="Next action"><input className="input" value={f.nextAction} onChange={set('nextAction')} /></Field>
      </div>
    </Modal>
  );
}

const MANUAL = '__manual__';

// A dropdown whose last option switches to a text box for names missing from the list.
function PickOrType({ options, value, onChange, placeholder, disabled, manual, onManual, typePlaceholder }) {
  if (manual) {
    return (
      <>
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={typePlaceholder} autoFocus />
        <button type="button" className="link small" onClick={() => onManual(false)}>Back to list</button>
      </>
    );
  }
  return (
    <select className="input" value={value} disabled={disabled}
      onChange={(e) => (e.target.value === MANUAL ? onManual(true) : onChange(e.target.value))}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      {!disabled && <option value={MANUAL}>+ Not in list, type manually</option>}
    </select>
  );
}

export function LogFollowUpModal({ lead, onClose }) {
  const { user } = useAuth();
  const { dispatch } = useData();
  const toast = useToast();
  const [f, setF] = useState({ channel: 'call', conversation: '', nextAction: lead.nextAction || '', followUp: day(2), stage: '' });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));
  const save = () => {
    if (!f.conversation.trim()) return toast('Add a short note about the conversation', 'warn');
    dispatch({ type: 'logFollowUp', id: lead.id, ...f, stage: f.stage || null, by: user.id });
    toast('Follow-up saved');
    onClose();
  };
  return (
    <Modal title={`Log follow-up · ${leadLabel(lead)}`} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save follow-up</Button></>}>
      <FollowUpFields f={f} set={set} />
    </Modal>
  );
}

export function FollowUpFields({ f, set }) {
  return (
    <div className="stack">
      <Field label="Channel">
        <Select options={[{ value: 'call', label: 'Phone call' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'meeting', label: 'Meeting' }, { value: 'email', label: 'Email' }]} value={f.channel} onChange={set('channel')} />
      </Field>
      <Field label="Conversation"><textarea className="input" rows="3" value={f.conversation} onChange={set('conversation')} placeholder="What was discussed?" /></Field>
      <div className="form-grid">
        <Field label="Next action"><input className="input" value={f.nextAction} onChange={set('nextAction')} /></Field>
        <Field label="Follow-up date"><input className="input" type="date" value={f.followUp} onChange={set('followUp')} /></Field>
      </div>
      <Field label="Update stage (optional)"><Select options={STAGES.filter((s) => s !== 'Lost')} value={f.stage} onChange={set('stage')} placeholder="Keep current stage" /></Field>
    </div>
  );
}

export function ScheduleDemoModal({ lead, onClose }) {
  const { user } = useAuth();
  const { dispatch, leads } = useData();
  const toast = useToast();
  const [f, setF] = useState({ leadId: lead?.id || '', date: day(1), time: '10:00', type: 'Online', conductedBy: 'u7', playbook: lead?.type === 'MP' ? 'MP Demo' : lead?.type === 'Consultant' ? 'Consultant Demo' : 'MLA Demo', attendees: 2 });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));
  const open = leads.filter((l) => !['Won', 'Lost'].includes(l.stage));
  const save = () => {
    if (!f.leadId) return toast('Choose a lead for the demo', 'warn');
    dispatch({ type: 'scheduleDemo', demo: f, by: user.id });
    toast(`Demo scheduled for ${f.date} at ${f.time}`);
    onClose();
  };
  return (
    <Modal title="Schedule demo" onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Schedule demo</Button></>}>
      <div className="stack">
        {!lead && <Field label="Lead"><Select options={open.map((l) => ({ value: l.id, label: `${leadLabel(l)} (${l.id})` }))} value={f.leadId} onChange={set('leadId')} placeholder="Choose a lead" /></Field>}
        <div className="form-grid">
          <Field label="Date"><input className="input" type="date" value={f.date} onChange={set('date')} /></Field>
          <Field label="Time"><input className="input" type="time" value={f.time} onChange={set('time')} /></Field>
          <Field label="Demo type"><Select options={['Online', 'Offline']} value={f.type} onChange={set('type')} /></Field>
          <Field label="Conducted by"><Select options={USERS.filter((u) => u.role === 'ps').map((u) => ({ value: u.id, label: u.name }))} value={f.conductedBy} onChange={set('conductedBy')} /></Field>
        </div>
        <Field label="Demo playbook"><Select options={PLAYBOOKS.map((p) => p.name)} value={f.playbook} onChange={set('playbook')} /></Field>
      </div>
    </Modal>
  );
}

export function LostReasonModal({ lead, onConfirm, onClose }) {
  const [reason, setReason] = useState(LOST_REASONS[0]);
  return (
    <Modal title={`Mark as lost · ${leadLabel(lead)}`} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={() => onConfirm(reason)}>Mark as lost</Button></>}>
      <Field label="Lost reason" hint="Lost leads are recycled for re-contact after 90 days.">
        <Select options={LOST_REASONS} value={reason} onChange={setReason} />
      </Field>
    </Modal>
  );
}
