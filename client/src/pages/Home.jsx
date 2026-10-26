import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleAlert,
  KeyRound,
  LockKeyhole,
  ScanFace,
  ShieldCheck,
  Shirt,
  Sparkles,
} from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { useScan } from '../contexts/ScanContext.jsx';
import { Button } from '../components/Button.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { ImageWithFallback } from '../components/ImageWithFallback.jsx';
import { ScanProgress } from '../components/ScanProgress.jsx';
import { ScoreRing } from '../components/ScoreRing.jsx';
import { SectionHeading } from '../components/SectionHeading.jsx';
import { Tag } from '../components/Tag.jsx';
import { UploadZone } from '../components/UploadZone.jsx';
import { reportDateLabel, reportSummary } from '../services/reportContent.js';

const DEPTHS = [
  {
    id: 'essential',
    name: 'Essential study',
    kicker: 'A focused first read',
    summary: 'Four core signals for a clear, uncomplicated starting point.',
    concerns: ['Texture', 'Pores', 'Redness', 'Blemishes'],
    units: 12,
  },
  {
    id: 'complete',
    name: 'Complete study',
    kicker: 'The full picture',
    summary: 'All eight HD concerns and skin type for a more dimensional report.',
    concerns: ['Texture', 'Pores', 'Redness', 'Blemishes', 'Hydration', 'Radiance', 'Oil balance', 'Skin type'],
    units: 16,
  },
];

const CONCERN_KEYS = {
  texture: 'texture',
  pores: 'pores',
  redness: 'redness',
  acne: 'blemishes',
  blemishes: 'blemishes',
};

function DepthOption({ option, selected, onSelect, units, disabled }) {
  return (
    <label className={`depth-card ${selected ? 'is-selected' : ''}`.trim()}>
      <input
        type="radio"
        name="skin-depth"
        value={option.id}
        checked={selected}
        onChange={() => onSelect(option.id)}
        disabled={disabled}
      />
      <span className="depth-card__top">
        <span>
          <span className="depth-card__kicker">{option.kicker}</span>
          <span className="depth-card__name">{option.name}</span>
        </span>
        <span className="depth-card__check" aria-hidden="true">
          {selected ? <Check size={13} strokeWidth={2.4} /> : null}
        </span>
      </span>
      <span className="depth-card__summary">{option.summary}</span>
      <span className="depth-card__concerns">
        {option.concerns.map((concern) => (
          <span key={concern}>{concern}</span>
        ))}
      </span>
      <span className="depth-card__footer">
        <span>{option.concerns.length} HD signals</span>
        <span>~{units} units</span>
      </span>
    </label>
  );
}

