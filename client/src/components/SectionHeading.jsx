export function SectionHeading({ eyebrow, title, description, align = 'left', action = null, id }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <div className="section-heading__text">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 id={id}>{title}</h2>
        {description ? <p className="section-heading__description">{description}</p> : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}
