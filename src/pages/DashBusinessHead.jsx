import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle, ArrowRight, ArrowUp, ArrowUpRight, CalendarClock, CircleAlert, Clock, EllipsisVertical, FileText,
  FlaskConical, IndianRupee, Monitor, MonitorPlay, Phone, PhoneCall, Plus, Target, Trophy, Users,
} from 'lucide-react';
import { useState } from 'react';
import { ActionTile, Card, Photo } from '../components/ui';
import { AddLeadModal } from '../components/Modals';
import { useAuth, useData, useScopedLeads, leadLabel } from '../context/AppContext';
import { SUMMARY, day } from '../data/mock';
import { firstName, inr, isOpen, MONTHS, TODAY } from '../utils/format';

const STAGE_COLORS = ['#1F66C9', '#2A8BE0', '#8A5CD8', '#F07A22', '#F5B819', '#2FA84F', '#0F6B3A', '#8E97A5'];
const SOURCE_COLORS = ['#2A7DE1', '#F07A22', '#2FA84F', '#8A5CD8', '#F5C518', '#E5484D', '#14B8A6', '#9AA3AF'];
const STATE_COLORS = ['#2FA84F', '#F07A22', '#2A8BE0', '#8A5CD8', '#F5C518', '#9AA3AF'];
const STAGE_CONV = [['83%', ArrowRight], ['45%', ArrowUpRight], ['23%', ArrowUpRight], ['50%', ArrowUpRight], ['25%', ArrowUpRight], ['67%', ArrowUpRight]];

// Live counts for "Today's Action Center" — shared by every sales dashboard.
export function useActionCenter() {
  const leads = useScopedLeads();
  const { demos, proposals } = useData();
  const t = TODAY();
  const ids = new Set(leads.map((l) => l.id));
  const open = leads.filter(isOpen);
  return {
    overdue: open.filter((l) => l.followUp && l.followUp < t),
    today: open.filter((l) => l.followUp === t),
    demosToday: demos.filter((d) => d.date === t && d.status === 'Scheduled' && ids.has(d.leadId)),
    awaiting: proposals.filter((p) => p.status === 'Sent' && ids.has(p.leadId)),
    highValue: open.filter((l) => l.value >= 800000),
    calls: open.filter((l) => ['New Lead', 'Contacted'].includes(l.stage) && l.followUp && l.followUp <= day(1)),
  };
}

export function ActionCenter({ cols = 2 }) {
  const a = useActionCenter();
  const nav = useNavigate();
  return (
    <div className={`grid-${cols} gap-10`}>
      <ActionTile n={a.overdue.length} label="Overdue follow-ups" color="#B91C1C" icon={AlertTriangle} onClick={() => nav('/leads?tab=due')} />
      <ActionTile n={a.today.length} label="Follow-ups today" color="#B45309" icon={Clock} onClick={() => nav('/leads?tab=due')} />
      <ActionTile n={a.demosToday.length} label="Demos today" color="#0B6B3A" icon={MonitorPlay} onClick={() => nav('/demos')} />
      <ActionTile n={a.awaiting.length} label="Proposals awaiting response" color="#1D4ED8" icon={FileText} onClick={() => nav('/proposals')} />
      <ActionTile n={a.highValue.length} label="High-value opportunities" color="#6D28D9" icon={IndianRupee} onClick={() => nav('/pipeline')} />
      <ActionTile n={a.calls.length} label="Calls pending" color="#0F766E" icon={Phone} onClick={() => nav('/leads?tab=due')} />
    </div>
  );
}

