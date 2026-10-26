export function Spinner({ size = 18, className = '' }) {
  return (
    <span
      className={`spinner ${className}`.trim()}
      style={{ '--spinner-size': `${size}px` }}
      aria-hidden="true"
    />
  );
}