function AnalysisResult({ report, onScanAgain }) {
  const focus = report.focusAreas?.[0];
  const focusMeasurement = report.measurements?.find(
    (measurement) => measurement.key === focus || CONCERN_KEYS[measurement.key] === focus,
  );
  const signalCount =
    report.depth === 'essential'
      ? 4
      : report.depth === 'complete'
        ? 8
        : report.measurements?.length;
  return (
    <div className="analysis-result">
      <div className="analysis-result__ring">
        <ScoreRing
          score={report.overall?.value}
          size={172}
          label="Overall skin reading"
          caption={report.overall?.source === 'average' ? 'Average of signals' : 'From Skin AI'}
        />
      </div>
      <div className="analysis-result__copy">
        <Tag tone="plum">Live Skin AI report</Tag>
        <h3>Your study is ready.</h3>
        <p>{reportSummary(report)}</p>
        <div className="analysis-result__focus">
          <span>First signal to consider</span>
          <strong>{focusMeasurement?.label || 'Your full report'}</strong>
          {focusMeasurement?.score ? <span>{Math.round(focusMeasurement.score)} / 100</span> : null}
        </div>
        <p className="meta-copy">
          Analysed {reportDateLabel(report)}
          {signalCount ? ` · ${signalCount} HD signal study` : ''}
        </p>
        <div className="cluster">
          <Button as={Link} to="/report" iconRight={ArrowRight}>
            Open my report
          </Button>
          <Button variant="ghost" onClick={onScanAgain}>
            Scan again
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const {
    file,
    preview,
    meta,
    checking,
    error,
    status,
    busy,
    depth,
    submittedDepth,
    report,
    chooseFile,
    startAnalysis,
    setDepth,
    prepareNewScan,
    dismissError,
  } = useScan();
  const {
    loading: configLoading,
    error: configError,
    configured,
    demoAvailable,
    skinFeatures,
    docs,
    refresh,
  } = useConfig();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedDepth = DEPTHS.find((option) => option.id === depth) || DEPTHS[1];
  const estimatedUnits =
    skinFeatures?.depths?.find((option) => option.id === depth)?.estimatedUnits || selectedDepth.units;
  const submittedLabel =
    DEPTHS.find((option) => option.id === submittedDepth)?.name || selectedDepth.name;
  const analysisReady = configured && !configError && file && !checking && !busy;
  const connectUrl = docs?.apiKeys || 'https://yce.makeupar.com/api-console/en/api-keys/';

  function beginScan() {
    if (status === 'success') prepareNewScan();
  }

  async function handleAnalyze() {
    setConfirmOpen(false);
    await startAnalysis();
  }

  return (
    <div className="page page--home">
      <section className="hero">
        <span className="hero__wash" aria-hidden="true" />
        <div className="shell hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__line" aria-hidden="true" />
              Skin analysis, reimagined
            </p>
            <h1>
              See your skin
              <em> in a softer light.</em>
            </h1>
            <p className="hero__lede">
              A considered read of texture, tone, and glow — translated into a routine and a week
              that feel like yours. Powered by real YouCam Skin AI, never by guesses.
            </p>
            <div className="hero__actions">
              <Button as="a" href="#scan" size="lg" icon={ScanFace} onClick={beginScan}>
                Begin your scan
              </Button>
              <Button as={Link} to="/looks" variant="ghost" size="lg" iconRight={ArrowRight}>
                Explore the looks
              </Button>
            </div>
            <ul className="trust-row" aria-label="Lumé principles">
              <li>
                <ShieldCheck size={15} strokeWidth={1.7} aria-hidden="true" />
                Photos never stored
              </li>
              <li>
                <Sparkles size={15} strokeWidth={1.7} aria-hidden="true" />
                Real Skin AI
              </li>
              <li>
                <LockKeyhole size={15} strokeWidth={1.7} aria-hidden="true" />
                Private by design
              </li>
            </ul>
          </div>

          <div className="hero__visual">
            <div className="hero__frame">
              <ImageWithFallback
                src="/images/hero.jpg"
                alt="A softly lit editorial beauty portrait"
                loading="eager"
                className="hero__image"
              />
              <div className="hero__frame-caption">
                <span>Study No. 01</span>
                <span>Light, texture, tone</span>
              </div>
            </div>
            <div className="hero__note">
              <p className="eyebrow">A clearer read</p>
              <p>Not a harsher one.</p>
              <span>Your skin is a living thing. The report is a snapshot.</span>
            </div>
            <div className="hero__seal" aria-hidden="true">
              <span>Lumé</span>
              <span>Skin study</span>
            </div>
          </div>
        </div>
      </section>

      <section className="fact-strip" aria-label="What a study includes">
        <div className="shell fact-strip__inner">
          <div>
            <strong>4–8</strong>
            <span>HD skin signals</span>
          </div>
          <div>
            <strong>12–16</strong>
            <span>estimated provider units</span>
          </div>
          <div>
            <strong>0</strong>
            <span>photos stored by Lumé</span>
          </div>
          <p>Every live analysis asks for your confirmation before it uses units.</p>
        </div>
      </section>

      <section className="section scan-section" id="scan" aria-labelledby="scan-title">
        <div className="shell">
          <SectionHeading
            eyebrow="The scan studio"
            title="Your skin, in your own light."
            description="Choose a clear, front-facing portrait in soft daylight. No filter, no perfect angle required — just a true one."
            id="scan-title"
          />

          <div className="scan-studio">
            {busy ? (
              <ScanProgress
                status={status}
                depthLabel={submittedLabel}
                preview={preview}
              />
            ) : status === 'success' && report ? (
              <AnalysisResult report={report} onScanAgain={prepareNewScan} />
            ) : (
              <div className="scan-grid">
                <div className="scan-controls">
                  <div className="scan-panel-heading">
                    <span className="step-number">01</span>
                    <div>
                      <h3>Choose your study</h3>
                      <p>Start focused, or read the whole picture.</p>
                    </div>
                  </div>
                  <fieldset className="depth-options" disabled={busy}>
                    <legend className="sr-only">Skin analysis depth</legend>
                    {DEPTHS.map((option) => (
                      <DepthOption
                        key={option.id}
                        option={option}
                        selected={depth === option.id}
                        onSelect={setDepth}
                        units={
                          skinFeatures?.depths?.find((item) => item.id === option.id)?.estimatedUnits ||
                          option.units
                        }
                        disabled={busy}
                      />
                    ))}
                  </fieldset>
                  <div className="unit-note">
                    <Sparkles size={16} strokeWidth={1.6} aria-hidden="true" />
                    <p>
                      This study is estimated at <strong>{estimatedUnits} provider units</strong>.
                      Units are billed by Perfect Corp, not by Lumé.
                    </p>
                  </div>
                  <ul className="mini-list">
                    <li>Use a front-facing portrait with your whole face visible.</li>
                    <li>Avoid filters, heavy makeup, or strong shadows where possible.</li>
                    <li>Skin AI requires a portrait at least 1080px on the short side (HD). JPG or PNG, up to 10 MB.</li>
                  </ul>
                </div>

                <div className="scan-upload-panel">
                  <div className="scan-panel-heading">
                    <span className="step-number">02</span>
                    <div>
                      <h3>Add your portrait</h3>
                      <p>Private, in-memory, and never saved.</p>
                    </div>
                  </div>
                  <UploadZone
                    file={file}
                    preview={preview}
                    meta={meta}
                    checking={checking}
                    error={error}
                    onSelect={chooseFile}
                    onRemove={prepareNewScan}
                    title="Drop a portrait here"
                    hint="Take one now, or choose a favourite"
                    requirements={[
                      'Front-facing, eyes open, neutral expression',
                      'Soft, even daylight — no filter',
                      'JPG or PNG, up to 10 MB',
                      'At least 1080px on the short side (HD)',
                    ]}
                    aspect="portrait"
                    disabled={busy}
                  />

                  {error ? (
                    <div className="inline-alert" role="alert">
                      <CircleAlert size={17} strokeWidth={1.7} aria-hidden="true" />
                      <p>{error}</p>
                      <button type="button" onClick={dismissError} className="inline-alert__dismiss">
                        Dismiss
                      </button>
                    </div>
                  ) : null}

                  {!configLoading && (!configured || configError) ? (
                    <div className="connect-panel">
                      <div className="connect-panel__heading">
                        <KeyRound size={17} strokeWidth={1.7} aria-hidden="true" />
                        <p>
                          <strong>{configError ? 'Local API offline.' : 'Connect YouCam to go live.'}</strong>{' '}
                          {configError
                            ? 'Start the Lumé server and check the connection.'
                            : 'Add YOUCAM_API_KEY to the server environment, then restart the API.'}
                        </p>
                      </div>
                      <div className="cluster">
                        {configError ? (
                          <Button variant="secondary" size="sm" onClick={refresh}>
                            Check connection
                          </Button>
                        ) : (
                          <Button
                            as="a"
                            href={connectUrl}
                            target="_blank"
                            rel="noreferrer"
                            variant="secondary"
                            size="sm"
                            iconRight={ArrowUpRight}
                          >
                            Get an API key
                          </Button>
                        )}
                        {demoAvailable ? (
                          <Button as={Link} to="/report?sample=1" variant="ghost" size="sm">
                            See a sample report
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="scan-submit">
                    <div className="scan-submit__summary">
                      <span>{selectedDepth.name}</span>
                      <span>~{estimatedUnits} units</span>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => setConfirmOpen(true)}
                      disabled={!analysisReady}
                      loading={busy}
                      icon={Sparkles}
                      className="scan-submit__button"
                    >
                      {configLoading
                        ? 'Checking connection…'
                        : !configured
                          ? 'Live analysis paused'
                          : file
                            ? 'Start my skin study'
                            : 'Add a portrait to begin'}
                    </Button>
                    <p className="scan-submit__fineprint">
                      You will confirm the paid request before anything is sent.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="process-row">
            <div>
              <span>01</span>
              <h3>One honest portrait</h3>
              <p>Soft daylight, bare-ish skin, and a straight-on view give the model the clearest read.</p>
            </div>
            <div>
              <span>02</span>
              <h3>YouCam measures</h3>
              <p>Perfect Corp’s Skin AI v2.1 reads the selected HD concerns and returns real scores.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Lumé translates</h3>
              <p>We turn the numbers into careful context, ingredient ideas, and a routine you can keep.</p>
            </div>
          </div>
        </div>
      </section>

      {demoAvailable ? (
        <section className="section--tight">
          <div className="shell sample-strip">
            <div className="sample-strip__image">
              <ImageWithFallback src="/images/portrait.jpg" alt="A calm portrait used for the interface sample" />
              <Tag tone="sample">Sample · not a live scan</Tag>
            </div>
            <div className="sample-strip__copy">
              <p className="eyebrow">A look inside the report</p>
              <h2>See how Lumé reads a study.</h2>
              <p>
                Explore a clearly labelled sample report to see the structure, language, and care
                notes before connecting a live YouCam key.
              </p>
              <Button as={Link} to="/report?sample=1" variant="secondary" iconRight={ArrowRight}>
                Open the sample report
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section editorial-links" aria-labelledby="continue-title">
        <div className="shell">
          <SectionHeading
            eyebrow="Beyond the score"
            title="A whole way of getting dressed."
            description="The report is only the beginning. Carry the insight into what you wear and how you plan the week."
            id="continue-title"
          />
          <div className="feature-grid">
            <article className="feature-card">
              <Link to="/looks" className="feature-card__image">
                <ImageWithFallback src="/images/look-neutral.jpg" alt="A quiet neutral outfit" />
                <span className="feature-card__icon">
                  <Shirt size={19} strokeWidth={1.5} />
                </span>
              </Link>
              <div className="feature-card__copy">
                <p className="eyebrow">The looks</p>
                <h3>An edit for your real life.</h3>
                <p>Eight considered looks across work, weekends, and quiet evenings.</p>
                <Link to="/looks" className="text-link">
                  Explore the edit <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
            <article className="feature-card">
              <Link to="/try-on" className="feature-card__image feature-card__image--tall">
                <ImageWithFallback src="/images/garment-01.jpg" alt="A garment reference for virtual try-on" />
                <span className="feature-card__icon">
                  <ScanFace size={19} strokeWidth={1.5} />
                </span>
              </Link>
              <div className="feature-card__copy">
                <p className="eyebrow">Virtual try-on</p>
                <h3>See the piece on you.</h3>
                <p>Upload a portrait and a garment reference for a real AI Clothes v4 render.</p>
                <Link to="/try-on" className="text-link">
                  Try a piece <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
            <article className="feature-card">
              <Link to="/planner" className="feature-card__image">
                <ImageWithFallback src="/images/texture.jpg" alt="A calm still life of textures and routines" />
                <span className="feature-card__icon">
                  <CalendarDays size={19} strokeWidth={1.5} />
                </span>
              </Link>
              <div className="feature-card__copy">
                <p className="eyebrow">Seven-day planner</p>
                <h3>Make the week feel lighter.</h3>
                <p>Outfits, routines, and small intentions, gathered in one calm place.</p>
                <Link to="/planner" className="text-link">
                  Plan your week <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="closing-note">
        <div className="shell closing-note__inner">
          <p className="eyebrow">A final thought</p>
          <h2>Your face is not a problem to solve.</h2>
          <p>
            It is a living record of weather, work, sleep, and time. Lumé uses AI to notice patterns,
            never to grade you. Take what helps, and leave the rest.
          </p>
          <Button as="a" href="#scan" variant="secondary" onClick={beginScan}>
            Begin a skin study
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleAnalyze}
        eyebrow="Paid AI request"
        title="Start this skin study?"
        description="You are about to send this portrait to Perfect Corp YouCam Skin AI."
        confirmLabel={`Use ~${estimatedUnits} units & scan`}
      >
        <div className="confirm-summary">
          <div>
            <span>Study</span>
            <strong>{selectedDepth.name}</strong>
          </div>
          <div>
            <span>Concerns</span>
            <strong>{selectedDepth.concerns.length} HD signals</strong>
          </div>
          <div>
            <span>Estimated units</span>
            <strong>~{estimatedUnits}</strong>
          </div>
        </div>
        <ul className="confirm-list">
          <li>Units are billed to your Perfect Corp API account. This is not a Lumé subscription.</li>
          <li>Your image is processed in server memory and is not stored by Lumé.</li>
          <li>Perfect Corp documents a 24-hour processing retention window.</li>
          <li>The result is cosmetic insight from one photo — not a medical diagnosis.</li>
        </ul>
      </ConfirmDialog>
    </div>
  );
}
