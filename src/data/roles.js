import {
  LayoutDashboard, Users, Columns3, MonitorPlay, FileText, UsersRound, Headset,
  ClipboardCheck, Server, Sun, Boxes, House, User, Building2, Contact, Target,
  CalendarCheck, CalendarDays, Presentation, FilePenLine, ChartColumn, UserCog, Settings,
  PhoneCall, UserPlus, Flag, FileCheck, FileChartColumn, Inbox, GraduationCap, Settings2, BookOpen,
  Ticket, Timer, RefreshCw, MessageSquare, Bug, CircleArrowUp, Activity, Plug, Rocket, Shield,
} from 'lucide-react';

export const ROLES = {
  bh: { key: 'bh', label: 'Business Head', desc: 'Executive management', user: 'u1', home: '/dashboard', color: '#0F1F3A' },
  bdm: { key: 'bdm', label: 'BDM', desc: 'Business Development Manager', user: 'u2', home: '/team', color: '#C2410C' },
  bde: { key: 'bde', label: 'BDE', desc: 'Business Development Executive', user: 'u3', home: '/my-day', color: '#0B6B3A' },
  ps: { key: 'ps', label: 'Product Support', desc: 'Product Specialist', user: 'u7', home: '/product', color: '#6D28D9' },
  cs: { key: 'cs', label: 'Customer Support', desc: 'Customer Success', user: 'u9', home: '/support', color: '#0F766E' },
  ts: { key: 'ts', label: 'Technical Support', desc: 'Technical Team', user: 'u10', home: '/tech', color: '#1D4ED8' },
};

// Which roles can open each route.
export const ACCESS = {
  '/dashboard': ['bh'],
  '/team': ['bh', 'bdm'],
  '/my-day': ['bde'],
  '/leads': ['bh', 'bdm', 'bde', 'ps'],
  '/pipeline': ['bh', 'bdm', 'bde'],
  '/demos': ['bh', 'bdm', 'bde', 'ps'],
  '/proposals': ['bh', 'bdm', 'bde'],
  '/product': ['ps', 'bh'],
  '/support': ['cs', 'bh'],
  '/onboarding': ['cs', 'ps', 'bh'],
  '/tech': ['ts', 'bh'],
  '/organizations': ['bh'],
  '/contacts': ['bh'],
  '/activities': ['bh', 'bde'],
  '/calendar': ['bh', 'bde'],
  '/contracts': ['bh'],
  '/customers': ['bh', 'cs'],
  '/reports': ['bh', 'bdm'],
  '/settings': ['bh'],
  '/follow-ups': ['bde'],
  '/allocation': ['bdm', 'bh'],
  '/performance': ['bdm', 'bh'],
  '/targets': ['bdm', 'bh'],
  '/requests': ['ps', 'bh'],
  '/trainings': ['ps', 'bh'],
  '/configurations': ['ps', 'bh'],
  '/knowledge-base': ['ps', 'bh'],
  '/tickets': ['cs', 'bh'],
  '/sla': ['cs', 'bh'],
  '/renewals': ['cs', 'bh'],
  '/feedback': ['cs', 'bh'],
  '/issues': ['ts', 'bh'],
  '/escalations': ['ts', 'bh'],
  '/system-health': ['ts', 'bh'],
  '/integrations': ['ts', 'bh'],
  '/deployments': ['ts', 'bh'],
  '/security': ['ts', 'bh'],
};

// Business Head menu, in the order of the Neta360 dashboard design.
const BH_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: House },
  { to: '/leads', label: 'Leads', icon: User },
  { to: '/organizations', label: 'Organizations', icon: Building2 },
  { to: '/contacts', label: 'Contacts', icon: Contact },
  { to: '/pipeline', label: 'Opportunities', icon: Target },
  { to: '/activities', label: 'Activities', icon: CalendarCheck },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/demos', label: 'Demos', icon: Presentation },
  { to: '/proposals', label: 'Proposals', icon: FileText },
  { to: '/contracts', label: 'Contracts', icon: FilePenLine },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/reports', label: 'Reports', icon: ChartColumn },
  { to: '/team', label: 'Team Management', icon: UserCog },
  { to: '/settings', label: 'Settings', icon: Settings },
];

