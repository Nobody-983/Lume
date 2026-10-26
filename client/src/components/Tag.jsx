export function Tag({ children, tone = 'neutral', className = '' }) {
  return <span className={`tag tag--${tone} ${className}`.trim()}>{children}</span>;
}
