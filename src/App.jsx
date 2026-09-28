import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { Card } from './components/ui';
import { useAuth } from './context/AppContext';
import { canAccess, PLACEHOLDER_PAGES, ROLES } from './data/roles';
import Login from './pages/Login';
import ComingSoon from './pages/ComingSoon';
import DashBusinessHead from './pages/DashBusinessHead';
import DashBDM from './pages/DashBDM';
import DashBDE from './pages/DashBDE';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Pipeline from './pages/Pipeline';
import Demos from './pages/Demos';
import { ProposalBuilder, ProposalList } from './pages/Proposals';
import { CustomerSupport, Onboarding, ProductSupport, TechSupport } from './pages/Support';

function Guard({ children }) {
  const { session, role } = useAuth();
  const { pathname } = useLocation();
  if (!session) return <Navigate to="/login" replace />;
  if (!canAccess(role, pathname)) {
    return (
      <Card title="You don’t have access to this page">
        <p className="muted">Your role ({ROLES[role].label}) can’t open {pathname}. Use the menu to go to a page you can access, or switch role from your profile menu.</p>
      </Card>
    );
  }
  return children;
}

export default function App() {
  const { session, roleInfo } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to={roleInfo.home} replace /> : <Login />} />
      <Route element={session ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to={roleInfo?.home || '/login'} replace />} />
        <Route path="/dashboard" element={<Guard><DashBusinessHead /></Guard>} />
        <Route path="/team" element={<Guard><DashBDM /></Guard>} />
        <Route path="/my-day" element={<Guard><DashBDE /></Guard>} />
        <Route path="/leads" element={<Guard><Leads /></Guard>} />
        <Route path="/leads/:id" element={<Guard><LeadDetail /></Guard>} />
        <Route path="/pipeline" element={<Guard><Pipeline /></Guard>} />
        <Route path="/demos" element={<Guard><Demos /></Guard>} />
        <Route path="/proposals" element={<Guard><ProposalList /></Guard>} />
        <Route path="/proposals/new" element={<Guard><ProposalBuilder key="new" /></Guard>} />
        <Route path="/proposals/:id" element={<Guard><ProposalBuilderKeyed /></Guard>} />
        <Route path="/product" element={<Guard><ProductSupport /></Guard>} />
        <Route path="/support" element={<Guard><CustomerSupport /></Guard>} />
        <Route path="/onboarding" element={<Guard><Onboarding /></Guard>} />
        <Route path="/tech" element={<Guard><TechSupport /></Guard>} />
        <Route path="/follow-ups" element={<Guard><Navigate to="/leads?tab=due" replace /></Guard>} />
        {Object.entries(PLACEHOLDER_PAGES).map(([path, title]) => (
          <Route key={path} path={path} element={<Guard><ComingSoon title={title} /></Guard>} />
        ))}
        <Route path="*" element={<Card title="Page not found"><p className="muted">Use the menu to continue.</p></Card>} />
      </Route>
    </Routes>
  );
}

// Remount the builder when switching between proposals so its form state resets.
function ProposalBuilderKeyed() {
  const { pathname } = useLocation();
  return <ProposalBuilder key={pathname} />;
}
