import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon,
  eyebrow = 'An open page',
  title,
  description,
  actionLabel,
  actionTo,
  actionOnClick,
  secondary,
}) {
  return (
    <section className="empty-state">
      <div className="empty-state__art" aria-hidden="true">
        <span className="empty-state__orb" />
        <span className="empty-state__line" />
        {Icon ? (
          <span className="empty-state__icon">
            <Icon size={28} strokeWidth={1.4} />
          </span>
        ) : null}
      </div>
      <div className="empty-state__copy">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="cluster">
          {actionTo ? (
            <Button as={Link} to={actionTo} iconRight={ArrowRight}>
              {actionLabel}
            </Button>
          ) : actionOnClick ? (
            <Button onClick={actionOnClick} iconRight={ArrowRight}>
              {actionLabel}
            </Button>
          ) : null}
          {secondary}
        </div>
      </div>
    </section>
  );
}
