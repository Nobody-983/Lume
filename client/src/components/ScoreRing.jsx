import { scoreBand } from '../services/reportContent.js';

export function ScoreRing({ score, size = 196, label = 'Overall score', tone, caption }) {
  const value = Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
  const band = scoreBand(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const ringTone = tone || band?.tone || 'balanced';

  return (
    <div
      className={`score-ring score-ring--${ringTone}`}
      style={{ '--ring-size': `${size}px` }}
      role="img"
      aria-label={`${label}: ${Number.isFinite(score) ? Math.round(score) : 'not returned'} out of 100. ${band?.label || ''}`}
    >
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <circle className="score-ring__track" cx="90" cy="90" r={radius} />
        <circle
          className="score-ring__progress"
          cx="90"
          cy="90"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring__value">
        <strong>{Number.isFinite(score) ? Math.round(score) : '—'}</strong>
        <span>{band?.label || 'No score'}</span>
        {caption ? <small>{caption}</small> : null}
      </div>
    </div>
  );
}
