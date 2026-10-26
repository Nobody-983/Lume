import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarPlus,
  Check,
  Eye,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { useScan } from '../contexts/ScanContext.jsx';
import { AddToPlannerDialog } from '../components/AddToPlannerDialog.jsx';
import { Button, IconButton } from '../components/Button.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ImageWithFallback } from '../components/ImageWithFallback.jsx';
import { Modal } from '../components/Modal.jsx';
import { SectionHeading } from '../components/SectionHeading.jsx';
import { Tag } from '../components/Tag.jsx';
import {
  LOOK_KINDS,
  OCCASIONS,
  PALETTES,
  filterLooks,
  looks,
  looksForPreference,
} from '../services/looksData.js';

function LookCard({ look, onOpen, onAdd }) {
  return (
    <article className="look-card">
      <div className="look-card__image-wrap">
        <button
          type="button"
          className="look-card__image-button"
          onClick={() => onOpen(look)}
          aria-label={`View ${look.title}`}
        >
          <ImageWithFallback
            src={look.image}
            alt={look.alt}
            className="look-card__image"
            fallbackClassName="look-card__fallback"
          />
          <span className="look-card__veil" aria-hidden="true" />
          <span className="look-card__hover">
            <Eye size={16} strokeWidth={1.7} aria-hidden="true" />
            View the look
          </span>
        </button>
        <div className="look-card__badges">
          <Tag tone={look.kind === 'Beauty' ? 'rose' : 'plum'}>{look.kind}</Tag>
          <Tag tone="glass">{look.occasion}</Tag>
        </div>
      </div>
      <div className="look-card__body">
        <div className="look-card__heading">
          <div>
            <p className="eyebrow">{look.palette}</p>
            <h3>
              <button type="button" onClick={() => onOpen(look)}>
                {look.title}
              </button>
            </h3>
          </div>
          <IconButton
            label={`Add ${look.title} to your planner`}
            className="look-card__add"
            onClick={() => onAdd(look)}
          >
            <CalendarPlus size={18} strokeWidth={1.6} />
          </IconButton>
        </div>
        <p className="look-card__caption">{look.caption}</p>
        <div className="look-card__footer">
          <span className="swatch-row" aria-label={`Palette: ${look.palette}`}>
            {look.swatches.map((swatch) => (
              <span key={swatch} className="swatch" style={{ backgroundColor: swatch }} />
            ))}
          </span>
          <button type="button" className="text-link" onClick={() => onOpen(look)}>
            The details <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

function LookDialog({ look, onClose, onAdd }) {
  return (
    <Modal
      open={Boolean(look)}
      onClose={onClose}
      eyebrow={look ? `${look.kind} · ${look.occasion}` : undefined}
      title={look?.title || 'The look'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            icon={CalendarPlus}
            onClick={() => {
              const selected = look;
              onClose();
              onAdd(selected);
            }}
          >
            Add to planner
          </Button>
        </>
      }
    >
      {look ? (
        <div className="look-dialog">
          <div className="look-dialog__image">
            <ImageWithFallback src={look.image} alt={look.alt} loading="eager" />
            <div className="look-dialog__palette">
              <span className="eyebrow">Palette</span>
              <div className="swatch-row swatch-row--large">
                {look.swatches.map((swatch) => (
                  <span key={swatch} className="swatch" style={{ backgroundColor: swatch }} />
                ))}
              </div>
              <span>{look.palette}</span>
            </div>
          </div>
          <div className="look-dialog__copy">
            <p className="look-dialog__caption">{look.caption}</p>
            <p>{look.description}</p>
            <div>
              <p className="eyebrow">The pieces</p>
              <ul className="tag-list">
                {look.pieces.map((piece) => (
                  <li key={piece}>{piece}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">Beauty note</p>
              <p>{look.beauty}</p>
            </div>
            <blockquote>{look.note}</blockquote>
            <div className="look-dialog__links">
              <Link to="/try-on" className="text-link" onClick={onClose}>
                Try your own piece on <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link to="/planner" className="text-link" onClick={onClose}>
                See your week <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function Looks() {
  const { demoAvailable } = useConfig();
  const { report } = useScan();
  const [kind, setKind] = useState('All');
  const [occasion, setOccasion] = useState('All');
  const [palette, setPalette] = useState('All');
  const [preference, setPreference] = useState({ occasion: 'Everyday', palette: 'Warm neutrals' });
  const [personalized, setPersonalized] = useState(false);
  const [activeLook, setActiveLook] = useState(null);
  const [plannerLook, setPlannerLook] = useState(null);

  const filtered = useMemo(
    () => filterLooks(looks, { kind, occasion, palette }),
    [kind, occasion, palette],
  );
  const visibleLooks = useMemo(
    () => (personalized ? looksForPreference(filtered, preference) : filtered),
    [filtered, personalized, preference],
  );
  const filtersActive = kind !== 'All' || occasion !== 'All' || palette !== 'All';
  const preferredMatches = visibleLooks.filter(
    (look) => look.occasion === preference.occasion || look.palette === preference.palette,
  );

  function clearFilters() {
    setKind('All');
    setOccasion('All');
    setPalette('All');
    setPersonalized(false);
  }

  function applyPreference() {
    setPersonalized(true);
    setKind('All');
    setOccasion('All');
    setPalette('All');
  }

  function selectKind(value) {
    setKind(value);
    setPersonalized(false);
  }

  function selectFilter(setter, value) {
    setter(value);
    setPersonalized(false);
  }

  return (
    <div className="page page--looks">
      <section className="looks-hero">
        <div className="shell looks-hero__grid">
          <div className="looks-hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__line" aria-hidden="true" />
              The Lumé edit
            </p>
            <h1>
              Eight looks.
              <em> One point of view.</em>
            </h1>
            <p>
              Considered outfits and beauty notes for the days you actually have — work, weekends,
              quiet dinners, and the spaces in between. Independent style guidance, separate from
              your skin scores.
            </p>
            <div className="looks-hero__actions">
              <Button as="a" href="#edit" size="lg" iconRight={ArrowRight}>
                Browse the edit
              </Button>
              {report ? (
                <Button as={Link} to="/report" variant="ghost" size="lg">
                  Back to my report
                </Button>
              ) : demoAvailable ? (
                <Button as={Link} to="/report?sample=1" variant="ghost" size="lg">
                  See a sample report
                </Button>
              ) : null}
            </div>
          </div>
          <div className="looks-hero__visual">
            <ImageWithFallback
              src="/images/look-silk.jpg"
              alt="An evening look in soft plum and warm light"
              loading="eager"
            />
            <div className="looks-hero__label">
              <span className="eyebrow">Featured</span>
              <strong>The Silk Hour</strong>
              <span>Plum · Evening</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section looks-edit" id="edit" aria-labelledby="edit-title">
        <div className="shell">
          <SectionHeading
            eyebrow="Find your direction"
            title="Filter the edit."
            description="Begin with the shape of your day, then narrow by palette. Or choose a few preferences and let Lumé order the edit for you."
            id="edit-title"
            action={<span className="section-count">{visibleLooks.length} looks</span>}
          />

          <div className="filter-panel">
            <div className="filter-row">
              <div className="segmented" role="group" aria-label="Filter by look type">
                {LOOK_KINDS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={kind === option ? 'is-active' : ''}
                    onClick={() => selectKind(option)}
                    aria-pressed={kind === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <label className="filter-field">
                <span>Occasion</span>
                <select
                  value={occasion}
                  onChange={(event) => selectFilter(setOccasion, event.target.value)}
                >
                  <option value="All">All occasions</option>
                  {OCCASIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="filter-field">
                <span>Palette</span>
                <select
                  value={palette}
                  onChange={(event) => selectFilter(setPalette, event.target.value)}
                >
                  <option value="All">All palettes</option>
                  {PALETTES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              {filtersActive && (
                <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>

            <div className={`preference-panel ${personalized ? 'is-active' : ''}`.trim()}>
              <div className="preference-panel__intro">
                <span className="preference-panel__icon" aria-hidden="true">
                  {personalized ? (
                    <Check size={18} strokeWidth={1.8} />
                  ) : (
                    <SlidersHorizontal size={18} strokeWidth={1.6} />
                  )}
                </span>
                <div>
                  <h3>{personalized ? 'Your edit, in your order.' : 'Shape it around you.'}</h3>
                  <p>
                    {personalized
                      ? `Showing ${preferredMatches.length} looks that align with ${preference.occasion.toLowerCase()} and ${preference.palette.toLowerCase()}, followed by the rest.`
                      : 'Choose an occasion and palette. Lumé will prioritise matching looks — no personal data leaves this page.'}
                  </p>
                </div>
              </div>
              <div className="preference-panel__controls">
                <label className="filter-field">
                  <span>Mostly dressing for</span>
                  <select
                    value={preference.occasion}
                    onChange={(event) =>
                      setPreference((current) => ({ ...current, occasion: event.target.value }))
                    }
                  >
                    {OCCASIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="filter-field">
                  <span>Colours I reach for</span>
                  <select
                    value={preference.palette}
                    onChange={(event) =>
                      setPreference((current) => ({ ...current, palette: event.target.value }))
                    }
                  >
                    {PALETTES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  variant={personalized ? 'secondary' : 'primary'}
                  icon={personalized ? Check : Sparkles}
                  onClick={applyPreference}
                >
                  {personalized ? 'Edit applied' : 'Curate my edit'}
                </Button>
                {personalized ? (
                  <Button variant="ghost" size="sm" onClick={() => setPersonalized(false)}>
                    Reset order
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {personalized ? (
            <div className="personalized-note" role="status">
              <Sparkles size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>
                Prioritising <strong>{preference.occasion}</strong> and{' '}
                <strong>{preference.palette}</strong>. This ordering is a simple, on-device match —
                not an AI skin recommendation.
              </span>
            </div>
          ) : null}

          {visibleLooks.length ? (
            <div className="looks-grid">
              {visibleLooks.map((look) => (
                <LookCard
                  key={look.id}
                  look={look}
                  onOpen={setActiveLook}
                  onAdd={setPlannerLook}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SlidersHorizontal}
              eyebrow="No exact matches"
              title="The edit is a little narrower than your filters."
              description="Try a different palette or loosen the occasion. The full point of view is still there."
              actionLabel="Clear the filters"
              actionOnClick={clearFilters}
            />
          )}
        </div>
      </section>

      <section className="section--tight">
        <div className="shell editorial-note">
          <div>
            <p className="eyebrow">How this edit works</p>
            <h2>Style guidance, kept separate.</h2>
          </div>
          <p>
            The looks are general editorial guidance built around a restrained palette and
            real-life occasions. They are not generated from your skin report, and they do not
            change your Skin AI scores. Preferences and saved plans stay in this browser.
          </p>
          <Button as={Link} to="/try-on" variant="secondary" iconRight={ArrowRight}>
            Try a piece on
          </Button>
        </div>
      </section>

      <LookDialog
        look={activeLook}
        onClose={() => setActiveLook(null)}
        onAdd={(look) => {
          if (look) setPlannerLook(look);
        }}
      />

      <AddToPlannerDialog
        open={Boolean(plannerLook)}
        onClose={() => setPlannerLook(null)}
        eyebrow="From the Lumé edit"
        title={plannerLook ? `Add “${plannerLook.title}”` : 'Add to your week'}
        initialDate={new Date()}
        initialTitle={plannerLook?.title || ''}
        initialOccasion={plannerLook?.occasion || 'Everyday'}
        initialOutfit={plannerLook?.pieces.join(' · ') || ''}
        initialBeauty={plannerLook?.beauty || ''}
        initialNotes={
          plannerLook ? `${plannerLook.note} From the Lumé edit.` : ''
        }
      />
    </div>
  );
}
