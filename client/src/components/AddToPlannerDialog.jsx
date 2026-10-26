import { useId, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { usePlanner } from '../contexts/PlannerContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { OCCASIONS } from '../services/looksData.js';
import {
  formatShortDate,
  formatWeekdayShort,
  fromDateKey,
  toDateKey,
  upcomingDays,
} from '../services/dates.js';
import { Button } from './Button.jsx';
import { FormField } from './FormField.jsx';
import { Modal } from './Modal.jsx';

const PLANNER_OCCASIONS = [...OCCASIONS, 'Skin ritual', 'Other'];

export function AddToPlannerDialog({
  open,
  entry = null,
  initialDate,
  initialTitle = '',
  initialOccasion = 'Everyday',
  initialOutfit = '',
  initialBeauty = '',
  initialNotes = '',
  ...props
}) {
  const instanceKey = open
    ? `${entry?.id || 'new'}:${entry?.date || initialDate || ''}:${initialTitle}:${initialOccasion}:${initialOutfit}:${initialBeauty}:${initialNotes}`
    : 'closed';

  return (
    <PlannerForm
      key={instanceKey}
      open={open}
      entry={entry}
      initialDate={initialDate}
      initialTitle={initialTitle}
      initialOccasion={initialOccasion}
      initialOutfit={initialOutfit}
      initialBeauty={initialBeauty}
      initialNotes={initialNotes}
      {...props}
    />
  );
}

function PlannerForm({
  open,
  onClose,
  title,
  eyebrow,
  entry = null,
  initialDate,
  initialTitle = '',
  initialOccasion = 'Everyday',
  initialOutfit = '',
  initialBeauty = '',
  initialNotes = '',
}) {
  const formId = useId();
  const { addEntry, updateEntry } = usePlanner();
  const { showToast } = useToast();
  const editing = Boolean(entry);
  const currentDate = entry?.date || toDateKey(initialDate || new Date());
  const baseDateOptions = upcomingDays(14);
  const dateOptions = baseDateOptions.some((date) => toDateKey(date) === currentDate)
    ? baseDateOptions
    : [fromDateKey(currentDate), ...baseDateOptions];
  const displayTitle = title || (editing ? 'Edit this plan' : 'Add to your week');
  const displayEyebrow = eyebrow || (editing ? 'Refine the day' : 'Your seven-day edit');
  const [form, setForm] = useState(() => ({
    date: currentDate,
    title: entry?.title || initialTitle,
    occasion: PLANNER_OCCASIONS.includes(entry?.occasion || initialOccasion)
      ? entry?.occasion || initialOccasion
      : 'Other',
    outfit: entry?.outfit ?? initialOutfit,
    beauty: entry?.beauty ?? initialBeauty,
    notes: entry?.notes ?? initialNotes,
  }));

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    if (editing) {
      updateEntry(entry.id, form);
      const date = new Date(`${form.date}T12:00:00`);
      showToast(`Plan updated for ${formatWeekdayShort(date)}, ${formatShortDate(date)}.`);
    } else {
      const nextEntry = addEntry(form);
      const date = new Date(`${nextEntry.date}T12:00:00`);
      showToast(`Added to ${formatWeekdayShort(date)}, ${formatShortDate(date)}.`);
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={displayEyebrow}
      title={displayTitle}
      description="Keep the pieces, routine, and notes together. This stays in your browser."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} icon={CalendarPlus}>
            {editing ? 'Save changes' : 'Save to planner'}
          </Button>
        </>
      }
    >
      <form id={formId} className="form-grid" onSubmit={handleSubmit}>
        <div className="form-grid__two">
          <FormField label="Day">
            <select value={form.date} onChange={(event) => update('date', event.target.value)} required>
              {dateOptions.map((date) => (
                <option key={toDateKey(date)} value={toDateKey(date)}>
                  {formatWeekdayShort(date)} · {formatShortDate(date)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Occasion">
            <select
              value={form.occasion}
              onChange={(event) => update('occasion', event.target.value)}
              required
            >
              {PLANNER_OCCASIONS.map((occasion) => (
                <option key={occasion} value={occasion}>
                  {occasion}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Plan title">
          <input
            type="text"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="A quieter kind of Monday"
            maxLength={80}
            required
            autoFocus
          />
        </FormField>
        <FormField label="Outfit" hint="Separate pieces with a middot or a comma.">
          <textarea
            rows={2}
            value={form.outfit}
            onChange={(event) => update('outfit', event.target.value)}
            placeholder="Ivory shirt · camel trouser · gold hoop"
            maxLength={400}
          />
        </FormField>
        <FormField label="Beauty routine">
          <textarea
            rows={2}
            value={form.beauty}
            onChange={(event) => update('beauty', event.target.value)}
            placeholder="Cleanse · hydrating serum · SPF 30"
            maxLength={400}
          />
        </FormField>
        <FormField label="Notes" hint="Optional reminders, weather, or a small intention.">
          <textarea
            rows={2}
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Leave a little space after work."
            maxLength={500}
          />
        </FormField>
      </form>
    </Modal>
  );
}