export default function DashBusinessHead() {
  const { demos, leads } = useData();
  const { user } = useAuth();
  const a = useActionCenter();
  const [adding, setAdding] = useState(false);
  const nav = useNavigate();
  const s = SUMMARY;
  const t = TODAY();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Scheduled demos and follow-ups from today onwards, soonest first.
  const upcoming = [
    ...demos.filter((d) => d.status === 'Scheduled' && d.date >= t).map((d) => ({
      id: d.id, date: d.date, time: d.time, color: d.type === 'Online' ? '#2A7DE1' : '#2FA84F',
      title: `Demo - ${leadLabel(leads.find((l) => l.id === d.leadId))}`,
      sub: `${d.type} Demo · ${firstName(d.conductedBy)}`,
      to: '/demos',
    })),
    ...leads.filter((l) => isOpen(l) && l.followUp && l.followUp >= t).map((l) => ({
      id: l.id, date: l.followUp, time: '', color: '#F07A22',
      title: `Follow-up - ${l.prospect}, ${l.constituency}`,
      sub: l.nextAction || 'Follow-up call',
      to: `/leads/${l.id}`,
    })),
  ].sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time)).slice(0, 4);

  const when = (u) => {
    if (u.date !== t) return `${Number(u.date.slice(8))} ${MONTHS[Number(u.date.slice(5, 7)) - 1]}`;
    if (!u.time) return 'Today';
    const [h, m] = u.time.split(':').map(Number);
    return `${String(((h + 11) % 12) + 1).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  };

  const tiles = [
    [a.overdue.length, 'Overdue Follow-ups', CircleAlert, '#D92D20', '#FCE7E8', '/leads?tab=due'],
    [a.today.length, 'Follow-ups Today', CalendarClock, '#EA6A1F', '#FDEBDC', '/leads?tab=due'],
    [a.demosToday.length, 'Demos Today', Monitor, '#2FA84F', '#E6F5EA', '/demos'],
    [a.awaiting.length, 'Proposals Awaiting Response', FileText, '#2A7DE1', '#E8F1FC', '/proposals'],
    [a.highValue.length, 'High Value Opportunities', IndianRupee, '#8A5CD8', '#F1EBFB', '/pipeline'],
    [a.calls.length, 'Calls Pending', PhoneCall, '#0F9F8F', '#E3F7F4', '/leads?tab=due'],
  ];

  return (
    <>
      <section className="bh-hero">
        <div>
          <h1><span className="n">Neta</span><span className="t">360</span> Marketing Dashboard</h1>
          <h2>{greeting}, {user.name}!</h2>
          <p>Here is your Neta360 sales overview for today.</p>
        </div>
        <HeroArt />
        <div className="bh-hero-right">
          <button type="button" className="btn btn-saffron btn-lg" onClick={() => setAdding(true)}><Plus size={18} /> Add New Lead</button>
          <p className="bh-tagline">One Platform<br /><span>to Manage Your Constituency.</span></p>
        </div>
      </section>

      <div className="kpi-row">
        <BhKpi icon={Users} bg="#E9F6EC" color="#2FA84F" value={s.totalLeads.toLocaleString('en-IN')} label="Total Leads" delta="12% this month" />
        <BhKpi icon={Plus} bg="#E8F1FC" color="#2A7DE1" round value={s.newThisMonth} label="New This Month" delta="18% vs last month" />
        <BhKpi icon={Target} bg="#F1EBFB" color="#8A5CD8" value={s.qualified} label="Qualified" delta="15% conversion" />
        <BhKpi icon={MonitorPlay} bg="#FDEBDC" color="#F07A22" value={s.demos} label="Demos" delta="23% vs last month" />
        <BhKpi icon={FileText} bg="#FCE7E8" color="#E5484D" value={s.proposals} label="Proposals" delta="12% conversion" />
        <BhKpi icon={FlaskConical} bg="#FDF6D8" color="#F5B819" value={s.pilots} label="Pilots" delta="28% progress" />
        <BhKpi icon={Trophy} bg="#E6F5EA" color="#2FA84F" value={s.won} label="Won" delta="33% vs last month" />
        <BhKpi icon={IndianRupee} bg="#EAF2FB" color="#2A7DE1" soft round value={inr(s.pipelineValue)} label="Pipeline Value" note={`Expected: ${inr(s.expectedRevenue)}`} />
      </div>

      <div className="cols bh-row-a">
        <Card title="Sales Pipeline" action={<span className="chip">This Month</span>}>
          <div className="chevrons-scroll">
            <div className="chevrons">
              {s.funnel.map(([label, n], i) => (
                <button type="button" key={label} className="chevron" style={{ background: STAGE_COLORS[i] }} onClick={() => nav('/pipeline')}>
                  <b>{n}</b><span>{label}</span>
                </button>
              ))}
            </div>
            <div className="chevron-conv">
              {STAGE_CONV.map(([v, Icon], i) => <span key={i}>{v} <Icon size={14} aria-hidden="true" /></span>)}
            </div>
          </div>
        </Card>
        <Card title="Today's Action Center" action={<button type="button" className="link" onClick={() => nav('/leads?tab=due')}>View All</button>}>
          <div className="bh-actions">
            {tiles.map(([n, label, Icon, color, bg, to]) => (
              <button type="button" key={label} className="bh-action" style={{ background: bg }} onClick={() => nav(to)}>
                <Icon size={26} color={color} aria-hidden="true" />
                <span><b>{n}</b><span>{label}</span></span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="cols cols-3-bh">
        <Card title="Leads by State" action={<span className="chip">This Month</span>}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={s.byState.map(([name, v]) => ({ name, v }))} margin={{ top: 18, right: 0, left: -22, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EFEEE9" />
              <XAxis dataKey="name" tick={<StateTick />} interval={0} tickLine={false} axisLine={{ stroke: '#D5D3CB' }} height={36} />
              <YAxis tick={{ fontSize: 11, fill: '#5B6475' }} tickLine={false} axisLine={false} domain={[0, 800]} ticks={[0, 200, 400, 600, 800]} />
              <Tooltip cursor={{ fill: '#F6F5F1' }} />
              <Bar dataKey="v" name="Leads" barSize={30} radius={[3, 3, 0, 0]} label={{ position: 'top', fontSize: 12, fontWeight: 600, fill: '#14213D' }}>
                {s.byState.map((_, i) => <Cell key={i} fill={STATE_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Leads by Source">
          <div className="donut-wrap">
            <div className="donut">
              <PieChart width={160} height={160}>
                <Pie animationDuration={700} data={s.bySource.map(([name, v]) => ({ name, v }))} dataKey="v" innerRadius={50} outerRadius={80} stroke="none">
                  {s.bySource.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
              <div className="donut-center"><b>{s.totalLeads.toLocaleString('en-IN')}</b><span>Total Leads</span></div>
            </div>
            <ul className="legend">
              {s.bySource.map(([n, v], i) => <li key={n}><span className="sw" style={{ background: SOURCE_COLORS[i] }} />{n}<b>{v}%</b></li>)}
            </ul>
          </div>
        </Card>
        <Card title="BDE Performance" action={<span className="chip">This Month</span>}>
          <div className="table-wrap"><table className="table bh-table">
            <thead><tr><th>BDE</th><th>Leads</th><th>Demos</th><th>Proposals</th><th>Won</th><th>Revenue</th></tr></thead>
            <tbody>
              {s.bdePerf.map(([id, l, d, p, w, r]) => (
                <tr key={id}>
                  <td><span className="who"><Photo id={id} name={firstName(id)} size={30} /><b>{firstName(id)}</b></span></td>
                  <td>{l}</td><td>{d}</td><td>{p}</td><td>{w}</td><td>{inr(r)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </Card>
      </div>

      <div className="cols cols-bottom-bh">
        <Card title="Demo to Conversion"><Gauge value={s.demoToProposal} color="#2FA84F" label="Demo to Proposal" /></Card>
        <Card title="Proposal to Win"><Gauge value={s.proposalToWon} color="#F5A11B" label="Proposal to Won" /></Card>
        <Card title="Monthly Revenue Trend" action={<span className="chip">Last 6 Months</span>}>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={s.revenue.map(([m, v]) => ({ m, v }))} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EFEEE9" />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#5B6475' }} tickLine={false} axisLine={{ stroke: '#D5D3CB' }} />
              <YAxis hide domain={[0, 'dataMax + 6']} />
              <Tooltip formatter={(v) => `₹${v} L`} cursor={{ fill: '#F6F5F1' }} />
              <Bar dataKey="v" name="Revenue" fill="#34B356" barSize={30} radius={[2, 2, 0, 0]} label={{ position: 'top', fontSize: 11, fontWeight: 600, fill: '#14213D', formatter: (v) => `₹${v}L` }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Upcoming Activities" action={<button type="button" className="link" onClick={() => nav('/demos')}>View All</button>}>
          <ul className="bh-acts">
            {upcoming.length === 0 && <li className="muted small">Nothing scheduled.</li>}
            {upcoming.map((u) => (
              <li key={u.id}>
                <span className="bh-acts-t">{when(u)}</span>
                <span className="bh-acts-dot" style={{ background: u.color }} />
                <button type="button" className="bh-acts-w" onClick={() => nav(u.to)}>{u.title}<small>{u.sub}</small></button>
                <EllipsisVertical size={16} className="muted" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {adding && <AddLeadModal onClose={() => setAdding(false)} onCreated={(id) => nav(`/leads/${id}`)} />}
    </>
  );
}

function BhKpi({ icon: Icon, bg, color, soft, round, value, label, delta, note }) {
  return (
    <div className="bh-kpi" style={{ background: bg }}>
      <span className="bh-kpi-ic" style={{ background: soft ? `${color}22` : color, color: soft ? color : '#fff', borderRadius: round ? '50%' : 10 }}>
        <Icon size={24} aria-hidden="true" />
      </span>
      <b>{value}</b>
      <span className="bh-kpi-l">{label}</span>
      {delta && <span className="bh-kpi-d"><ArrowUp size={14} aria-hidden="true" />{delta}</span>}
      {note && <span className="bh-kpi-d muted">{note}</span>}
    </div>
  );
}

// Half-circle gauge for a conversion percentage.
function Gauge({ value, color, label }) {
  return (
    <div className="gauge">
      <svg viewBox="0 0 160 90" width="170" role="img" aria-label={`${label}: ${value}%`}>
        <path d="M14 82A66 66 0 0 1 146 82" fill="none" stroke="#DCE3F0" strokeWidth="18" />
        <path d="M14 82A66 66 0 0 1 146 82" fill="none" stroke={color} strokeWidth="18" pathLength="100" strokeDasharray={`${value} 100`} />
      </svg>
      <b>{value}%</b>
      <span>{label}</span>
    </div>
  );
}

// State names wrap onto two lines under each bar.
function StateTick({ x, y, payload }) {
  // Long single words (Maharashtra) are hyphenated so neighbouring labels don't collide.
  const words = payload.value.split(' ').flatMap((w) => (w.length > 9 ? [`${w.slice(0, 4)}-`, w.slice(4)] : [w]));
  return (
    <text x={x} y={y + 12} textAnchor="middle" fontSize="10" fill="#3A4458">
      {words.map((w, i) => <tspan key={i} x={x} dy={i ? 12 : 0}>{w}</tspan>)}
    </text>
  );
}

// Tricolour ribbon and flag behind the dashboard title.
function HeroArt() {
  return (
    <svg className="bh-hero-art" viewBox="0 0 330 120" aria-hidden="true">
      <defs>
        <linearGradient id="bh-sf" x1="0" x2="1"><stop offset="0" stopColor="#F59E0B" stopOpacity="0" /><stop offset="1" stopColor="#EA6A1F" stopOpacity=".85" /></linearGradient>
        <linearGradient id="bh-gr" x1="0" x2="1"><stop offset="0" stopColor="#16A34A" stopOpacity="0" /><stop offset="1" stopColor="#16A34A" stopOpacity=".75" /></linearGradient>
      </defs>
      <path d="M0 110C80 70 170 40 290 20L292 30C175 52 90 82 0 116z" fill="url(#bh-sf)" />
      <path d="M20 120C100 90 180 64 300 48L300 56C185 72 108 96 20 124z" fill="url(#bh-gr)" />
      <rect x="292" y="2" width="2" height="38" fill="#9AA3AF" />
      <rect x="294" y="3" width="24" height="5" fill="#FF9933" /><rect x="294" y="8" width="24" height="5" fill="#fff" /><rect x="294" y="13" width="24" height="5" fill="#138808" />
      <circle cx="306" cy="10.5" r="1.8" fill="none" stroke="#000080" strokeWidth=".6" />
      <g fill="#14213D" opacity=".08"><path d="M190 84a40 26 0 0 1 80 0z" /><rect x="170" y="84" width="120" height="6" /><rect x="160" y="90" width="140" height="30" /></g>
    </svg>
  );
}
