import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Beaker,
  CalendarPlus,
  CameraOff,
  ChevronDown,
  CircleAlert,
  Droplets,
  Info,
  Leaf,
  Moon,
  Printer,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { useScan } from '../contexts/ScanContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { AddToPlannerDialog } from '../components/AddToPlannerDialog.jsx';
import { Button } from '../components/Button.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ScanProgress } from '../components/ScanProgress.jsx';
import { ScoreRing } from '../components/ScoreRing.jsx';
import { SectionHeading } from '../components/SectionHeading.jsx';
import { Tag } from '../components/Tag.jsx';
import { getDemoReport } from '../services/demoReport.js';
import {
  REGION_LABELS,
  buildRoutine,
  concernReading,
  formatScore,
  reportDateLabel,
  reportSummary,
  routineForPlanner,
  scoreBand,
} from '../services/reportContent.js';

const DEPTH_LABELS = {
  essential: 'Essential study',
  complete: 'Complete study',
};

function SampleBanner() {
  return (
    <div className="sample-banner" role="note">
      <span className="sample-banner__tag">Sample fixture</span>
      <p>
        This is a clearly labelled interface preview, <strong>not a live skin scan</strong>. The
        scores and advice below are illustrative only.
      </p>
    </div>
  );
}

function RegionRow({ region }) {
  const label = REGION_LABELS[region.region] || region.region.replaceAll('_', ' ');
  const band = scoreBand(region.score);
  return (
    <div className="region-row">
      <div className="region-row__label">
        <span>{label}</span>
        <span>{formatScore(region.score)}</span>
      </div>
      <div className="meter meter--small" aria-hidden="true">
        <span
          className={`meter__fill meter__fill--${band?.tone || 'balanced'}`}
          style={{ width: `${Number.isFinite(region.score) ? region.score : 0}%` }}
        />
      </div>
    </div>
  );
}

