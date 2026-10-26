import { Spinner } from './Spinner.jsx';

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  className = '',
  children,
  type,
  disabled,
  ...props
}) {
  const isButton = Component === 'button';
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    loading ? 'is-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      {...props}
      className={classes}
      {...(isButton ? { type: type || 'button', disabled: disabled || loading } : {})}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner size={16} /> : Icon ? <Icon size={17} strokeWidth={1.7} aria-hidden="true" /> : null}
      {children ? <span>{children}</span> : null}
      {IconRight && !loading ? <IconRight size={16} strokeWidth={1.7} aria-hidden="true" /> : null}
    </Component>
  );
}

export function IconButton({ label, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`.trim()}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}
