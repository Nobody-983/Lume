import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarPlus,
  Camera,
  Check,
  CircleAlert,
  ExternalLink,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { useTryOn } from '../contexts/TryOnContext.jsx';
import { AddToPlannerDialog } from '../components/AddToPlannerDialog.jsx';
import { Button } from '../components/Button.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { ImageWithFallback } from '../components/ImageWithFallback.jsx';
import { Tag } from '../components/Tag.jsx';
import { UploadZone } from '../components/UploadZone.jsx';
import { Spinner } from '../components/Spinner.jsx';

const CATEGORIES = [
  { id: 'auto', label: 'Auto detect', hint: 'Recommended for most pieces' },
  { id: 'full_body', label: 'Full body', hint: 'Dresses, jumpsuits, full looks' },
  { id: 'upper_body', label: 'Upper body', hint: 'Tops, shirts, knits' },
  { id: 'lower_body', label: 'Lower body', hint: 'Trousers and skirts' },
  { id: 'outer', label: 'Outerwear', hint: 'Coats and jackets' },
  { id: 'shoes', label: 'Shoes', hint: 'Footwear references' },
];

function TryOnProgress({ status, personPreview, garmentPreview, categoryLabel }) {
  const stage = status === 'uploading' ? 0 : 1;
  return (
    <div className="tryon-progress" role="status" aria-live="polite">
      <div className="tryon-progress__stage">
        <div className="tryon-progress__sources">
          <figure>
            {personPreview ? (
              <ImageWithFallback src={personPreview} alt="Your uploaded portrait" loading="eager" />
            ) : (
              <span />
            )}
            <figcaption>You</figcaption>
          </figure>
          <span className="tryon-progress__plus" aria-hidden="true">
            +
          </span>
          <figure>
            {garmentPreview ? (
              <ImageWithFallback src={garmentPreview} alt="Your uploaded garment" loading="eager" />
            ) : (
              <span />
            )}
            <figcaption>The piece</figcaption>
          </figure>
        </div>
        <span className="tryon-progress__arrow" aria-hidden="true">
          <ArrowRight size={19} strokeWidth={1.5} />
        </span>
        <div className="tryon-progress__render">
          <span className="tryon-progress__shimmer" aria-hidden="true" />
          <Spinner size={24} />
          <span>Composing</span>
        </div>
      </div>
      <div className="tryon-progress__copy">
        <p className="eyebrow">AI Clothes is working</p>
        <h2>{stage === 0 ? 'Preparing your fitting room.' : 'Building the look around you.'}</h2>
        <p>
          {stage === 0
            ? 'Both images are being sent securely. This is a live provider request, not a preview.'
            : `The model is reading your pose and applying the ${categoryLabel.toLowerCase()} reference. This usually takes under a minute.`}
        </p>
        <ol className="tryon-steps">
          <li className={stage >= 0 ? 'is-done' : ''}>
            <span>{stage > 0 ? <Check size={12} strokeWidth={2.4} /> : '1'}</span>
            Images sent securely
          </li>
          <li className={stage >= 1 ? 'is-done' : ''}>
            <span>{stage >= 1 ? <Check size={12} strokeWidth={2.4} /> : '2'}</span>
            Request accepted
          </li>
          <li className={stage >= 1 ? 'is-active' : ''}>
            <span>3</span>
            Rendering your look
          </li>
        </ol>
        <p className="inline-note">
          <LockKeyhole size={14} strokeWidth={1.7} aria-hidden="true" />
          Keep this tab open. Lumé does not save either photo or retry the paid request on its own.
        </p>
        <Link to="/looks" className="text-link">
          Browse the looks while you wait <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function TryOn() {
  const {
    personFile,
    personPreview,
    personMeta,
    personChecking,
    personError,
    garmentFile,
    garmentPreview,
    garmentMeta,
    garmentChecking,
    garmentError,
    category,
    setCategory,
    status,
    busy,
    error,
    result,
    choosePerson,
    chooseGarment,
    removePerson,
    removeGarment,
    start,
    reset,
    dismissError,
    submittedCategory,
  } = useTryOn();
  const {
    loading: configLoading,
    error: configError,
    configured,
    docs,
    refresh,
  } = useConfig();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const selectedCategory = CATEGORIES.find((item) => item.id === category) || CATEGORIES[0];
  const resultCategory =
    CATEGORIES.find((item) => item.id === submittedCategory)?.label || 'Auto detect';
  const analysisReady =
    configured &&
    !configError &&
    personFile &&
    garmentFile &&
    !personChecking &&
    !garmentChecking &&
    !busy;
  const connectUrl = docs?.apiKeys || 'https://yce.makeupar.com/api-console/en/api-keys/';
  const requestError = error && error !== personError && error !== garmentError ? error : '';

  async function handleGenerate() {
    setConfirmOpen(false);
    await start();
  }

  return (
    <div className="page page--tryon">
      <section className="tryon-hero">
        <div className="shell tryon-hero__grid">
          <div>
            <p className="eyebrow">
              <span className="eyebrow__line" aria-hidden="true" />
              The fitting room
            </p>
            <h1>
              See the piece
              <em> on your own frame.</em>
            </h1>
            <p>
              Add one clear photo of yourself and one garment reference. Perfect Corp AI Clothes v4
              composes a real visualisation — shown only when the provider actually returns one.
            </p>
            <ul className="trust-row">
              <li>
                <LockKeyhole size={15} strokeWidth={1.7} aria-hidden="true" />
                Photos remain in memory
              </li>
              <li>
                <Sparkles size={15} strokeWidth={1.7} aria-hidden="true" />
                Live AI Clothes v4
              </li>
              <li>
                <ShieldCheck size={15} strokeWidth={1.7} aria-hidden="true" />
                No saved gallery
              </li>
            </ul>
          </div>
          <div className="tryon-hero__visual">
            <ImageWithFallback
              src="/images/garment-02.jpg"
              alt="A garment reference styled for the virtual fitting room"
              loading="eager"
            />
            <div className="tryon-hero__caption">
              <span className="eyebrow">A visual study</span>
              <p>Not a promise of fit. A clearer way to imagine the piece.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section tryon-studio-section">
        <div className="shell">
          {result ? (
            <div className="tryon-result">
              <div className="tryon-result__image">
                <ImageWithFallback
                  src={result.url}
                  alt="The generated virtual try-on result"
                  loading="eager"
                />
                <div className="tryon-result__badges">
                  <Tag tone="plum">Live AI Clothes v4 result</Tag>
                  <Tag tone="glass">{resultCategory}</Tag>
                </div>
              </div>
              <div className="tryon-result__copy">
                <p className="eyebrow">A live render, just for this session</p>
                <h2>There you are, in the piece.</h2>
                <p>
                  This image was generated by Perfect Corp AI Clothes v4 and is displayed directly
                  from the provider. Lumé did not save it.
                </p>
                <div className="tryon-result__sources">
                  <figure>
                    {personPreview ? <ImageWithFallback src={personPreview} alt="Your source portrait" /> : null}
                    <figcaption>Your photo</figcaption>
                  </figure>
                  <figure>
                    {garmentPreview ? <ImageWithFallback src={garmentPreview} alt="Your source garment" /> : null}
                    <figcaption>Garment reference</figcaption>
                  </figure>
                </div>
                <div className="inline-alert inline-alert--soft">
                  <CircleAlert size={17} strokeWidth={1.7} aria-hidden="true" />
                  <p>
                    The result URL is temporary. Open or save it before leaving if you want to keep a
                    copy. A try-on is a visualisation, not a guarantee of fit or colour.
                  </p>
                </div>
                <div className="cluster">
                  <Button
                    as="a"
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    iconRight={ExternalLink}
                  >
                    Open full size
                  </Button>
                  <Button variant="secondary" icon={CalendarPlus} onClick={() => setPlannerOpen(true)}>
                    Add to planner
                  </Button>
                  <Button variant="ghost" onClick={reset}>
                    Try another piece
                  </Button>
                </div>
                <p className="meta-copy">
                  Source photos and this result are held in this tab only and disappear on reload.
                </p>
              </div>
            </div>
          ) : busy ? (
            <TryOnProgress
              status={status}
              personPreview={personPreview}
              garmentPreview={garmentPreview}
              categoryLabel={selectedCategory.label}
            />
          ) : (
            <>
              <div className="tryon-heading">
                <div>
                  <p className="eyebrow">Set the fitting room</p>
                  <h2>One you. One piece.</h2>
                  <p>
                    The clearest results come from a simple, well-lit photo and a front-facing
                    garment laid flat or shown on a hanger.
                  </p>
                </div>
                <div className="tryon-mode">
                  <label className="filter-field">
                    <span>Garment category</span>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      disabled={busy}
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p>{selectedCategory.hint}.</p>
                </div>
              </div>

              {requestError ? (
                <div className="inline-alert" role="alert">
                  <CircleAlert size={17} strokeWidth={1.7} aria-hidden="true" />
                  <p>{requestError}</p>
                  <button type="button" onClick={dismissError} className="inline-alert__dismiss">
                    Dismiss
                  </button>
                </div>
              ) : null}

              <div className="tryon-uploads">
                <div className="tryon-upload-card">
                  <div className="tryon-upload-card__head">
                    <span className="step-number">01</span>
                    <div>
                      <h3>Your photo</h3>
                      <p>Stand naturally, facing the camera.</p>
                    </div>
                  </div>
                  <UploadZone
                    file={personFile}
                    preview={personPreview}
                    meta={personMeta}
                    checking={personChecking}
                    error={personError}
                    onSelect={choosePerson}
                    onRemove={removePerson}
                    title="Add your photo"
                    hint="Full or upper body works best"
                    requirements={[
                      'One person, standing, full or upper body',
                      'Face and pose clearly visible',
                      'Soft, even light — no heavy filters',
                      'At least 480px on the short side',
                    ]}
                    aspect="portrait"
                    disabled={busy}
                    inputLabel="Choose your person photo"
                  />
                </div>

                <div className="tryon-mid" aria-hidden="true">
                  <span>
                    <ArrowRight size={20} strokeWidth={1.5} />
                  </span>
                  <small>compose</small>
                </div>

                <div className="tryon-upload-card">
                  <div className="tryon-upload-card__head">
                    <span className="step-number">02</span>
                    <div>
                      <h3>The garment</h3>
                      <p>Show the piece clearly, without clutter.</p>
                    </div>
                  </div>
                  <UploadZone
                    file={garmentFile}
                    preview={garmentPreview}
                    meta={garmentMeta}
                    checking={garmentChecking}
                    error={garmentError}
                    onSelect={chooseGarment}
                    onRemove={removeGarment}
                    title="Add the garment"
                    hint="Lay it flat or use a hanger shot"
                    requirements={[
                      'One garment, front-facing and fully visible',
                      'Flat lay or hanging shot preferred',
                      'Plain background, minimal cropping',
                      'At least 300px on the short side',
                    ]}
                    aspect="garment"
                    disabled={busy}
                    inputLabel="Choose your garment photo"
                  />
                </div>
              </div>

              {!configLoading && (!configured || configError) ? (
                <div className="connect-panel connect-panel--wide">
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
                        iconRight={ExternalLink}
                      >
                        Get an API key
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="tryon-submit">
                <div>
                  <p>
                    <strong>{personFile && garmentFile ? 'Ready to compose.' : 'Add both images to continue.'}</strong>
                  </p>
                  <p className="meta-copy">
                    Live AI Clothes uses provider units. Lumé doesn&apos;t publish a unit estimate
                    because Perfect Corp does not list a fixed cost for v4.
                  </p>
                </div>
                <Button
                  size="lg"
                  icon={Sparkles}
                  disabled={!analysisReady}
                  loading={busy}
                  onClick={() => setConfirmOpen(true)}
                >
                  {configLoading
                    ? 'Checking connection…'
                    : !configured
                      ? 'Live try-on paused'
                      : personFile && garmentFile
                        ? 'Create my try-on'
                        : 'Add both images'}
                </Button>
              </div>

              <div className="tryon-tips">
                <div className="tryon-tips__heading">
                  <Camera size={20} strokeWidth={1.5} aria-hidden="true" />
                  <h3>A better fitting room</h3>
                </div>
                <div>
                  <p>
                    <strong>For you:</strong> avoid crossed arms, seated poses, and very loose
                    clothing that hides your shape.
                  </p>
                  <p>
                    <strong>For the piece:</strong> use the full item, not a cropped detail. Prints
                    and sheer fabrics can be harder for the model to interpret.
                  </p>
                  <p>
                    <strong>For the result:</strong> treat it as a visual reference. Drape, fit, and
                    colour can look different in real life.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section--tight">
        <div className="shell tryon-privacy-banner">
          <div className="tryon-privacy-banner__icon" aria-hidden="true">
            <LockKeyhole size={22} strokeWidth={1.5} />
          </div>
          <div>
            <p className="eyebrow">Privacy in the fitting room</p>
            <h2>No photo library. No saved gallery.</h2>
            <p>
              Both uploads are processed in server memory and sent to Perfect Corp for this single
              task. Lumé does not write images to disk, and the generated result is not stored by
              Lumé. The provider result link is temporary.
            </p>
          </div>
          <Button as={Link} to="/looks" variant="secondary" iconRight={ArrowRight}>
            Explore the edit
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleGenerate}
        eyebrow="Paid AI request"
        title="Create this virtual try-on?"
        description={`${selectedCategory.label} · two images · one live AI Clothes v4 render`}
        confirmLabel="Generate try-on"
      >
        <div className="confirm-summary">
          <div>
            <span>Person</span>
            <strong>{personMeta ? `${personMeta.width} × ${personMeta.height}` : 'Clear portrait'}</strong>
          </div>
          <div>
            <span>Garment</span>
            <strong>{garmentMeta ? `${garmentMeta.width} × ${garmentMeta.height}` : 'Single item'}</strong>
          </div>
          <div>
            <span>Category</span>
            <strong>{selectedCategory.label}</strong>
          </div>
        </div>
        <ul className="confirm-list">
          <li>Provider units are billed to your Perfect Corp API account. Lumé does not show a fixed cost.</li>
          <li>Both images are sent to YouCam for this task and are not stored by Lumé.</li>
          <li>The result link is temporary and may expire in approximately two hours.</li>
          <li>This is a visualisation, not a guarantee of garment fit, colour, or texture.</li>
        </ul>
      </ConfirmDialog>

      <AddToPlannerDialog
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        eyebrow="From the fitting room"
        title="Add this try-on note"
        initialDate={new Date()}
        initialTitle="Try-on study"
        initialOccasion="Weekend"
        initialOutfit={`${resultCategory} try-on · AI Clothes v4`}
        initialBeauty="Use the render as a styling reference, not a fit guarantee."
        initialNotes="A live AI Clothes visualisation. The result link is temporary and is not saved by Lumé."
      />
    </div>
  );
}

