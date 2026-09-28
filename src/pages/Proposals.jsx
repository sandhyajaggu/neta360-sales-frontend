import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, FilePlus2, Printer, Save, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Badge, Button, Card, Field, PageHead, Select } from '../components/ui';
import { useAuth, useData, useScopedLeads, useToast, leadLabel, pkgById } from '../context/AppContext';
import { BDM_DISCOUNT_LIMIT, MODULES, PACKAGES, day } from '../data/mock';
import { fmtDate, inr, inrFull, userName } from '../utils/format';
import { calcProposal, PROPOSAL_STATUS_COLOR } from '../utils/proposal';

export function ProposalList() {
  const { proposals, leads } = useData();
  const scoped = useScopedLeads();
  const nav = useNavigate();
  const ids = new Set(scoped.map((l) => l.id));
  const rows = proposals.filter((p) => ids.has(p.leadId));
  return (
    <>
      <PageHead title="Proposals" sub="Draft, approve and send proposals. Discounts above 10% need Business Head approval.">
        <Button icon={FilePlus2} onClick={() => nav('/proposals/new')}>New proposal</Button>
      </PageHead>
      <Card>
        <div className="table-wrap">
          <table className="table clickable">
            <thead><tr><th>Proposal</th><th>Client</th><th>Package</th><th>Discount</th><th className="right">Total (incl. GST)</th><th>Prepared by</th><th>Valid until</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} onClick={() => nav(`/proposals/${p.id}`)}>
                  <td className="strong">{p.id}</td>
                  <td>{leadLabel(leads.find((l) => l.id === p.leadId))}</td>
                  <td>{pkgById(p.packageId).name}</td>
                  <td>{p.discount}%</td>
                  <td className="right strong">{inr(calcProposal(p, pkgById(p.packageId)).total)}</td>
                  <td>{userName(p.createdBy)}</td>
                  <td>{fmtDate(p.validUntil)}</td>
                  <td><Badge color={PROPOSAL_STATUS_COLOR[p.status]}>{p.status}</Badge></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan="8" className="empty">No proposals yet. Create one from a lead after the data audit.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export function ProposalBuilder() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { proposals, leads, dispatch } = useData();
  const scoped = useScopedLeads();
  const { user, role } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const existing = proposals.find((p) => p.id === id);
  const initialLead = leads.find((l) => l.id === (existing?.leadId || params.get('lead')));

  const [p, setP] = useState(() => existing || {
    leadId: initialLead?.id || '', packageId: 'pro', modules: initialLead?.modules?.length ? initialLead.modules : ['Constituency Management', 'Citizen Grievance'],
    users: initialLead?.users || 20, customization: 0, migration: 20000, discount: 0, status: 'Draft', createdBy: user.id,
    validUntil: day(14), startDate: day(21), paymentTerms: '50% advance, 50% at go-live',
  });
  const pkg = pkgById(p.packageId);
  const c = useMemo(() => calcProposal(p, pkg), [p, pkg]);
  const lead = leads.find((l) => l.id === p.leadId);
  const editable = ['Draft', 'Rejected'].includes(p.status) && ['bde', 'bdm', 'bh'].includes(role);
  const set = (k) => (v) => setP((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));
  const current = existing ? proposals.find((x) => x.id === existing.id) : null;
  const status = current?.status || p.status;

  if (id && !existing && id !== 'new') return <Card><p>Proposal {id} was not found. <Link to="/proposals">Back to proposals</Link></p></Card>;

  const save = (thenSubmit = false) => {
    if (!p.leadId) return toast('Choose the client lead first', 'warn');
    const payload = { ...p, discount: Number(p.discount), customization: Number(p.customization), migration: Number(p.migration), users: Number(p.users) };
    if (existing) {
      dispatch({ type: 'saveProposal', proposal: payload, by: user.id });
      if (thenSubmit) dispatch({ type: 'proposalStep', id: existing.id, step: 'submit', by: user.id, role });
      toast(thenSubmit ? 'Submitted for approval' : 'Draft saved');
    } else {
      dispatch({
        type: 'saveProposal', proposal: payload, by: user.id,
        onId: (newId) => {
          if (thenSubmit) dispatch({ type: 'proposalStep', id: newId, step: 'submit', by: user.id, role });
          toast(thenSubmit ? `${newId} submitted for approval` : `${newId} saved as draft`);
          nav(`/proposals/${newId}`, { replace: true });
        },
      });
    }
  };
  const step = (s, msg) => { dispatch({ type: 'proposalStep', id: existing.id, step: s, by: user.id, role, total: c.total }); toast(msg); };

  const canApprove = (status === 'Pending BDM' && ['bdm', 'bh'].includes(role)) || (status === 'Pending BH' && role === 'bh');
  const needsBH = Number(p.discount) > BDM_DISCOUNT_LIMIT;
  const workflow = [
    ['Draft prepared', `${userName(p.createdBy)}${existing ? ` · ${fmtDate(existing.date)}` : ''}`, status !== 'Draft'],
    ['BDM review', needsBH ? `Discount ${p.discount}% is above the ${BDM_DISCOUNT_LIMIT}% limit` : 'Auto-approval limit applies', ['Pending BH', 'Approved', 'Sent'].includes(status)],
    ...(needsBH ? [['Business Head approval', 'Required for discount above 10%', ['Approved', 'Sent'].includes(status)]] : []),
    ['Send to client', 'PDF and WhatsApp link', status === 'Sent'],
  ];

  return (
    <>
      <nav className="crumbs muted small" aria-label="Breadcrumb"><Link to="/proposals">Proposals</Link> › {existing ? existing.id : 'New proposal'}</nav>
      <PageHead title="Proposal builder" sub="Package, modules, pricing, GST, approval and send. Prices come from the demo rate card in src/data/mock.js.">
        <Button variant="ghost" icon={Printer} onClick={() => window.print()}>Print / PDF</Button>
        {editable && <Button variant="ghost" icon={Save} onClick={() => save(false)}>Save draft</Button>}
        {editable && <Button icon={Send} onClick={() => save(true)}>Submit for approval</Button>}
      </PageHead>

      <div className="cols cols-main-side">
        <Card title={existing ? `${existing.id} · ${leadLabel(lead)}` : 'New proposal'} action={<Badge color={PROPOSAL_STATUS_COLOR[status]}>{status}</Badge>}>
          <Field label="Client lead">
            <Select disabled={!!existing} options={scoped.filter((l) => l.stage !== 'Lost').map((l) => ({ value: l.id, label: `${leadLabel(l)} (${l.id})` }))} value={p.leadId} onChange={set('leadId')} placeholder="Choose a lead" />
          </Field>
          <div className="pkg-grid" role="radiogroup" aria-label="Package">
            {PACKAGES.map((k) => (
              <button type="button" role="radio" aria-checked={p.packageId === k.id} key={k.id} disabled={!editable} className={`pkg ${p.packageId === k.id ? 'on' : ''}`} onClick={() => set('packageId')(k.id)}>
                <span className="row between"><b>{k.name}</b>{p.packageId === k.id && <Check size={16} color="#0B6B3A" />}</span>
                <span className="muted small">{k.desc}</span>
                <span className="pkg-price">{inr(k.annual)} / year</span>
              </button>
            ))}
          </div>
          <div>
            <span className="field-label">Modules included</span>
            <div className="chips mt-8">
              {MODULES.map((m) => {
                const on = p.modules.includes(m);
                return <button type="button" key={m} disabled={!editable} aria-pressed={on} className={`mod ${on ? 'on' : ''}`} onClick={() => set('modules')(on ? p.modules.filter((x) => x !== m) : [...p.modules, m])}>{on && <Check size={12} />}{m}</button>;
              })}
            </div>
          </div>
          <div className="form-grid four">
            <Field label="Users"><input className="input" type="number" min="1" disabled={!editable} value={p.users} onChange={set('users')} /></Field>
            <Field label="Customisation (₹)"><input className="input" type="number" min="0" step="5000" disabled={!editable} value={p.customization} onChange={set('customization')} /></Field>
            <Field label="Data migration (₹)"><input className="input" type="number" min="0" step="5000" disabled={!editable} value={p.migration} onChange={set('migration')} /></Field>
            <Field label="Discount (%)" hint={needsBH ? 'Needs Business Head approval' : `Up to ${BDM_DISCOUNT_LIMIT}% is approved by BDM`}>
              <input className="input" type="number" min="0" max="40" disabled={!editable} value={p.discount} onChange={set('discount')} />
            </Field>
          </div>
          <table className="table lines">
            <tbody>
              <tr><td>Setup and implementation fee</td><td className="muted">One-time</td><td className="right">{inrFull(c.setup)}</td></tr>
              <tr><td>Annual subscription · {pkg.name}</td><td className="muted">{p.users} users · 12 months</td><td className="right">{inrFull(c.subscription)}</td></tr>
              <tr><td>Customisation</td><td className="muted">One-time</td><td className="right">{inrFull(c.customization)}</td></tr>
              <tr><td>Data migration (Excel → Neta360)</td><td className="muted">One-time</td><td className="right">{inrFull(c.migration)}</td></tr>
            </tbody>
          </table>
          <dl className="totals">
            <div><dt>Subtotal</dt><dd>{inrFull(c.subtotal)}</dd></div>
            <div><dt>Discount ({p.discount}%)</dt><dd>− {inrFull(c.discountAmt)}</dd></div>
            <div><dt>GST @ 18%</dt><dd>{inrFull(c.gst)}</dd></div>
            <div className="grand"><dt>Total contract value</dt><dd>{inrFull(c.total)}</dd></div>
          </dl>
        </Card>

        <div className="stack gap-20">
          <Card title="Proposal details">
            <div className="form-grid">
              <Field label="Valid until"><input className="input" type="date" disabled={!editable} value={p.validUntil} onChange={set('validUntil')} /></Field>
              <Field label="Contract start"><input className="input" type="date" disabled={!editable} value={p.startDate} onChange={set('startDate')} /></Field>
            </div>
            <Field label="Payment terms"><input className="input" disabled={!editable} value={p.paymentTerms} onChange={set('paymentTerms')} /></Field>
          </Card>
          <Card title="Approval workflow">
            <ol className="flow">
              {workflow.map(([t, s, done]) => (
                <li key={t} className={done ? 'done' : ''}><span className="flow-dot" /><div><b>{t}</b><span className="muted small">{s}</span></div></li>
              ))}
            </ol>
            {current?.history?.length > 0 && (
              <div className="history">
                {current.history.map((h, i) => <div key={i} className="small"><b>{h.step}</b> <span className="muted">· {userName(h.by)} · {fmtDate(h.at)}</span></div>)}
              </div>
            )}
            <div className="row gap-8 wrap">
              {canApprove && <Button variant="ghost" icon={ThumbsDown} onClick={() => step('reject', 'Proposal rejected and returned to draft owner')}>Reject</Button>}
              {canApprove && <Button icon={ThumbsUp} onClick={() => step('approve', 'Proposal approved')}>Approve</Button>}
              {status === 'Approved' && ['bde', 'bdm', 'bh'].includes(role) && <Button variant="saffron" icon={Send} onClick={() => step('send', 'Sent to client · lead moved to Proposal Sent')}>Send to client</Button>}
              {status === 'Pending BH' && role !== 'bh' && <p className="muted small">Waiting for the Business Head. Switch role to Business Head to approve in this demo.</p>}
              {status === 'Pending BDM' && !canApprove && <p className="muted small">Waiting for BDM review. Switch role to BDM to approve in this demo.</p>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
