import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, List, MapPin, Plus } from 'lucide-react';
import { Avatar, Button, PageHead, PriorityBadge, Select } from '../components/ui';
import { AddLeadModal, LostReasonModal } from '../components/Modals';
import { useAuth, useData, useScopedLeads, useToast, probOf } from '../context/AppContext';
import { STAGES, STAGE_META, USERS } from '../data/mock';
import { firstName, inr, isOpen, relDay, userName } from '../utils/format';

export default function Pipeline() {
  const leads = useScopedLeads();
  const { dispatch } = useData();
  const { user, role } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const [lost, setLost] = useState(null);
  const [adding, setAdding] = useState(false);
  const [owner, setOwner] = useState('');

  const shown = leads.filter((l) => !owner || l.owner === owner);
  const open = shown.filter(isOpen);
  const total = open.reduce((a, l) => a + l.value, 0);
  const weighted = open.reduce((a, l) => a + (l.value * probOf(l.stage)) / 100, 0);
  const withValue = open.filter((l) => l.value);
  const lostLeads = shown.filter((l) => l.stage === 'Lost');
  const topReason = Object.entries(lostLeads.reduce((a, l) => ({ ...a, [l.lostReason]: (a[l.lostReason] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0]?.[0];

  const drop = (stage) => {
    setOver(null);
    const lead = leads.find((l) => l.id === drag);
    setDrag(null);
    if (!lead || lead.stage === stage) return;
    if (stage === 'Lost') { setLost(lead); return; }
    dispatch({ type: 'moveStage', id: lead.id, stage, by: user.id });
    toast(`${lead.prospect}, ${lead.constituency} moved to ${stage}`);
  };

  return (
    <>
      <PageHead title="Sales pipeline" sub="Drag deals between stages. Each move is logged and updates the probability.">
        <Button variant="ghost" icon={List} onClick={() => nav('/leads')}>List view</Button>
        <Button icon={Plus} onClick={() => setAdding(true)}>Add deal</Button>
      </PageHead>
      <div className="summary-row">
        {[['Open pipeline', inr(total)], ['Weighted by probability', inr(weighted)], ['Average deal size', inr(withValue.length ? total / withValue.length : 0)], ['Open deals', open.length], ['Lost', `${lostLeads.length}${topReason ? ` · top reason: ${topReason}` : ''}`]].map(([k, v]) => (
          <div key={k} className="summary"><span className="muted small">{k}</span><b>{v}</b></div>
        ))}
        <div className="grow" />
        {role !== 'bde' && <Select aria-label="Filter by owner" options={USERS.filter((u) => u.role === 'bde').map((u) => ({ value: u.id, label: u.name }))} value={owner} onChange={setOwner} placeholder="All owners" />}
      </div>
      <div className="kanban" aria-label="Pipeline board">
        {STAGES.map((stage) => {
          const deals = shown.filter((l) => l.stage === stage).sort((a, b) => b.value - a.value);
          const color = STAGE_META[stage].color;
          return (
            <section key={stage} className={`kcol ${over === stage ? 'over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOver(stage); }} onDragLeave={() => setOver(null)} onDrop={() => drop(stage)}>
              <header style={{ borderColor: color }}>
                <span>{stage}</span><span style={{ color }}>{deals.length}</span>
              </header>
              <div className="kcol-sum muted small">{inr(deals.reduce((a, l) => a + l.value, 0))}</div>
              {deals.map((l) => (
                <article key={l.id} className="deal" draggable onDragStart={() => setDrag(l.id)} onDragEnd={() => setDrag(null)}
                  onClick={() => nav(`/leads/${l.id}`)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && nav(`/leads/${l.id}`)}>
                  <b>{l.prospect}</b>
                  <span className="muted small row gap-4"><MapPin size={12} />{l.constituency} · {l.state.split(' ')[0]}</span>
                  <div className="row between"><span className="deal-v">{inr(l.value)}</span><PriorityBadge priority={l.priority} /></div>
                  <div className="deal-foot">
                    <span className="row gap-6"><Avatar name={userName(l.owner)} color={color} size={24} /><span className="small">{l.owner ? firstName(l.owner) : 'Unassigned'}</span></span>
                    {isOpen(l) && <span className="muted small row gap-4"><Clock size={12} />{relDay(l.followUp)}</span>}
                  </div>
                </article>
              ))}
              {deals.length === 0 && <div className="kcol-empty">Drop a deal here</div>}
            </section>
          );
        })}
      </div>
      {lost && <LostReasonModal lead={lost} onClose={() => setLost(null)} onConfirm={(r) => { dispatch({ type: 'moveStage', id: lost.id, stage: 'Lost', lostReason: r, by: user.id }); setLost(null); toast('Marked as lost'); }} />}
      {adding && <AddLeadModal onClose={() => setAdding(false)} />}
    </>
  );
}
