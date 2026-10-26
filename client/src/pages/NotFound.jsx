import { Link } from 'react-router-dom';
import { Compass, Shirt } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export function NotFound() {
  return (
    <div className="page page--notfound">
      <div className="shell section--top">
        <EmptyState
          icon={Compass}
          eyebrow="404 · A missed turn"
          title="This page is not part of the edit."
          description="The address may have changed, or the link may have been mistyped. Lumé’s scan, looks, fitting room, and planner are all still here."
          actionLabel="Return to the scan"
          actionTo="/"
          secondary={
            <Button as={Link} to="/looks" variant="secondary" icon={Shirt}>
              Browse the looks
            </Button>
          }
        />
      </div>
    </div>
  );
}
