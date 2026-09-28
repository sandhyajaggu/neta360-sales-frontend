import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import {
  seedLeads, seedActivities, seedDemos, seedProposals, seedTickets, seedIssues, seedCustomers,
  productRequests, USERS, STAGE_META, ONBOARDING_STEPS, PACKAGES, day, BDM_DISCOUNT_LIMIT,
} from '../data/mock';
import { ROLES } from '../data/roles';
import { priorityOf } from '../utils/format';

const STORE_KEY = 'neta360-demo-data-v1';
const AUTH_KEY = 'neta360-demo-auth-v1';

// ---------------------------------------------------------------- Auth
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; } catch { return null; }
  });
  useEffect(() => {
    try {
      if (session) localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      else localStorage.removeItem(AUTH_KEY);
    } catch { /* storage unavailable: session lasts for this tab only */ }
  }, [session]);

  const value = useMemo(() => {
    const user = session ? USERS.find((u) => u.id === session.userId) : null;
    return {
      session,
      user,
      role: session?.role,
      roleInfo: session ? ROLES[session.role] : null,
      login: (role) => setSession({ role, userId: ROLES[role].user }),
      logout: () => setSession(null),
    };
  }, [session]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

// ---------------------------------------------------------------- Toasts
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`toast toast-${t.tone}`}>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

// ---------------------------------------------------------------- Data store
const seed = () => ({
  leads: seedLeads.map((l) => ({ ...l, priority: priorityOf(l.score) })),
  activities: seedActivities,
  demos: seedDemos,
  proposals: seedProposals,
  tickets: seedTickets,
  issues: seedIssues,
  customers: seedCustomers,
  requests: productRequests,
  seq: { lead: 24510, act: 100, demo: 110, prop: 62, ticket: 1190, cust: 120 },
});

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || seed(); } catch { return seed(); }
};

