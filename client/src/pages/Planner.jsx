import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LockKeyhole,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { usePlanner } from '../contexts/PlannerContext.jsx';
import { useScan } from '../contexts/ScanContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { AddToPlannerDialog } from '../components/AddToPlannerDialog.jsx';
import { Button, IconButton } from '../components/Button.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { Tag } from '../components/Tag.jsx';
import {
  addDays,
  formatShortDate,
  formatWeekRange,
  isToday,
  startOfWeek,
  toDateKey,
  weekDays,
} from '../services/dates.js';
import { OCCASION_STYLES } from '../services/plannerSeed.js';
import { reportSummary, routineForPlanner } from '../services/reportContent.js';

function PlanCard({ entry, onEdit, onDelete }) {
  const style = OCCASION_STYLES[entry.occasion] || OCCASION_STYLES.Other;
  return (
    <article className="plan-card">
      <div className="plan-card__top">
        <div className="plan-card__labels">
          <Tag tone={style.tone}>{style.label}</Tag>
          {entry.starter ? <span className="starter-label">Starter idea</span> : null}
        </div>
        <div className="plan-card__actions">
          <IconButton label={`Edit ${entry.title}`} onClick={() => onEdit(entry)}>
            <Pencil size={16} strokeWidth={1.6} />
          </IconButton>
          <IconButton label={`Remove ${entry.title}`} onClick={() => onDelete(entry)}>
            <Trash2 size={16} strokeWidth={1.6} />
          </IconButton>
        </div>
      </div>
      <h4>{entry.title}</h4>
      <div className="plan-card__details">
        {entry.outfit ? (
          <p>
            <span>Outfit</span>
            {entry.outfit}
          </p>
        ) : null}
        {entry.beauty ? (
          <p>
            <span>Beauty</span>
            {entry.beauty}
          </p>
        ) : null}
        {entry.notes ? <p className="plan-card__notes">{entry.notes}</p> : null}
      </div>
    </article>
  );
}

