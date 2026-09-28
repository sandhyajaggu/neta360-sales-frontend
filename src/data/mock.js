// ---------------------------------------------------------------------------
// Neta360 demo data. Everything here is sample data for demos.
// Dates are generated relative to "today" so the demo always looks current.
// Replace this file with API calls when the backend is ready.
// ---------------------------------------------------------------------------

export const day = (offset = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const USERS = [
  { id: 'u1', name: 'Siva Krishna', role: 'bh', email: 'siva@neta360.in' },
  { id: 'u2', name: 'Mahesh Reddy', role: 'bdm', email: 'mahesh@neta360.in' },
  { id: 'u3', name: 'Ravi Kumar', role: 'bde', email: 'ravi@neta360.in' },
  { id: 'u4', name: 'Priya Nair', role: 'bde', email: 'priya@neta360.in' },
  { id: 'u5', name: 'Kiran Goud', role: 'bde', email: 'kiran@neta360.in' },
  { id: 'u6', name: 'Anil Yadav', role: 'bde', email: 'anil@neta360.in' },
  { id: 'u7', name: 'Sneha Varma', role: 'ps', email: 'sneha@neta360.in' },
  { id: 'u8', name: 'Arjun Das', role: 'ps', email: 'arjun@neta360.in' },
  { id: 'u9', name: 'Divya Sharma', role: 'cs', email: 'divya@neta360.in' },
  { id: 'u10', name: 'Vikram Rao', role: 'ts', email: 'vikram@neta360.in' },
];

export const STAGES = [
  'New Lead', 'Contacted', 'Qualified', 'Demo Scheduled', 'Demo Completed',
  'Requirement Collected', 'Proposal Sent', 'Negotiation', 'Pilot', 'Won', 'Lost',
];

export const STAGE_META = {
  'New Lead': { color: '#1D4ED8', prob: 5 },
  Contacted: { color: '#2F6FE0', prob: 10 },
  Qualified: { color: '#6D28D9', prob: 20 },
  'Demo Scheduled': { color: '#9333EA', prob: 30 },
  'Demo Completed': { color: '#C2410C', prob: 40 },
  'Requirement Collected': { color: '#D97706', prob: 50 },
  'Proposal Sent': { color: '#B45309', prob: 60 },
  Negotiation: { color: '#9A3412', prob: 70 },
  Pilot: { color: '#0F766E', prob: 80 },
  Won: { color: '#0B6B3A', prob: 100 },
  Lost: { color: '#6B7280', prob: 0 },
};

export const SOURCES = ['LinkedIn', 'Website', 'WhatsApp', 'Facebook/Instagram', 'Google', 'Referral', 'Direct Meeting', 'Political Consultant', 'Event', 'Partner', 'Existing Client'];
export const CUSTOMER_TYPES = ['MLA', 'MP', 'Candidate', 'Consultant', 'Organization', 'Local body', 'Other'];
// All 28 states and 8 union territories of India, grouped for dropdowns.
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];
export const UNION_TERRITORIES = [
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
export const STATES = [
  { group: 'States', options: INDIAN_STATES },
  { group: 'Union Territories', options: UNION_TERRITORIES },
];
export const TIMELINES = ['Immediate', '30 Days', '3 Months', '6 Months'];
export const BUDGETS = ['Below ₹3 L', '₹3–5 L', '₹5–10 L', '₹10–20 L', 'Above ₹20 L'];
export const LOST_REASONS = ['Budget', 'Chose competitor', 'No decision maker access', 'Timing / elections', 'Not interested', 'Other'];

export const MODULES = [
  'Voter Management', 'Constituency Management', 'Booth Management', 'Mandal Management',
  'Volunteer Management', 'Citizen Grievance', 'Development Works', 'Beneficiary Management',
  'Survey & Feedback', 'Events Management', 'Communication Center', 'WhatsApp Integration',
  'AI Calling', 'Mobile App', 'Analytics & Reports', 'AI Intelligence', 'Custom Development',
];

// Demo rate card — replace with the real Neta360 pricing.
export const PACKAGES = [
  { id: 'starter', name: 'Constituency Starter', desc: 'CRM, Grievance and Dashboard', setup: 50000, annual: 300000 },
  { id: 'pro', name: 'Constituency Pro', desc: 'Starter + Booth, Volunteer, Works, WhatsApp, Mobile app', setup: 75000, annual: 540000 },
  { id: 'enterprise', name: 'Enterprise / Consultant', desc: 'Multi-constituency, Surveys, AI Intelligence, custom work', setup: 150000, annual: 900000 },
];
export const GST_RATE = 0.18;
export const BDM_DISCOUNT_LIMIT = 10; // % — above this, Business Head approval is required

const L = (id, o) => ({
  id, contact: '', designation: '', district: '', email: '', mobile: '', whatsapp: '',
  currentSoftware: 'Excel + WhatsApp groups', size: 200000, users: 20, budget: '₹5–10 L',
  timeline: '3 Months', modules: [], lostReason: '', nextAction: '', ...o,
});

export const seedLeads = [
  L('NL-24501', { prospect: 'MLA Office', contact: 'R. Suresh', designation: 'PA', constituency: 'Serilingampally', district: 'Rangareddy', state: 'Telangana', type: 'MLA', source: 'LinkedIn', owner: 'u3', stage: 'Proposal Sent', score: 86, value: 840000, mobile: '9848012321', budget: '₹5–10 L', timeline: '30 Days', modules: ['Constituency Management', 'Booth Management', 'Citizen Grievance', 'Development Works', 'Volunteer Management', 'WhatsApp Integration', 'Mobile App', 'Analytics & Reports'], size: 235000, users: 25, nextAction: 'Call PA re: pricing', followUp: day(-2), createdAt: day(-12) }),
  L('NL-24498', { prospect: 'Former MLA', contact: 'K. Venkat Rao', designation: 'Self', constituency: 'Warangal West', district: 'Hanamkonda', state: 'Telangana', type: 'Candidate', source: 'Referral', owner: 'u3', stage: 'Qualified', score: 82, value: 600000, mobile: '9866011223', timeline: '30 Days', modules: ['Constituency Management', 'Volunteer Management', 'Survey & Feedback'], nextAction: 'Book 15-min demo', followUp: day(0), createdAt: day(-6) }),
  L('NL-24490', { prospect: 'MP Office', contact: 'S. Rao', designation: 'PA', constituency: 'Nalgonda', district: 'Nalgonda', state: 'Telangana', type: 'MP', source: 'Direct Meeting', owner: 'u4', stage: 'Negotiation', score: 79, value: 1400000, mobile: '9959011445', users: 40, size: 1600000, modules: ['Constituency Management', 'Development Works', 'Citizen Grievance', 'Analytics & Reports'], nextAction: 'Confirm pilot dates', followUp: day(1), createdAt: day(-20) }),
  L('NL-24477', { prospect: 'Strategy consultancy', contact: 'A. Menon', designation: 'Director', constituency: 'Vijayawada Central', district: 'NTR', state: 'Andhra Pradesh', type: 'Consultant', source: 'Political Consultant', owner: 'u4', stage: 'Demo Completed', score: 71, value: 620000, mobile: '9000112233', modules: ['Survey & Feedback', 'Analytics & Reports', 'AI Intelligence'], nextAction: 'Share demo recording', followUp: day(0), createdAt: day(-9) }),
  L('NL-24461', { prospect: 'Candidate office', contact: 'K. Latha', designation: 'Secretary', constituency: 'Nizamabad Urban', district: 'Nizamabad', state: 'Telangana', type: 'Candidate', source: 'WhatsApp', owner: 'u5', stage: 'Demo Scheduled', score: 66, value: 450000, mobile: '9701122334', nextAction: 'Send demo reminder', followUp: day(2), createdAt: day(-5) }),
  L('NL-24452', { prospect: 'Party district office', contact: 'M. Prasad', designation: 'Coordinator', constituency: 'Karimnagar', district: 'Karimnagar', state: 'Telangana', type: 'Organization', source: 'Event', owner: 'u5', stage: 'Contacted', score: 58, value: 0, mobile: '9912233445', nextAction: 'WhatsApp brochure', followUp: day(0), createdAt: day(-3) }),
  L('NL-24440', { prospect: 'Ward councillor office', contact: 'P. Kumari', designation: 'Councillor', constituency: 'Guntur East', district: 'Guntur', state: 'Andhra Pradesh', type: 'Local body', source: 'Google', owner: 'u6', stage: 'New Lead', score: 44, value: 0, mobile: '9848765432', nextAction: 'First call', followUp: day(1), createdAt: day(-1) }),
  L('NL-24431', { prospect: 'MLA Office', contact: 'N. Srinivas', designation: 'PA', constituency: 'Kukatpally', district: 'Medchal', state: 'Telangana', type: 'MLA', source: 'Referral', owner: 'u3', stage: 'Pilot', score: 91, value: 920000, mobile: '9885543210', modules: ['Constituency Management', 'Booth Management', 'Citizen Grievance', 'Mobile App'], nextAction: 'Pilot review call', followUp: day(5), createdAt: day(-30) }),
  L('NL-24420', { prospect: 'Campaign agency', contact: 'R. Shetty', designation: 'Founder', constituency: 'Bengaluru (multi)', district: 'Bengaluru Urban', state: 'Karnataka', type: 'Consultant', source: 'LinkedIn', owner: 'u4', stage: 'Won', score: 95, value: 1200000, mobile: '9845098450', modules: ['Survey & Feedback', 'Volunteer Management', 'Mobile App', 'Analytics & Reports'], nextAction: 'Renewal planning', followUp: day(14), createdAt: day(-60) }),
  L('NL-24411', { prospect: 'Constituency coordinator', contact: 'S. Patil', designation: 'Coordinator', constituency: 'Pune Cantonment', district: 'Pune', state: 'Maharashtra', type: 'Organization', source: 'Website', owner: 'u6', stage: 'Lost', score: 30, value: 0, mobile: '9822012345', lostReason: 'Budget', followUp: '', createdAt: day(-40) }),
  L('NL-24405', { prospect: 'MP Office', contact: 'B. Rao', designation: 'PA', constituency: 'Medak', district: 'Medak', state: 'Telangana', type: 'MP', source: 'Referral', owner: 'u3', stage: 'Pilot', score: 88, value: 1250000, mobile: '9848033221', nextAction: 'Confirm pilot dates', followUp: day(7), createdAt: day(-28) }),
  L('NL-24399', { prospect: 'MLA Office', contact: 'H. Gowda', designation: 'PA', constituency: 'Mysuru Chamaraja', district: 'Mysuru', state: 'Karnataka', type: 'MLA', source: 'LinkedIn', owner: 'u4', stage: 'Proposal Sent', score: 74, value: 750000, mobile: '9880011223', nextAction: 'Follow up on proposal', followUp: day(-1), createdAt: day(-18) }),
  L('NL-24390', { prospect: 'Party youth wing', contact: 'T. Naik', designation: 'President', constituency: 'Khammam', district: 'Khammam', state: 'Telangana', type: 'Organization', source: 'Event', owner: 'u5', stage: 'New Lead', score: 52, value: 0, mobile: '9676012345', nextAction: 'First call', followUp: day(0), createdAt: day(-2) }),
  L('NL-24382', { prospect: 'Candidate office', contact: 'G. Reddy', designation: 'Secretary', constituency: 'Tirupati', district: 'Tirupati', state: 'Andhra Pradesh', type: 'Candidate', source: 'Facebook/Instagram', owner: 'u4', stage: 'Qualified', score: 63, value: 400000, mobile: '9948012345', nextAction: 'Book demo', followUp: day(3), createdAt: day(-7) }),
  L('NL-24375', { prospect: 'Political consultant', contact: 'V. Iyer', designation: 'Director', constituency: 'Hyderabad (multi)', district: 'Hyderabad', state: 'Telangana', type: 'Consultant', source: 'WhatsApp', owner: 'u6', stage: 'Contacted', score: 55, value: 300000, mobile: '9000234567', nextAction: 'Send case study', followUp: day(-3), createdAt: day(-10) }),
  L('NL-24368', { prospect: 'MLA Office', contact: 'J. Raju', designation: 'PA', constituency: 'Siddipet', district: 'Siddipet', state: 'Telangana', type: 'MLA', source: 'Existing Client', owner: 'u3', stage: 'Won', score: 93, value: 850000, mobile: '9848099887', nextAction: 'Renewal in October', followUp: day(20), createdAt: day(-300) }),
  L('NL-24360', { prospect: 'Former MP', contact: 'D. Naidu', designation: 'Self', constituency: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', type: 'Candidate', source: 'Partner', owner: 'u6', stage: 'Requirement Collected', score: 69, value: 700000, mobile: '9866554433', nextAction: 'Prepare proposal', followUp: day(1), createdAt: day(-14) }),
  L('NL-24352', { prospect: 'MLA Office', contact: 'E. Selvam', designation: 'PA', constituency: 'Coimbatore South', district: 'Coimbatore', state: 'Tamil Nadu', type: 'MLA', source: 'Google', owner: 'u5', stage: 'Contacted', score: 49, value: 0, mobile: '9443012345', nextAction: 'Qualification call', followUp: day(-4), createdAt: day(-8) }),
  L('NL-24341', { prospect: 'District party office', contact: 'R. Behera', designation: 'Secretary', constituency: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', type: 'Organization', source: 'LinkedIn', owner: null, stage: 'New Lead', score: 61, value: 0, mobile: '9437012345', nextAction: 'Assign owner', followUp: day(0), createdAt: day(0) }),
  L('NL-24338', { prospect: 'Candidate office', contact: 'S. Deshmukh', designation: 'Secretary', constituency: 'Nagpur West', district: 'Nagpur', state: 'Maharashtra', type: 'Candidate', source: 'Website', owner: null, stage: 'New Lead', score: 57, value: 0, mobile: '9822098765', nextAction: 'Assign owner', followUp: day(0), createdAt: day(-1) }),
  L('NL-24330', { prospect: 'Former MLA', contact: 'L. Reddy', designation: 'Self', constituency: 'Warangal East', district: 'Warangal', state: 'Telangana', type: 'Candidate', source: 'Referral', owner: null, stage: 'New Lead', score: 82, value: 0, mobile: '9866001122', nextAction: 'Assign owner', followUp: day(0), createdAt: day(0) }),
  L('NL-24322', { prospect: 'MLA Office', contact: 'C. Kumar', designation: 'PA', constituency: 'Jangaon', district: 'Jangaon', state: 'Telangana', type: 'MLA', source: 'Direct Meeting', owner: 'u3', stage: 'Demo Completed', score: 72, value: 650000, mobile: '9848077665', nextAction: 'Constituency data audit', followUp: day(0), createdAt: day(-9) }),
  L('NL-24315', { prospect: 'Ward office', contact: 'Y. Babu', designation: 'Councillor', constituency: 'Vizag Ward 12', district: 'Visakhapatnam', state: 'Andhra Pradesh', type: 'Local body', source: 'WhatsApp', owner: 'u6', stage: 'Qualified', score: 60, value: 250000, mobile: '9948765432', nextAction: 'Book demo', followUp: day(2), createdAt: day(-6) }),
  L('NL-24309', { prospect: 'MLA Office', contact: 'P. Rao', designation: 'PA', constituency: 'Karimnagar Rural', district: 'Karimnagar', state: 'Telangana', type: 'MLA', source: 'Referral', owner: 'u5', stage: 'Negotiation', score: 77, value: 800000, mobile: '9912345678', nextAction: 'Revised quote', followUp: day(-1), createdAt: day(-22) }),
];

export const seedActivities = [
  { id: 'a1', leadId: 'NL-24501', type: 'proposal', title: 'Proposal NP-2026-061 sent', detail: 'Constituency Pro · 25 users', by: 'u3', at: day(-2) },
  { id: 'a2', leadId: 'NL-24501', type: 'audit', title: 'Constituency data audit completed', detail: '293 booths and 18 mandals mapped; requirement doc uploaded', by: 'u3', at: day(-4) },
  { id: 'a3', leadId: 'NL-24501', type: 'demo', title: 'Online demo completed', detail: '4 attendees · MLA Demo flow · “Grievance tracking is the priority”', by: 'u7', at: day(-7) },
  { id: 'a4', leadId: 'NL-24501', type: 'whatsapp', title: 'WhatsApp introduction', detail: 'Brochure + 10-minute demo invite · replied DEMO', by: 'u3', at: day(-10) },
  { id: 'a5', leadId: 'NL-24501', type: 'call', title: 'First call', detail: 'Complaints tracked in registers, no field team visibility', by: 'u3', at: day(-11) },
  { id: 'a6', leadId: 'NL-24498', type: 'call', title: 'Qualification call', detail: 'Decision maker is the candidate himself; budget ₹5–10 L', by: 'u3', at: day(-3) },
  { id: 'a7', leadId: 'NL-24490', type: 'meeting', title: 'Negotiation meeting', detail: 'Asked for 15% discount on annual fee', by: 'u4', at: day(-2) },
];

export const seedDemos = [
  { id: 'D-101', leadId: 'NL-24461', date: day(2), time: '10:00', type: 'Online', conductedBy: 'u7', playbook: 'MLA Demo', attendees: 3, status: 'Scheduled', feedback: '' },
  { id: 'D-102', leadId: 'NL-24498', date: day(0), time: '15:00', type: 'Offline', conductedBy: 'u8', playbook: 'MLA Demo', attendees: 2, status: 'Scheduled', feedback: '' },
  { id: 'D-103', leadId: 'NL-24382', date: day(3), time: '11:30', type: 'Online', conductedBy: 'u7', playbook: 'MLA Demo', attendees: 2, status: 'Scheduled', feedback: '' },
  { id: 'D-104', leadId: 'NL-24315', date: day(0), time: '12:00', type: 'Online', conductedBy: 'u7', playbook: 'MLA Demo', attendees: 2, status: 'Scheduled', feedback: '' },
  { id: 'D-098', leadId: 'NL-24501', date: day(-7), time: '10:00', type: 'Online', conductedBy: 'u7', playbook: 'MLA Demo', attendees: 4, status: 'Completed', feedback: 'Grievance tracking is the top priority; wants Telugu SMS templates.' },
  { id: 'D-097', leadId: 'NL-24477', date: day(-9), time: '16:00', type: 'Offline', conductedBy: 'u8', playbook: 'Consultant Demo', attendees: 6, status: 'Completed', feedback: 'Interested in multi-constituency survey dashboards.' },
  { id: 'D-095', leadId: 'NL-24490', date: day(-11), time: '11:00', type: 'Offline', conductedBy: 'u8', playbook: 'MP Demo', attendees: 5, status: 'Completed', feedback: 'Wants assembly-segment level reports.' },
  { id: 'D-093', leadId: 'NL-24322', date: day(-2), time: '14:00', type: 'Online', conductedBy: 'u7', playbook: 'MLA Demo', attendees: 3, status: 'Completed', feedback: 'Liked the field staff app.' },
];

export const seedProposals = [
  { id: 'NP-2026-061', leadId: 'NL-24501', packageId: 'pro', modules: ['Constituency Management', 'Booth Management', 'Citizen Grievance', 'Development Works', 'WhatsApp Integration', 'Mobile App'], users: 25, customization: 40000, migration: 25000, discount: 12, status: 'Pending BH', createdBy: 'u3', date: day(-3), validUntil: day(11), startDate: day(17), paymentTerms: '50% advance, 50% at go-live', history: [{ step: 'Draft created', by: 'u3', at: day(-3) }, { step: 'Approved by BDM', by: 'u2', at: day(-2) }] },
  { id: 'NP-2026-058', leadId: 'NL-24490', packageId: 'enterprise', modules: ['Constituency Management', 'Development Works', 'Citizen Grievance', 'Analytics & Reports'], users: 40, customization: 100000, migration: 50000, discount: 15, status: 'Pending BDM', createdBy: 'u4', date: day(-4), validUntil: day(10), startDate: day(20), paymentTerms: '50% advance, 50% at go-live', history: [{ step: 'Draft created', by: 'u4', at: day(-4) }] },
  { id: 'NP-2026-055', leadId: 'NL-24399', packageId: 'pro', modules: ['Constituency Management', 'Citizen Grievance', 'Mobile App'], users: 20, customization: 0, migration: 20000, discount: 8, status: 'Sent', createdBy: 'u4', date: day(-8), validUntil: day(6), startDate: day(14), paymentTerms: '100% advance', history: [{ step: 'Draft created', by: 'u4', at: day(-8) }, { step: 'Approved by BDM', by: 'u2', at: day(-7) }, { step: 'Sent to client', by: 'u4', at: day(-7) }] },
];

export const seedTickets = [
  { id: 'CS-1182', customer: 'MLA Office, Kukatpally', subject: 'Login issue for PA account', category: 'Access', priority: 'High', slaHours: 2, assignedTo: 'u9', status: 'Open', escalated: false, createdAt: day(0) },
  { id: 'CS-1179', customer: 'Campaign agency, Bengaluru', subject: 'Data upload support', category: 'Data', priority: 'Medium', slaHours: 6, assignedTo: 'u9', status: 'In progress', escalated: false, createdAt: day(-1) },
  { id: 'CS-1176', customer: 'MP Office, Medak', subject: 'Report not loading', category: 'Reports', priority: 'High', slaHours: -1, assignedTo: 'u10', status: 'In progress', escalated: true, createdAt: day(-1) },
  { id: 'CS-1171', customer: 'MLA Office, Kukatpally', subject: 'Add 5 new users', category: 'Users', priority: 'Low', slaHours: 24, assignedTo: 'u9', status: 'In progress', escalated: false, createdAt: day(-1) },
  { id: 'CS-1168', customer: 'Strategy consultancy', subject: 'User training request', category: 'Training', priority: 'Low', slaHours: 48, assignedTo: 'u9', status: 'Open', escalated: false, createdAt: day(-2) },
  { id: 'CS-1160', customer: 'MLA Office, Siddipet', subject: 'Grievance export format', category: 'Reports', priority: 'Medium', slaHours: 0, assignedTo: 'u9', status: 'Resolved', escalated: false, createdAt: day(-4) },
];

export const seedIssues = [
  { id: 'TS-431', title: 'API error on booth sync', customer: 'MP Office, Medak', area: 'API', severity: 'Critical', owner: 'u10', status: 'In progress' },
  { id: 'TS-428', title: 'Report PDF timeout', customer: 'Strategy consultancy', area: 'Reports', severity: 'High', owner: 'u10', status: 'Open' },
  { id: 'TS-425', title: 'WhatsApp template rejected', customer: 'MLA Office, Kukatpally', area: 'WhatsApp', severity: 'Medium', owner: 'u10', status: 'Waiting on vendor' },
  { id: 'TS-420', title: 'Slow search above 50k records', customer: 'Campaign agency, Bengaluru', area: 'Performance', severity: 'Medium', owner: 'u10', status: 'In progress' },
  { id: 'TS-417', title: 'Role permission for PA', customer: 'MLA Office, Serilingampally', area: 'Security', severity: 'Low', owner: 'u10', status: 'Resolved' },
];

export const ONBOARDING_STEPS = [
  'Contract signed & customer ID created', 'Kick-off call', 'Data migration', 'User creation',
  'Mobile app rollout', 'WhatsApp integration', 'Training', 'Go-live',
];

export const seedCustomers = [
  { id: 'CUS-0112', leadId: 'NL-24431', name: 'MLA Office, Kukatpally', package: 'Constituency Pro · 25 users', accountManager: 'u3', implManager: 'u8', supportContact: 'u9', contractStart: day(17), contractEnd: day(382), goLive: day(12), health: 74, steps: [true, true, true, false, false, false, false, false] },
  { id: 'CUS-0109', leadId: 'NL-24405', name: 'MP Office, Medak (pilot)', package: 'Enterprise · 40 users', accountManager: 'u3', implManager: 'u7', supportContact: 'u9', contractStart: day(20), contractEnd: day(385), goLive: day(20), health: 61, steps: [true, true, false, false, false, false, false, false] },
  { id: 'CUS-0101', leadId: 'NL-24420', name: 'Campaign agency, Bengaluru', package: 'Enterprise · 18 users', accountManager: 'u4', implManager: 'u8', supportContact: 'u9', contractStart: day(-16), contractEnd: day(349), goLive: day(-16), health: 92, steps: [true, true, true, true, true, true, true, true] },
  { id: 'CUS-0088', leadId: 'NL-24368', name: 'MLA Office, Siddipet', package: 'Constituency Pro · 20 users', accountManager: 'u3', implManager: 'u7', supportContact: 'u9', contractStart: day(-345), contractEnd: day(20), goLive: day(-330), health: 81, steps: [true, true, true, true, true, true, true, true] },
];

export const productRequests = [
  { id: 'PR-301', title: 'Feature demo – Booth module', client: 'MLA Office, Kukatpally', type: 'Demo', owner: 'u7', due: day(0), status: 'New' },
  { id: 'PR-298', title: 'Module configuration – Development Works', client: 'MP Office, Medak', type: 'Configuration', owner: 'u8', due: day(1), status: 'In progress' },
  { id: 'PR-296', title: 'Training – field staff app', client: 'Campaign agency, Bengaluru', type: 'Training', owner: 'u7', due: day(2), status: 'Scheduled' },
  { id: 'PR-293', title: 'Telugu SMS templates', client: 'MLA Office, Serilingampally', type: 'Feature query', owner: 'u8', due: day(3), status: 'In progress' },
  { id: 'PR-290', title: 'Report export to PDF', client: 'Strategy consultancy', type: 'Product bug', owner: 'u10', due: day(4), status: 'Escalated' },
];

// Organisation-wide headline numbers for the Business Head view (from the Neta360 plan).
export const SUMMARY = {
  totalLeads: 2450, newThisMonth: 385, qualified: 620, demos: 145, proposals: 72, pilots: 18, won: 12,
  pipelineValue: 18500000, expectedRevenue: 7200000,
  funnel: [['New Lead', 385], ['Contacted', 320], ['Qualified', 620], ['Demo Completed', 145], ['Proposal Sent', 72], ['Pilot', 18], ['Won', 12], ['Lost', 28]],
  byState: [['Telangana', 650], ['Andhra Pradesh', 420], ['Karnataka', 280], ['Maharashtra', 210], ['Tamil Nadu', 180], ['Others', 120]],
  bySource: [['LinkedIn', 28], ['Direct Meeting', 18], ['Referral', 15], ['WhatsApp', 12], ['Google', 10], ['Political Consultant', 8], ['Event', 5], ['Others', 4]],
  revenue: [['Apr', 8], ['May', 12], ['Jun', 18], ['Jul', 24], ['Aug', 32], ['Sep', 48]],
  bdePerf: [['u3', 180, 35, 18, 4, 1600000], ['u4', 165, 28, 16, 3, 1200000], ['u5', 140, 24, 12, 3, 1100000], ['u6', 100, 18, 10, 2, 800000]],
  demoToProposal: 23, proposalToWon: 22,
};

// Daily BDE targets from the Neta360 sales plan.
export const BDE_TARGETS = [
  ['Prospects researched', 22, 30], ['Calls made', 18, 25], ['WhatsApp intros', 7, 10],
  ['Follow-ups done', 3, 5], ['Demos booked', 1, 2], ['Meetings held', 0, 1],
];
export const MONTHLY_TARGETS = { u3: 1600000, u4: 1800000, u5: 1600000, u6: 1400000 };

export const SYSTEM_HEALTH = [
  ['Application servers', 'Operational', '99.98% uptime'], ['API gateway', 'Operational', 'p95 180 ms'],
  ['Database cluster', 'Operational', 'CPU 41%'], ['WhatsApp Business API', 'Degraded', 'Template delays ~4 min'],
  ['SMS gateway', 'Operational', 'Delivery 97.2%'], ['Mobile app sync', 'Operational', 'Last sync 2 min ago'],
];

export const PLAYBOOKS = [
  { name: 'MLA Demo', flow: 'Dashboard → Constituency → Mandals → Villages/Wards → Booths → Citizens → Grievances → Development Works → Schemes → Events → Reports' },
  { name: 'MP Demo', flow: 'Parliamentary constituency → Assembly segments → Districts → Development works → Government projects → Citizen requests' },
  { name: 'Consultant Demo', flow: 'Multiple constituencies → Multiple clients → Surveys → Field teams → Reporting → Analytics → Communication' },
];