function reducer(state, action) {
  const s = { ...state, seq: { ...state.seq } };
  const act = (leadId, type, title, detail, by) => {
    s.seq.act += 1;
    s.activities = [{ id: `a${s.seq.act}`, leadId, type, title, detail, by, at: day(0) }, ...s.activities];
  };
  const patchLead = (id, patch) => { s.leads = s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)); };

  switch (action.type) {
    case 'reset': return seed();

    case 'addLead': {
      s.seq.lead += 1;
      const id = `NL-${s.seq.lead}`;
      const lead = { stage: 'New Lead', value: 0, modules: [], ...action.lead, id, createdAt: day(0), priority: priorityOf(action.lead.score) };
      s.leads = [lead, ...s.leads];
      act(id, 'create', 'Lead created', `Source: ${lead.source}`, action.by);
      action.onId?.(id);
      return s;
    }
    case 'updateLead': {
      const patch = { ...action.patch };
      if (patch.score != null) patch.priority = priorityOf(patch.score);
      patchLead(action.id, patch);
      if (action.log) act(action.id, 'update', action.log, '', action.by);
      return s;
    }
    case 'moveStage': {
      const lead = s.leads.find((l) => l.id === action.id);
      if (!lead || lead.stage === action.stage) return state;
      patchLead(action.id, { stage: action.stage, lostReason: action.lostReason || lead.lostReason });
      act(action.id, 'stage', `Stage changed to ${action.stage}`, action.lostReason ? `Reason: ${action.lostReason}` : `From ${lead.stage}`, action.by);
      // Automation: a Won deal creates the customer + onboarding record.
      if (action.stage === 'Won' && !s.customers.some((c) => c.leadId === lead.id)) {
        s.seq.cust += 1;
        s.customers = [{
          id: `CUS-0${s.seq.cust}`, leadId: lead.id, name: `${lead.prospect}, ${lead.constituency}`,
          package: `${lead.users || 20} users`, accountManager: lead.owner, implManager: 'u8', supportContact: 'u9',
          contractStart: day(7), contractEnd: day(372), goLive: day(21), health: 70,
          steps: ONBOARDING_STEPS.map((_, i) => i === 0),
        }, ...s.customers];
        act(lead.id, 'won', 'Customer and onboarding created automatically', 'Handed over to Customer Support', action.by);
      }
      return s;
    }
    case 'logFollowUp': {
      const { id, conversation, nextAction, followUp, stage, by } = action;
      patchLead(id, { nextAction, followUp });
      act(id, action.channel || 'call', `Follow-up logged · next: ${nextAction}`, conversation, by);
      if (stage) return reducer(s, { type: 'moveStage', id, stage, by });
      return s;
    }
    case 'scheduleDemo': {
      s.seq.demo += 1;
      const demo = { id: `D-${s.seq.demo}`, status: 'Scheduled', feedback: '', attendees: 2, ...action.demo };
      s.demos = [demo, ...s.demos];
      act(demo.leadId, 'demo', `Demo scheduled for ${demo.date} ${demo.time}`, `${demo.type} · ${demo.playbook}`, action.by);
      const lead = s.leads.find((l) => l.id === demo.leadId);
      if (lead && ['New Lead', 'Contacted', 'Qualified'].includes(lead.stage)) {
        return reducer(s, { type: 'moveStage', id: lead.id, stage: 'Demo Scheduled', by: action.by });
      }
      return s;
    }
    case 'completeDemo': {
      const { id, feedback, interested, attendees, by } = action;
      const demo = s.demos.find((d) => d.id === id);
      s.demos = s.demos.map((d) => (d.id === id ? { ...d, status: 'Completed', feedback, attendees } : d));
      act(demo.leadId, 'demo', 'Demo completed', feedback, by);
      return reducer(s, { type: 'moveStage', id: demo.leadId, stage: interested ? 'Demo Completed' : 'Lost', lostReason: interested ? '' : 'Not interested', by });
    }
    case 'cancelDemo': {
      s.demos = s.demos.map((d) => (d.id === action.id ? { ...d, status: 'Cancelled' } : d));
      return s;
    }
    case 'saveProposal': {
      const p = action.proposal;
      if (!p.id) {
        s.seq.prop += 1;
        const id = `NP-2026-0${s.seq.prop}`;
        s.proposals = [{ ...p, id, date: day(0), history: [{ step: 'Draft created', by: action.by, at: day(0) }] }, ...s.proposals];
        act(p.leadId, 'proposal', `Proposal ${id} drafted`, '', action.by);
        action.onId?.(id);
      } else {
        s.proposals = s.proposals.map((x) => (x.id === p.id ? { ...x, ...p } : x));
      }
      return s;
    }
    case 'proposalStep': {
      // step: submit | approve | reject | send
      const { id, step, by, role } = action;
      const p = s.proposals.find((x) => x.id === id);
      let status = p.status; let label = '';
      if (step === 'submit') { status = 'Pending BDM'; label = 'Submitted for BDM review'; }
      if (step === 'approve' && p.status === 'Pending BDM') {
        status = p.discount > BDM_DISCOUNT_LIMIT ? 'Pending BH' : 'Approved';
        label = 'Approved by BDM';
      } else if (step === 'approve' && p.status === 'Pending BH') { status = 'Approved'; label = 'Approved by Business Head'; }
      if (step === 'reject') { status = 'Rejected'; label = `Rejected by ${role === 'bh' ? 'Business Head' : 'BDM'}`; }
      if (step === 'send') { status = 'Sent'; label = 'Sent to client'; }
      s.proposals = s.proposals.map((x) => (x.id === id ? { ...x, status, history: [...x.history, { step: label, by, at: day(0) }] } : x));
      act(p.leadId, 'proposal', `${id}: ${label}`, '', by);
      if (step === 'send') {
        // Keep the deal value in sync with the proposal that went out.
        s.leads = s.leads.map((l) => (l.id === p.leadId ? { ...l, value: action.total || l.value } : l));
        return reducer(s, { type: 'moveStage', id: p.leadId, stage: 'Proposal Sent', by });
      }
      return s;
    }
    case 'updateTicket': {
      s.tickets = s.tickets.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t));
      return s;
    }
    case 'addTicket': {
      s.seq.ticket += 1;
      s.tickets = [{ id: `CS-${s.seq.ticket}`, status: 'Open', escalated: false, createdAt: day(0), ...action.ticket }, ...s.tickets];
      return s;
    }
    case 'updateIssue': {
      s.issues = s.issues.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t));
      return s;
    }
    case 'updateRequest': {
      s.requests = s.requests.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t));
      return s;
    }
    case 'toggleStep': {
      s.customers = s.customers.map((c) => (c.id === action.id
        ? { ...c, steps: c.steps.map((v, i) => (i === action.index ? !v : v)) } : c));
      return s;
    }
    default: return state;
  }
}

const DataCtx = createContext(null);
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ } }, [state]);
  return <DataCtx.Provider value={{ ...state, dispatch }}>{children}</DataCtx.Provider>;
}
export const useData = () => useContext(DataCtx);

// Leads visible to the signed-in user: a BDE only sees their own.
export function useScopedLeads() {
  const { leads } = useData();
  const { role, user } = useAuth();
  return useMemo(() => (role === 'bde' ? leads.filter((l) => l.owner === user.id) : leads), [leads, role, user]);
}

export const leadLabel = (l) => (l ? `${l.prospect}, ${l.constituency}` : '—');
export const pkgById = (id) => PACKAGES.find((p) => p.id === id) || PACKAGES[0];
export const probOf = (stage) => STAGE_META[stage]?.prob ?? 0;
