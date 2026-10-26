import { Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback.jsx';
import { Spinner } from './Spinner.jsx';

const STEPS = [
  { key: 'upload', title: 'Photo sent securely', copy: 'A private, in-memory handoff to Skin AI.' },
  { key: 'measure', title: 'Skin AI is measuring', copy: 'Up to eight HD concerns are read from your portrait.' },
  { key: 'compose', title: 'Lumé is composing', copy: 'Scores become plain-language context, not a verdict.' },
];

export function ScanProgress({ status, depthLabel, preview }) {
  const activeIndex = status === 'uploading' ? 0 : 1;

  return (
    <div className="scan-progress" role="status" aria-live="polite">
      <div className="scan-progress__visual">
        <div className="scan-progress__portrait">
          {preview ? (
            <ImageWithFallback src={preview} alt="The portrait being analysed" loading="eager" />
          ) : (
            <div className="scan-progress__placeholder" />
          )}
          <span className="scan-progress__scanline" aria-hidden="true" />
          <span className="scan-progress__glow" aria-hidden="true" />
        </div>
        <span className="scan-progress__badge">
          <Sparkles size={14} strokeWidth={1.7} aria-hidden="true" />
          {depthLabel}
        </span>
      </div>

      <div className="scan-progress__copy">
        <p className="eyebrow">Your study is in progress</p>
        <h3>Reading the quiet details.</h3>
        <p>
          Skin AI typically takes 20–60 seconds. Keep this tab open — your report will appear here,
          and in <Link to="/report">Report</Link>, when it is ready.
        </p>
        <ol className="scan-steps">
          {STEPS.map((step, index) => {
            const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'waiting';
            return (
              <li key={step.key} className={`scan-step scan-step--${state}`}>
                <span className="scan-step__marker" aria-hidden="true">
                  {state === 'done' ? (
                    '✓'
                  ) : state === 'active' ? (
                    <Spinner size={12} />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.copy}</small>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="inline-note">
          <LockKeyhole size={14} strokeWidth={1.7} aria-hidden="true" />
          Lumé keeps no photo on disk. YouCam documents a 24-hour processing window.
        </p>
        <Link to="/looks" className="text-link">
          Browse the looks while you wait <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
