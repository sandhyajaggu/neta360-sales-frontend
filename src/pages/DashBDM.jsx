import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, IndianRupee, MonitorPlay, Trophy, Users } from 'lucide-react';
import { Avatar, Badge, Card, Kpi, PageHead, PriorityBadge, Progress } from '../components/ui';
import { useAuth, useData, useToast, leadLabel, pkgById } from '../context/AppContext';
import { MONTHLY_TARGETS, USERS } from '../data/mock';
import { inr, isOpen, TODAY } from '../utils/format';
import { calcProposal } from '../utils/proposal';
import { ActionCenter } from './DashBusinessHead';

const BDE_COLORS = { u3: '#0B6B3A', u4: '#6D28D9', u5: '#1D4ED8', u6: '#EA6A1F' };
const FUNNEL = [['Leads', null, '#1D4ED8'], ['Contacted', 1, '#2F6FE0'], ['Qualified', 2, '#6D28D9'], ['Demo', 3, '#C2410C'], ['Proposal', 6, '#B45309'], ['Won', 9, '#0B6B3A']];
const ORDER = ['New Lead', 'Contacted', 'Qualified', 'Demo Scheduled', 'Demo Completed', 'Requirement Collected', 'Proposal Sent', 'Negotiation', 'Pilot', 'Won'];

export default function DashBDM() {
  const { leads, proposals, demos, dispatch } = useData();
  const { user, role } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const bdes = USERS.filter((u) => u.role === 'bde');
  const reached = (l, idx) => ORDER.indexOf(l.stage) >= idx;
  const active = leads.filter((l) => l.stage !== 'Lost');

  const wonValue = leads.filter((l) => l.stage === 'Won').reduce((a, l) => a + l.value, 0);
  const overdue = leads.filter((l) => isOpen(l) && l.followUp && l.followUp < TODAY()).length;
  const pendingMine = proposals.filter((p) => p.status === (role === 'bh' ? 'Pending BH' : 'Pending BDM'));
  const unassigned = leads.filter((l) => !l.owner && isOpen(l));

  const assign = (lead, owner) => {
    dispatch({ type: 'updateLead', id: lead.id, patch: { owner }, log: `Assigned to ${USERS.find((u) => u.id === owner).name}`, by: user.id });
    toast(`${lead.id} assigned`);
  };

  return (
    <>
      <PageHead title="Team dashboard" sub="Sales team management and pipeline control." />
      <div className="kpi-row kpi-6">
        <Kpi icon={Users} label="Team leads" value={leads.length} delta={`${unassigned.length} unassigned`} color="#1D4ED8" />
        <Kpi icon={MonitorPlay} label="Demos" value={demos.length} delta={`${demos.filter((d) => d.status === 'Scheduled').length} scheduled`} color="#6D28D9" />
        <Kpi icon={FileText} label="Proposals" value={proposals.length} delta={`${pendingMine.length} need your approval`} color="#C2410C" />
        <Kpi icon={Trophy} label="Won" value={leads.filter((l) => l.stage === 'Won').length} delta="This quarter" color="#0B6B3A" />
        <Kpi icon={IndianRupee} label="Won value" value={inr(wonValue)} delta={`Open pipeline ${inr(active.filter(isOpen).reduce((a, l) => a + l.value, 0))}`} color="#0F766E" />
        <Kpi icon={AlertTriangle} label="Overdue follow-ups" value={overdue} delta={overdue ? 'Needs attention' : 'All clear'} color="#B91C1C" down={overdue > 0} />
      </div>

      <div className="cols cols-main-side">
        <Card title="Targets and performance" action={<span className="chip">This month</span>}>
          <table className="table">
            <thead><tr><th>BDE</th><th>Leads</th><th>Demos</th><th>Won</th><th>Won value vs target</th></tr></thead>
            <tbody>
              {bdes.map((b) => {
                const mine = leads.filter((l) => l.owner === b.id);
                const won = mine.filter((l) => l.stage === 'Won');
                const wv = won.reduce((a, l) => a + l.value, 0) + mine.filter((l) => ['Pilot', 'Negotiation'].includes(l.stage)).reduce((a, l) => a + l.value * 0.5, 0);
                const pct = Math.round((wv / MONTHLY_TARGETS[b.id]) * 100);
                return (
                  <tr key={b.id}>
                    <td><span className="row gap-10"><Avatar name={b.name} color={BDE_COLORS[b.id]} size={30} /><b>{b.name}</b></span></td>
                    <td>{mine.length}</td>
                    <td>{demos.filter((d) => mine.some((l) => l.id === d.leadId)).length}</td>
                    <td>{won.length}</td>
                    <td style={{ minWidth: 200 }}><Progress value={pct} color={BDE_COLORS[b.id]} /><span className="muted small">{pct}% of {inr(MONTHLY_TARGETS[b.id])} (weighted)</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        <Card title="Team pipeline funnel">
          <div className="funnel">
            {FUNNEL.map(([label, idx, color]) => {
              const n = idx == null ? leads.length : leads.filter((l) => reached(l, idx)).length;
              return (
                <div key={label} className="funnel-row">
                  <span className="muted small">{label}</span>
                  <div style={{ width: `${Math.max(12, (n / leads.length) * 100)}%`, background: color }}>{n}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="cols cols-2">
        <Card title={role === 'bh' ? 'Proposals awaiting your approval' : 'Proposals awaiting BDM review'} action={<Badge color="#C2410C">{pendingMine.length} pending</Badge>}>
          {pendingMine.length === 0 ? <p className="muted">Nothing is waiting for you. New submissions appear here.</p> : (
            <table className="table clickable">
              <thead><tr><th>Proposal</th><th>Client</th><th>Total</th><th>Discount</th></tr></thead>
              <tbody>
                {pendingMine.map((p) => {
                  const lead = leads.find((l) => l.id === p.leadId);
                  return (
                    <tr key={p.id} onClick={() => nav(`/proposals/${p.id}`)}>
                      <td className="strong">{p.id}</td><td>{leadLabel(lead)}</td><td>{inr(calcProposal(p, pkgById(p.packageId)).total)}</td>
                      <td><Badge color={p.discount > 10 ? '#B91C1C' : '#0B6B3A'}>{p.discount}%</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Lead allocation queue" action={<Badge color="#1D4ED8">{unassigned.length} unassigned</Badge>}>
          {unassigned.length === 0 ? <p className="muted">Every lead has an owner.</p> : (
            <table className="table">
              <thead><tr><th>Lead</th><th>Source</th><th>Score</th><th>Assign to</th></tr></thead>
              <tbody>
                {unassigned.map((l) => (
                  <tr key={l.id}>
                    <td><b>{leadLabel(l)}</b><div className="muted small">{l.state}</div></td>
                    <td>{l.source}</td>
                    <td><PriorityBadge priority={l.priority} score={l.score} /></td>
                    <td>
                      <select className="input input-sm" aria-label={`Assign ${l.id}`} value="" onChange={(e) => assign(l, e.target.value)}>
                        <option value="">Choose BDE</option>
                        {bdes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
      <Card title="Team action center"><ActionCenter cols={6} /></Card>
    </>
  );
}