function DayRow({ date, entries, onAdd, onEdit, onDelete }) {
  const today = isToday(date);
  const dateKey = toDateKey(date);
  return (
    <section className={`day-row ${today ? 'is-today' : ''}`.trim()} aria-labelledby={`day-${dateKey}`}>
      <div className="day-row__date">
        <span className="day-row__weekday">{date.toLocaleDateString('en-US', { weekday: 'long' })}</span>
        <strong>{String(date.getDate()).padStart(2, '0')}</strong>
        <span>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
        {today ? <span className="day-row__today">Today</span> : null}
      </div>
      <div className="day-row__content">
        <h3 id={`day-${dateKey}`} className="sr-only">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        {entries.length ? (
          <div className="day-row__plans">
            {entries.map((entry) => (
              <PlanCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <div className="day-row__empty">
            <span>An open page.</span>
            <button type="button" onClick={() => onAdd(date)}>
              <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
              Add a detail
            </button>
          </div>
        )}
        {entries.length ? (
          <button type="button" className="day-row__add" onClick={() => onAdd(date)}>
            <Plus size={13} strokeWidth={1.8} aria-hidden="true" />
            Add another
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function Planner() {
  const { entries, addEntry, seedWeek, clearWeek, removeEntry } = usePlanner();
  const { report } = useScan();
  const { showToast } = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorEntry, setEditorEntry] = useState(null);
  const [editorDate, setEditorDate] = useState(new Date());
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [clearOpen, setClearOpen] = useState(false);

  const startKey = toDateKey(weekStart);
  const endKey = toDateKey(addDays(weekStart, 6));
  const todayKey = toDateKey(new Date());
  const currentWeekKey = toDateKey(startOfWeek(new Date()));
  const isCurrentWeek = startKey === currentWeekKey;

  const weekEntries = useMemo(
    () => entries.filter((entry) => entry.date >= startKey && entry.date <= endKey),
    [endKey, entries, startKey],
  );
  const days = useMemo(
    () =>
      weekDays(weekStart).map((date) => {
        const key = toDateKey(date);
        return {
          date,
          key,
          entries: weekEntries.filter((entry) => entry.date === key),
        };
      }),
    [weekEntries, weekStart],
  );
  const plannedDays = days.filter((day) => day.entries.length > 0).length;

  function defaultAddDate() {
    if (todayKey >= startKey && todayKey <= endKey) return new Date();
    return weekStart;
  }

  function openAdd(date = defaultAddDate()) {
    setEditorEntry(null);
    setEditorDate(date);
    setEditorOpen(true);
  }

  function openEdit(entry) {
    setEditorEntry(entry);
    setEditorDate(entry.date);
    setEditorOpen(true);
  }

  function handleSeed() {
    const added = seedWeek(weekStart);
    showToast(
      added > 0
        ? `Added ${added} starter ${added === 1 ? 'idea' : 'ideas'} to this week.`
        : 'Every day in this week already has a plan.',
      { type: added > 0 ? 'success' : 'info' },
    );
  }

  function handleClear() {
    clearWeek(weekStart);
    setClearOpen(false);
    showToast('The week was cleared. Starter ideas can bring it back anytime.', { type: 'info' });
  }

  function handleDelete() {
    if (!deleteEntry) return;
    removeEntry(deleteEntry.id);
    setDeleteEntry(null);
    showToast('The plan was removed.');
  }

  function addRoutineFromReport() {
    if (!report) return;
    const entry = addEntry({
      date: toDateKey(defaultAddDate()),
      title: 'Skin ritual',
      occasion: 'Skin ritual',
      outfit: '',
      beauty: routineForPlanner(report),
      notes: `${reportSummary(report)} From your skin report.`.trim(),
    });
    showToast(`Skin ritual added to ${formatShortDate(new Date(`${entry.date}T12:00:00`))}.`);
  }

  return (
    <div className="page page--planner">
      <section className="planner-hero">
        <div className="shell planner-hero__grid">
          <div className="planner-hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__line" aria-hidden="true" />
              The seven-day planner
            </p>
            <h1>
              Seven days.
              <em> Room to breathe.</em>
            </h1>
            <p>
              A gentle place for the outfit, the routine, and the small intention. Nothing locked
              in — just enough structure to make the week feel lighter.
            </p>
            <div className="cluster">
              <Button icon={Plus} onClick={() => openAdd()}>
                Add a plan
              </Button>
              {report ? (
                <Button variant="ghost" icon={Leaf} onClick={addRoutineFromReport}>
                  Add my skin ritual
                </Button>
              ) : (
                <Button as={Link} to="/looks" variant="ghost" iconRight={ArrowRight}>
                  Find a look
                </Button>
              )}
            </div>
          </div>
          <aside className="planner-hero__aside" aria-label="Week at a glance">
            <div className="planner-hero__stamp" aria-hidden="true">
              <span>07</span>
              <small>days</small>
            </div>
            <div className="planner-hero__aside-copy">
              <p className="eyebrow">This week’s rhythm</p>
              <strong>
                {plannedDays} of 7 days planned
              </strong>
              <p>
                {weekEntries.length
                  ? 'There is room here. Keep only what helps.'
                  : 'A clear page. Add one thing, or bring in the starter week.'}
              </p>
              <div className="rhythm-dots" aria-hidden="true">
                {days.map((day) => (
                  <span
                    key={day.key}
                    className={`${day.entries.length ? 'is-planned' : ''} ${isToday(day.date) ? 'is-today' : ''}`.trim()}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section planner-board-section" aria-labelledby="week-title">
        <div className="shell">
          <div className="week-nav">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              onClick={() => setWeekStart((current) => addDays(current, -7))}
              aria-label="Previous week"
            >
              <span className="week-nav__desktop">Previous</span>
            </Button>
            <div className="week-nav__center">
              <p className="eyebrow">{isCurrentWeek ? 'This week' : 'Week view'}</p>
              <h2 id="week-title">{formatWeekRange(weekStart)}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconRight={ChevronRight}
              onClick={() => setWeekStart((current) => addDays(current, 7))}
              aria-label="Next week"
            >
              <span className="week-nav__desktop">Next</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              disabled={isCurrentWeek}
              className="week-nav__today"
            >
              This week
            </Button>
          </div>

          <div className="planner-toolbar">
            <div className="planner-toolbar__summary">
              <CalendarDays size={17} strokeWidth={1.6} aria-hidden="true" />
              <span>
                {weekEntries.length} {weekEntries.length === 1 ? 'plan' : 'plans'} · {plannedDays}/7 days
              </span>
            </div>
            <div className="planner-toolbar__actions">
              <Button variant="secondary" size="sm" icon={Sparkles} onClick={handleSeed}>
                Add starter ideas
              </Button>
              {weekEntries.length ? (
                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setClearOpen(true)}>
                  Clear week
                </Button>
              ) : null}
            </div>
          </div>

          {weekEntries.length ? (
            <div className="week-board">
              {days.map((day) => (
                <DayRow
                  key={day.key}
                  date={day.date}
                  entries={day.entries}
                  onAdd={openAdd}
                  onEdit={openEdit}
                  onDelete={setDeleteEntry}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarRange}
              eyebrow={isCurrentWeek ? 'This week' : formatWeekRange(weekStart)}
              title="This week is an open page."
              description="Add a single outfit, a skin ritual, or a note to yourself. Or bring in seven gentle starter ideas and edit them from there."
              actionLabel="Add starter ideas"
              actionOnClick={handleSeed}
              secondary={
                <Button variant="secondary" icon={Plus} onClick={() => openAdd()}>
                  Add my own plan
                </Button>
              }
            />
          )}

          <div className="planner-storage-note">
            <LockKeyhole size={16} strokeWidth={1.6} aria-hidden="true" />
            <p>
              Your planner is saved only in this browser. Starter ideas are editorial suggestions,
              not generated from your skin report. <Link to="/looks">Browse the looks</Link> or{' '}
              <Link to="/report">return to your report</Link> for more context.
            </p>
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="shell planner-philosophy">
          <div>
            <p className="eyebrow">A gentle method</p>
            <h2>Plan the feeling, not every minute.</h2>
          </div>
          <div className="planner-philosophy__points">
            <div>
              <CheckCircle2 size={18} strokeWidth={1.5} aria-hidden="true" />
              <p>
                <strong>Choose fewer things.</strong> One good outfit and one routine are enough to
                make a day feel considered.
              </p>
            </div>
            <div>
              <Leaf size={18} strokeWidth={1.5} aria-hidden="true" />
              <p>
                <strong>Leave white space.</strong> Plans should make room for the day, not crowd it
                out.
              </p>
            </div>
            <div>
              <Pencil size={18} strokeWidth={1.5} aria-hidden="true" />
              <p>
                <strong>Edit without guilt.</strong> Remove what no longer fits. The planner is a
                tool, not a promise.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AddToPlannerDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        entry={editorEntry}
        initialDate={editorDate}
      />

      <ConfirmDialog
        open={Boolean(deleteEntry)}
        onClose={() => setDeleteEntry(null)}
        onConfirm={handleDelete}
        eyebrow="Edit the week"
        title="Remove this plan?"
        description="This removes the day’s outfit, routine, and notes from your browser."
        confirmLabel="Remove plan"
        tone="danger"
      >
        {deleteEntry ? (
          <p className="modal-copy">
            <strong>{deleteEntry.title}</strong> will be removed. You can add it again at any time.
          </p>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleClear}
        eyebrow="Start fresh"
        title="Clear this whole week?"
        description="Every plan in this week will be removed from this browser. Other weeks stay as they are."
        confirmLabel="Clear the week"
        tone="danger"
      >
        <p className="modal-copy">
          {weekEntries.length} {weekEntries.length === 1 ? 'plan' : 'plans'} will be removed. You can
          bring the starter ideas back with one click.
        </p>
      </ConfirmDialog>
    </div>
  );
}
