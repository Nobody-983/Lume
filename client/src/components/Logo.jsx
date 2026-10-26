import { Link } from 'react-router-dom';

export function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`brand ${className}`.trim()} aria-label="Lumé home">
      <span className="brand__word">Lumé</span>
      <span className="brand__mark" aria-hidden="true">
        <span />
        <span />
      </span>
    </Link>
  );
}