function MeasurementCard({ measurement }) {
  const band = scoreBand(measurement.score);
  const reading = concernReading(measurement);
  const shownRegions = (measurement.regions || []).filter((region) => region.region !== 'whole');

  return (
    <article className={`measurement-card measurement-card--${band?.tone || 'balanced'}`}>
      <header className="measurement-card__header">
        <div>
          <p className="eyebrow">Signal</p>
          <h3>{measurement.label}</h3>
          <p className="measurement-card__short">{measurement.short}</p>
        </div>
        <div className="measurement-card__score">
          <strong>{formatScore(measurement.score)}</strong>
          <span>{band?.label || 'No score'}</span>
        </div>
      </header>
      <div
        className="meter"
        role="img"
        aria-label={`${measurement.label}: ${formatScore(measurement.score)} out of 100`}
      >
        <span
          className={`meter__fill meter__fill--${band?.tone || 'balanced'}`}
          style={{ width: `${Number.isFinite(measurement.score) ? measurement.score : 0}%` }}
        />
      </div>
      <p className="measurement-card__plain">{measurement.plain}</p>

      {shownRegions.length ? (
        <div className="region-list">
          <p className="eyebrow">By area</p>
          {shownRegions.map((region) => (
            <RegionRow key={`${measurement.key}-${region.region}`} region={region} />
          ))}
        </div>
      ) : null}

      <details className="measurement-details">
        <summary>
          <span>Read the care notes</span>
          <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" />
        </summary>
        <div className="measurement-details__body">
          <p>{reading.read}</p>
          <p className="measurement-details__care">{measurement.care}</p>
          {measurement.ingredients?.length ? (
            <div>
              <p className="eyebrow">Ingredient directions</p>
              <div className="chip-row">
                {measurement.ingredients.map((ingredient) => (
                  <span key={ingredient} className="chip">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {measurement.productTypes?.length ? (
            <div>
              <p className="eyebrow">Product textures to consider</p>
              <ul className="tag-list">
                {measurement.productTypes.map((product) => (
                  <li key={product}>{product}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </details>
    </article>
  );
}

function RoutineColumn({ icon: Icon, title, items, note }) {
  return (
    <article className="routine-column">
      <div className="routine-column__heading">
        <span className="routine-column__icon" aria-hidden="true">
          <Icon size={18} strokeWidth={1.6} />
        </span>
        <div>
          <p className="eyebrow">Routine</p>
          <h3>{title}</h3>
        </div>
      </div>
      <ol className="routine-list">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
      {note ? <p className="routine-column__note">{note}</p> : null}
    </article>
  );
}

function ReportEmpty({ busy, status, preview, submittedDepth, sampleRequested, demoAvailable }) {
  const depthLabel = DEPTH_LABELS[submittedDepth] || 'Skin study';
  if (busy) {
    return (
      <div className="shell report-waiting">
        <ScanProgress status={status} depthLabel={depthLabel} preview={preview} />
      </div>
    );
  }

  return (
    <div className="shell section--top">
      <EmptyState
        icon={ScanFace}
        eyebrow="Your skin report"
        title={sampleRequested ? 'The sample is unavailable.' : 'No study has been read yet.'}
        description={
          sampleRequested
            ? 'Sample fixtures are disabled on this server. Add a YouCam API key to run a live study instead.'
            : 'Begin with one clear portrait. Lumé will return a real Skin AI report here, with scores, context, and a routine you can keep.'
        }
        actionLabel="Begin a skin study"
        actionTo="/"
        secondary={
          demoAvailable && !sampleRequested ? (
            <Button as={Link} to="/report?sample=1" variant="ghost">
              View a sample report
            </Button>
          ) : null
        }
      />
    </div>
  );
}

export function Report() {
  const [searchParams] = useSearchParams();
  const sampleRequested = searchParams.get('sample') === '1';
  const { demoAvailable, skinFeatures } = useConfig();
  const {
    report,
    status,
    busy,
    preview,
    submittedDepth,
    clearReport,
  } = useScan();
  const { showToast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const sampleMode = sampleRequested && demoAvailable;
  const sampleReport = useMemo(() => (sampleMode ? getDemoReport() : null), [sampleMode]);
  const displayReport = sampleMode ? sampleReport : report;

  if (!displayReport) {
    return (
      <div className="page page--report">
        <ReportEmpty
          busy={busy}
          status={status}
          preview={preview}
          submittedDepth={submittedDepth}
          sampleRequested={sampleRequested}
          demoAvailable={demoAvailable}
        />
      </div>
    );
  }

  const routine = buildRoutine(displayReport);
  const isSample = displayReport.source === 'demo';
  const depthLabel =
    DEPTH_LABELS[displayReport.depth] ||
    skinFeatures?.depths?.find((depth) => depth.id === displayReport.depth)?.label ||
    'Skin study';
  const skinTypeEntries = Object.entries(displayReport.skinType || {}).filter(([, value]) => value);
  const measurements = displayReport.measurements || [];
  const focusMeasurements = (displayReport.focusAreas || [])
    .map((key) => measurements.find((measurement) => measurement.key === key))
    .filter(Boolean);

  function handleConfirmDelete() {
    setDeleteOpen(false);
    clearReport();
    showToast('The report was cleared from this browser tab.', { type: 'info' });
  }

  return (
    <div className={`page page--report ${isSample ? 'page--sample' : ''}`.trim()}>
      <section className="report-hero">
        <div className="shell">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Scan</Link>
            <span aria-hidden="true">/</span>
            <span>{isSample ? 'Sample report' : 'Skin report'}</span>
          </nav>

          {isSample ? <SampleBanner /> : null}

          <div className="report-hero__grid">
            <div className="report-hero__copy">
              <p className="eyebrow">
                <span className="eyebrow__line" aria-hidden="true" />
                {isSample ? 'Interface preview · not a scan' : 'Live Skin AI · v2.1'}
              </p>
              <h1>{isSample ? 'A sample reading, clearly marked.' : 'Your skin, read with care.'}</h1>
              <p className="report-hero__lede">{reportSummary(displayReport)}</p>
              <div className="report-meta">
                <Tag tone={isSample ? 'sample' : 'plum'}>
                  {isSample ? 'Sample data' : 'Live YouCam result'}
                </Tag>
                <span>{reportDateLabel(displayReport)}</span>
                <span>{depthLabel}</span>
                <span>{displayReport.engine}</span>
              </div>
            </div>
            <div className="report-actions">
              <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
                Print / Save PDF
              </Button>
              <Button
                variant="secondary"
                icon={CalendarPlus}
                onClick={() => setPlannerOpen(true)}
              >
                Add routine to planner
              </Button>
              {!isSample ? (
                <Button variant="ghost" icon={Trash2} onClick={() => setDeleteOpen(true)}>
                  Clear report
                </Button>
              ) : (
                <Button as={Link} to="/" variant="ghost" icon={ScanFace}>
                  Run a live study
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="shell report-overview">
        <div className="overview-score">
          <div className="overview-score__ring">
            <ScoreRing
              score={displayReport.overall?.value}
              size={210}
              label="Overall skin reading"
              caption={
                displayReport.overall?.source === 'average'
                  ? 'Average of returned signals'
                  : displayReport.overall?.source === 'fixture'
                    ? 'Sample summary'
                    : 'From Skin AI'
              }
            />
          </div>
          <div className="overview-score__copy">
            <p className="eyebrow">The overall picture</p>
            <h2>{scoreBand(displayReport.overall?.value)?.label || 'A quiet snapshot'}</h2>
            <p>{reportSummary(displayReport)}</p>
            <div className="overview-focus">
              <span className="eyebrow">First areas to consider</span>
              <div className="chip-row">
                {focusMeasurements.length ? (
                  focusMeasurements.map((measurement) => (
                    <span key={measurement.key} className="chip chip--plum">
                      {measurement.label} · {formatScore(measurement.score)}
                    </span>
                  ))
                ) : (
                  <span className="muted-copy">No focus signals were returned.</span>
                )}
              </div>
            </div>
            <p className="inline-note">
              <Info size={14} strokeWidth={1.7} aria-hidden="true" />
              A higher score means the signal read strongly in this photo. It is not a health grade.
            </p>
          </div>
        </div>

        <aside className="overview-aside">
          <div className="overview-card">
            <div className="overview-card__heading">
              <Droplets size={18} strokeWidth={1.6} aria-hidden="true" />
              <h3>The snapshot</h3>
            </div>
            {skinTypeEntries.length ? (
              <dl className="snapshot-list">
                {skinTypeEntries.map(([region, value]) => (
                  <div key={region}>
                    <dt>{REGION_LABELS[region] || region.replaceAll('_', ' ')}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="muted-copy">Skin type was not included in this study.</p>
            )}
            {Number.isFinite(displayReport.skinAge) ? (
              <div className="snapshot-age">
                <span>AI skin age</span>
                <strong>{Math.round(displayReport.skinAge)}</strong>
                <small>One reading, not a biological measure.</small>
              </div>
            ) : null}
          </div>

          <div className="overview-card overview-card--privacy">
            <div className="overview-card__heading">
              <CameraOff size={18} strokeWidth={1.6} aria-hidden="true" />
              <h3>Your photo stays private</h3>
            </div>
            <p>
              Lumé does not save the portrait you uploaded. This report contains scores and language
              only, stored for this browser tab.
            </p>
            <span className="inline-note">
              <ShieldCheck size={14} strokeWidth={1.7} aria-hidden="true" />
              Provider processing retention: 24 hours.
            </span>
          </div>
        </aside>
      </section>

      <section className="section readings-section" aria-labelledby="readings-title">
        <div className="shell">
          <SectionHeading
            eyebrow="The readings"
            title="What Skin AI noticed."
            description="These are the HD concerns measured in your selected study. Open any card for the gentler context, ingredient directions, and care notes."
            id="readings-title"
            action={
              <span className="section-count">
                {measurements.length} {measurements.length === 1 ? 'concern reading' : 'concern readings'}
              </span>
            }
          />
          <div className="measurement-grid">
            {measurements.map((measurement) => (
              <MeasurementCard key={measurement.type} measurement={measurement} />
            ))}
          </div>
        </div>
      </section>

      <section className="section routine-section" aria-labelledby="routine-title">
        <div className="shell">
          <SectionHeading
            eyebrow="A routine to keep"
            title="Start smaller than you think."
            description="Built from the returned signals, this is a calm starting point — not a prescription. Introduce one change at a time and let your skin respond."
            id="routine-title"
            action={
              <Button variant="secondary" icon={CalendarPlus} onClick={() => setPlannerOpen(true)}>
                Add to my week
              </Button>
            }
          />
          <div className="routine-grid">
            <RoutineColumn icon={Sun} title="Morning" items={routine.morning} />
            <RoutineColumn icon={Moon} title="Evening" items={routine.evening} />
          </div>
          <div className="routine-pause">
            <span className="routine-pause__icon" aria-hidden="true">
              <Leaf size={20} strokeWidth={1.5} />
            </span>
            <div>
              <p className="eyebrow">The weekly rhythm</p>
              <p>{routine.weekly}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="shell report-care-note">
          <div className="report-care-note__item">
            <Beaker size={19} strokeWidth={1.5} aria-hidden="true" />
            <div>
              <h3>Patch test, always.</h3>
              <p>
                Introduce new actives one at a time on a small area. Stop anything that stings,
                burns, or leaves the skin more reactive.
              </p>
            </div>
          </div>
          <div className="report-care-note__item">
            <Sparkles size={19} strokeWidth={1.5} aria-hidden="true" />
            <div>
              <h3>One photo is one snapshot.</h3>
              <p>
                Light, angle, sleep, hormones, and makeup all change what the model sees. Compare
                trends over time, never a single score.
              </p>
            </div>
          </div>
          <div className="report-care-note__item">
            <CircleAlert size={19} strokeWidth={1.5} aria-hidden="true" />
            <div>
              <h3>Not medical advice.</h3>
              <p>
                For persistent acne, pain, rashes, or sudden changes, speak with a qualified
                dermatologist or clinician.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="closing-note closing-note--report">
        <div className="shell closing-note__inner">
          <p className="eyebrow">Carry it forward</p>
          <h2>Let the insight change the week, not your face.</h2>
          <p>
            See a garment on your own frame, find a look that fits the plan, or carry this routine
            into a calmer seven days.
          </p>
          <div className="cluster">
            <Button as={Link} to="/try-on" iconRight={ArrowRight}>
              Try on a piece
            </Button>
            <Button as={Link} to="/looks" variant="secondary">
              Find a look
            </Button>
            <Button as={Link} to="/planner" variant="ghost">
              Open the planner
            </Button>
          </div>
        </div>
      </section>

      <AddToPlannerDialog
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        eyebrow={isSample ? 'Sample routine · interface preview' : 'From your skin report'}
        title={isSample ? 'Add the sample routine?' : 'Add this routine to your week'}
        initialDate={new Date()}
        initialTitle={isSample ? 'Sample skin ritual' : 'Skin ritual'}
        initialOccasion="Skin ritual"
        initialBeauty={routineForPlanner(displayReport)}
        initialNotes={
          isSample
            ? 'From a sample report — not a live scan. Use this to preview the planner.'
            : reportSummary(displayReport)
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        eyebrow="Clear this tab"
        title="Clear this report?"
        description="The scores and summary will be removed from this browser tab. This cannot be undone."
        confirmLabel="Clear report"
        tone="danger"
      >
        <p className="modal-copy">
          Your photo was never saved, so there is no image to remove. If you want to keep the report,
          use Print / Save PDF first.
        </p>
      </ConfirmDialog>
    </div>
  );
}
