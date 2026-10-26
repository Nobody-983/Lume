import { addDays, toDateKey } from './dates.js';
import { makeId } from './storage.js';

const STARTER_PLAN = [
  {
    dayOffset: 0,
    title: 'Soft start',
    occasion: 'Work',
    outfit: 'Oatmeal knit · straight-leg denim · leather flats',
    beauty: 'Gentle cleanse · hydrating serum · SPF 30',
    notes: 'Lay everything out the night before. Keep makeup light and quick.',
  },
  {
    dayOffset: 1,
    title: 'Studio hours',
    occasion: 'Work',
    outfit: 'Ivory shirt · charcoal trouser · small gold hoop',
    beauty: 'Sheer base · cream blush · brushed brow',
    notes: 'A simple tonal outfit for a full day of focus.',
  },
  {
    dayOffset: 2,
    title: 'The midweek pause',
    occasion: 'Everyday',
    outfit: 'Soft denim · fine knit · canvas tote',
    beauty: 'SPF · tinted balm · hair up',
    notes: 'Leave a little space after work. No plans required.',
  },
  {
    dayOffset: 3,
    title: 'Dinner, later',
    occasion: 'Evening',
    outfit: 'Deep plum slip · sheer layer · satin slingback',
    beauty: 'Skin-first base · smoked lash line · berry balm',
    notes: 'A quiet dinner look that still feels like an occasion.',
  },
  {
    dayOffset: 4,
    title: 'Friday light',
    occasion: 'Everyday',
    outfit: 'Relaxed blazer · white tee · straight trouser',
    beauty: 'Cleanse · vitamin C · tinted SPF',
    notes: 'Keep the evening open. Something easy and unfussy.',
  },
  {
    dayOffset: 5,
    title: 'Market morning',
    occasion: 'Weekend',
    outfit: 'Worn denim · overshirt · soft leather bag',
    beauty: 'Tinted SPF · gel blush · lip balm',
    notes: 'Coffee, flowers, and a slow walk before the day begins.',
  },
  {
    dayOffset: 6,
    title: 'Reset & restore',
    occasion: 'Weekend',
    outfit: 'Linen set · soft flat · minimal jewellery',
    beauty: 'Double cleanse · PHA · ceramide moisturizer',
    notes: 'Reset the week gently: fresh sheets, a longer bath, an early night.',
  },
];

export function createStarterEntries(weekStart) {
  return STARTER_PLAN.map((entry, index) => {
    const date = addDays(weekStart, entry.dayOffset);
    return {
      id: makeId(),
      date: toDateKey(date),
      title: entry.title,
      occasion: entry.occasion,
      outfit: entry.outfit,
      beauty: entry.beauty,
      notes: entry.notes,
      starter: true,
      createdAt: new Date().toISOString(),
      order: index,
    };
  });
}

export const OCCASION_STYLES = {
  Work: { label: 'Work', tone: 'plum' },
  Everyday: { label: 'Everyday', tone: 'sage' },
  Evening: { label: 'Evening', tone: 'berry' },
  Weekend: { label: 'Weekend', tone: 'sand' },
  'Skin ritual': { label: 'Skin ritual', tone: 'rose' },
  Other: { label: 'Other', tone: 'sand' },
};