// Menus for the other roles, limited to what each role is allowed to open.
const ROLE_NAV = {
  bde: [
    { to: '/my-day', label: 'Dashboard', icon: House },
    { to: '/leads', label: 'My Leads', icon: User },
    { to: '/follow-ups', label: 'Follow-ups', icon: PhoneCall },
    { to: '/pipeline', label: 'My Pipeline', icon: Target },
    { to: '/demos', label: 'Demos', icon: Presentation },
    { to: '/proposals', label: 'Proposals', icon: FileText },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/activities', label: 'Activities', icon: CalendarCheck },
  ],
  bdm: [
    { to: '/team', label: 'Dashboard', icon: House },
    { to: '/leads', label: 'Team Leads', icon: Users },
    { to: '/pipeline', label: 'Pipeline', icon: Target },
    { to: '/allocation', label: 'Lead Allocation', icon: UserPlus },
    { to: '/performance', label: 'Team Performance', icon: ChartColumn },
    { to: '/targets', label: 'Targets', icon: Flag },
    { to: '/demos', label: 'Demos', icon: Presentation },
    { to: '/proposals', label: 'Proposal Approvals', icon: FileCheck },
    { to: '/reports', label: 'Reports', icon: FileChartColumn },
  ],
  ps: [
    { to: '/product', label: 'Dashboard', icon: House },
    { to: '/requests', label: 'Product Requests', icon: Inbox },
    { to: '/demos', label: 'Demos', icon: Presentation },
    { to: '/trainings', label: 'Trainings', icon: GraduationCap },
    { to: '/onboarding', label: 'Onboarding', icon: ClipboardCheck },
    { to: '/configurations', label: 'Configurations', icon: Settings2 },
    { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  ],
  cs: [
    { to: '/support', label: 'Dashboard', icon: House },
    { to: '/tickets', label: 'Tickets', icon: Ticket },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/onboarding', label: 'Onboarding', icon: ClipboardCheck },
    { to: '/sla', label: 'SLA', icon: Timer },
    { to: '/renewals', label: 'Renewals', icon: RefreshCw },
    { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  ],
  ts: [
    { to: '/tech', label: 'Dashboard', icon: House },
    { to: '/issues', label: 'Issues & Bugs', icon: Bug },
    { to: '/escalations', label: 'Escalated Tickets', icon: CircleArrowUp },
    { to: '/system-health', label: 'System Health', icon: Activity },
    { to: '/integrations', label: 'Integrations', icon: Plug },
    { to: '/deployments', label: 'Deployments', icon: Rocket },
    { to: '/security', label: 'Security', icon: Shield },
  ],
};

// Pages that exist as placeholders until they are designed.
export const PLACEHOLDER_PAGES = {
  '/organizations': 'Organizations',
  '/contacts': 'Contacts',
  '/activities': 'Activities',
  '/calendar': 'Calendar',
  '/contracts': 'Contracts',
  '/customers': 'Customers',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/allocation': 'Lead Allocation',
  '/performance': 'Team Performance',
  '/targets': 'Targets',
  '/requests': 'Product Requests',
  '/trainings': 'Trainings',
  '/configurations': 'Configurations',
  '/knowledge-base': 'Knowledge Base',
  '/tickets': 'Tickets',
  '/sla': 'SLA',
  '/renewals': 'Renewals',
  '/feedback': 'Feedback',
  '/issues': 'Issues & Bugs',
  '/escalations': 'Escalated Tickets',
  '/system-health': 'System Health',
  '/integrations': 'Integrations',
  '/deployments': 'Deployments',
  '/security': 'Security',
};

const ALL_NAV = [
  { to: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { to: '/my-day', label: 'My Day', icon: Sun },
  { to: '/team', label: 'Team Dashboard', icon: UsersRound },
  { to: '/product', label: 'Product Dashboard', icon: Boxes },
  { to: '/support', label: 'Support Dashboard', icon: Headset },
  { to: '/tech', label: 'Tech Dashboard', icon: Server },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/pipeline', label: 'Pipeline', icon: Columns3 },
  { to: '/demos', label: 'Demos', icon: MonitorPlay },
  { to: '/proposals', label: 'Proposals', icon: FileText },
  { to: '/onboarding', label: 'Onboarding', icon: ClipboardCheck },
];

export const navFor = (role) => {
  if (role === 'bh') return BH_NAV;
  if (ROLE_NAV[role]) return ROLE_NAV[role];
  const items = ALL_NAV.filter((n) => ACCESS[n.to].includes(role));
  // Put the role's home first.
  const home = ROLES[role].home;
  return [...items.filter((i) => i.to === home), ...items.filter((i) => i.to !== home)];
};

export const canAccess = (role, path) => {
  const base = '/' + path.split('/')[1];
  return (ACCESS[base] || []).includes(role);
};
