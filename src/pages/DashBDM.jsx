import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CircleAlert, FileText, IndianRupee, Monitor, Plus, Trophy, Users } from 'lucide-react';
import { Badge, Card, ColorKpi, DashHero, Photo, PriorityBadge, Progress } from '../components/ui';
import { AddLeadModal } from '../components/Modals';
import { useAuth, useData, useToast, leadLabel, pkgById } from '../context/AppContext';
import { MONTHLY_TARGETS, USERS } from '../data/mock';
import { greeting, inr, isOpen, TODAY } from '../utils/format';
import { calcProposal } from '../utils/proposal';

const BDE_COLORS = { u3: '#2FA84F', u4: '#8A5CD8', u5: '#2A7DE1', u6: '#F07A22' };
const FUNNEL = [['Leads', null, '#1F66C9'], ['Contacted', 1, '#2A8BE0'], ['Qualified', 2, '#8A5CD8'], ['Demo', 3, '#F07A22'], ['Proposal', 6, '#F5B819'], ['Won', 9, '#2FA84F']];
const ORDER = ['New Lead', 'Contacted', 'Qualified', 'Demo Scheduled', 'Demo Completed', 'Requirement Collected', 'Proposal Sent', 'Negotiation', 'Pilot', 'Won'];

export default function DashBDM() {
  const { leads, proposals, demos, dispatch } = useData();
  const { user, role } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [adding, setAdding] = useState(false);
  const bdes = USERS.filter((u) => u.role === 'bde');
  const reached = (l, idx) => ORDER.indexOf(l.stage) >= idx;
  const active = leads.filter((l) => l.stage !== 'Lost');

  const won = leads.filter((l) => l.stage === 'Won');
  const wonValue = won.reduce((a, l) => a + l.value, 0);
  const overdue = leads.filter((l) => isOpen(l) && l.followUp && l.followUp < TODAY()).length;
  const pendingMine = proposals.filter((p) => p.status === (role === 'bh' ? 'Pending BH' : 'Pending BDM'));
  const unassigned = leads.filter((l) => !l.owner && isOpen(l));
  const teamTarget = bdes.reduce((a, b) => a + (MONTHLY_TARGETS[b.id] || 0), 0);

  // Won value plus half of late-stage deals, against each BDE's monthly target.
  const perf = bdes.map((b) => {
    const mine = leads.filter((l) => l.owner === b.id);
    const w = mine.filter((l) => l.stage === 'Won');
    const value = w.reduce((a, l) => a + l.value, 0) + mine.filter((l) => ['Pilot', 'Negotiation'].includes(l.stage)).reduce((a, l) => a + l.value * 0.5, 0);
    return { ...b, first: b.name.split(' ')[0], mine, won: w.length, demos: demos.filter((d) => mine.some((l) => l.id === d.leadId)).length, value, lakh: Math.round(value / 10000) / 10, pct: Math.round((value / MONTHLY_TARGETS[b.id]) * 100) };
  });

  const assign = (lead, owner) => {
    dispatch({ type: 'updateLead', id: lead.id, patch: { owner }, log: `Assigned to ${USERS.find((u) => u.id === owner).name}`, by: user.id });
    toast(`${lead.id} assigned`);
  };

  return (
    <>
      <DashHero title="Team Dashboard" greeting={`${greeting()}, ${user.name.split(' ')[0]}!`} sub="Sales team management, pipeline control and approvals.">
        <button type="button" className="btn btn-saffron btn-lg" onClick={() => setAdding(true)}><Plus size={18} /> Add New Lead</button>
      </DashHero>

      <div className="kpi-row kpi-6">
        <ColorKpi icon={Users} bg="#E8F1FC" color="#2A7DE1" value={leads.length} label="Team Leads" note={`${unassigned.length} unassigned`} />
        <ColorKpi icon={Monitor} bg="#F1EBFB" color="#8A5CD8" value={demos.length} label="Demos" note={`${demos.filter((d) => d.status === 'Scheduled').length} scheduled`} />
        <ColorKpi icon={FileText} bg="#FDEBDC" color="#F07A22" value={proposals.length} label="Proposals" note={`${pendingMine.length} need your approval`} />
        <ColorKpi icon={Trophy} bg="#E6F5EA" color="#2FA84F" value={won.length} label="Won" note="This quarter" />
        <ColorKpi icon={IndianRupee} bg="#E3F7F4" color="#0F9F8F" value={inr(wonValue)} label="Won Value" note={`Target ${inr(teamTarget)}`} />
        <ColorKpi icon={CircleAlert} bg="#FCE7E8" color="#E5484D" value={overdue} label="Overdue Follow-ups" note={overdue ? 'Needs attention' : 'All clear'} />
      </div>

      <div className="cols dash-3">
        <Card title="Team Performance" action={<span className="chip">This Month</span>}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={perf} margin={{ top: 20, right: 0, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EFEEE9" />
              <XAxis dataKey="first" tick={{ fontSize: 12, fill: '#3A4458' }} tickLine={false} axisLine={{ stroke: '#D5D3CB' }} />
              <YAxis tick={{ fontSize: 11, fill: '#5B6475' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />
              <Tooltip formatter={(v) => `₹${v} L (weighted)`} cursor={{ fill: '#F6F5F1' }} />
              <Bar dataKey="lakh" name="Won value" barSize={34} radius={[3, 3, 0, 0]} label={{ position: 'top', fontSize: 11, fontWeight: 600, fill: '#14213D', formatter: (v) => `₹${v}L` }}>
                {perf.map((p) => <Cell key={p.id} fill={BDE_COLORS[p.id]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Pipeline by Stage">
          <div className="funnel">
            {FUNNEL.map(([label, idx, color]) => {
              const n = idx == null ? leads.length : leads.filter((l) => reached(l, idx)).length;
              return (
                <div key={label} className="funnel-row">
                  <span className="muted small">{label}</span>
                  <div style={{ width: `${Math.max(12, (n / (leads.length || 1)) * 100)}%`, background: color }}>{n}</div>
                </div>
              );
            })}
          </div>
          <p className="muted small">Open pipeline {inr(active.filter(isOpen).reduce((a, l) => a + l.value, 0))}</p>
        </Card>
        <Card title={role === 'bh' ? 'Proposals Awaiting Your Approval' : 'Proposals Awaiting Approval'} action={<Badge color="#C2410C">{pendingMine.length} pending</Badge>}>
          {pendingMine.length === 0 ? <p className="muted">Nothing is waiting for you. New submissions appear here.</p> : (
            <div className="table-wrap"><table className="table clickable">
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
            </table></div>
          )}
        </Card>
      </div>

      <div className="cols dash-2">
        <Card title="BDE Targets" action={<span className="chip">This Month</span>}>
          <div className="table-wrap"><table className="table">
            <thead><tr><th>BDE</th><th>Leads</th><th>Demos</th><th>Won</th><th>Won value vs target</th></tr></thead>
            <tbody>
              {perf.map((b) => (
                <tr key={b.id}>
                  <td><span className="who"><Photo id={b.id} name={b.name} color={BDE_COLORS[b.id]} size={30} /><b>{b.name}</b></span></td>
                  <td>{b.mine.length}</td>
                  <td>{b.demos}</td>
                  <td>{b.won}</td>
                  <td style={{ minWidth: 200 }}><Progress value={b.pct} color={BDE_COLORS[b.id]} /><span className="muted small">{b.pct}% of {inr(MONTHLY_TARGETS[b.id])} (weighted)</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </Card>
        <Card title="Lead Allocation Queue" action={<Badge color="#1D4ED8">{unassigned.length} unassigned</Badge>}>
          {unassigned.length === 0 ? <p className="muted">Every lead has an owner.</p> : (
            <div className="table-wrap"><table className="table">
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
            </table></div>
          )}
        </Card>
      </div>
      {adding && <AddLeadModal onClose={() => setAdding(false)} onCreated={(id) => nav(`/leads/${id}`)} />}
    </>
  );
}
