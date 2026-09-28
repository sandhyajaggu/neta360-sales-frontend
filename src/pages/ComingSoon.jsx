import { Construction } from 'lucide-react';
import { Card, PageHead } from '../components/ui';

// Placeholder for Business Head menu items whose pages are not designed yet.
export default function ComingSoon({ title }) {
  return (
    <>
      <PageHead title={title} />
      <Card>
        <div className="coming-soon">
          <Construction size={32} aria-hidden="true" />
          <h2>{title} is coming soon</h2>
          <p className="muted">This page is part of the Neta360 menu but has not been built yet.</p>
        </div>
      </Card>
    </>
  );
}
