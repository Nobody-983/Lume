export const SCORE_BANDS = [
  {
    min: 80,
    label: 'Strong',
    tone: 'high',
    read: 'This signal reads strong in your photo. Keep the routine steady.',
  },
  {
    min: 65,
    label: 'Balanced',
    tone: 'balanced',
    read: 'This reads as balanced. Gentle consistency is the best next step.',
  },
  {
    min: 50,
    label: 'Attentive',
    tone: 'medium',
    read: 'The model marked this as an area for a little more care and patience.',
  },
  {
    min: 0,
    label: 'Focus',
    tone: 'focus',
    read: 'This is one of the lower readings in this photo. Treat it as a prompt for gentle care, not a diagnosis.',
  },
];

export const REGION_LABELS = {
  whole: 'Overall',
  forehead: 'Forehead',
  nose: 'Nose',
  cheek: 'Cheeks',
  t_zone: 'T-zone',
  u_zone: 'U-zone',
  glabellar: 'Between brows',
  crowfeet: 'Crow’s feet',
  periocular: 'Around eyes',
  nasolabial: 'Smile lines',
  marionette: 'Lower cheeks',
};

const CONCERN_LABELS = {
  texture: 'texture',
  pores: 'pores',
  redness: 'redness',
  blemishes: 'blemishes',
  hydration: 'hydration',
  radiance: 'radiance',
  oiliness: 'oil balance',
  skin_type: 'skin type',
};

export function scoreBand(score) {
  if (!Number.isFinite(score)) return null;
  return SCORE_BANDS.find((band) => score >= band.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

export function formatScore(score) {
  return Number.isFinite(score) ? Math.round(score) : '—';
}

export function concernReading(measurement) {
  const band = scoreBand(measurement.score);
  const bandRead = band?.read || 'This signal did not include a numerical score.';
  return {
    ...band,
    read: `${measurement.plain} ${bandRead}`,
  };
}

export function reportSummary(report) {
  if (!report) return '';
  const focus = (report.focusAreas || [])
    .map((key) => CONCERN_LABELS[key] || key)
    .slice(0, 3);

  if (report.source === 'demo') {
    return 'This sample report shows how Lumé turns YouCam Skin AI measurements into calm, specific guidance. It is not a real scan.';
  }

  if (report.overall?.value >= 80) {
    return `Your photo returned a strong overall reading. ${
      focus.length ? `Keep an eye on ${formatList(focus)} as you build your routine.` : ''
    }`;
  }
  if (report.overall?.value >= 65) {
    return `A balanced overall reading, with ${formatList(focus)} carrying the most room for gentle attention.`;
  }
  return `Your report highlights ${formatList(focus)} as the signals to approach with a little more care. Skin scores are a snapshot of this photo — not a verdict.`;
}

export function formatList(items) {
  if (!items?.length) return 'your selected concerns';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function buildRoutine(report) {
  if (!report?.measurements?.length) {
    return {
      morning: ['Gentle cleanser', 'Hydrating moisturizer', 'Broad-spectrum SPF 30+'],
      evening: ['Gentle cleanser', 'Moisturizer'],
      weekly: 'Keep it simple and consistent. Introduce one new product at a time.',
    };
  }

  const byKey = Object.fromEntries(report.measurements.map((item) => [item.key, item]));
  const focus = report.focusAreas || [];
  const exfoliant = focus.includes('pores') || focus.includes('texture')
    ? 'Salicylic or lactic acid treatment (1–2 evenings a week)'
    : null;
  const brightener = focus.includes('radiance') || focus.includes('blemishes')
    ? 'Niacinamide or vitamin C serum'
    : null;
  const soother = focus.includes('redness')
    ? 'Centella or panthenol soothing serum'
    : null;
  const oilBalance = focus.includes('oiliness') ? 'Lightweight gel moisturizer' : 'Ceramide moisturizer';

  return {
    morning: [
      byKey.oiliness?.score !== undefined && byKey.oiliness.score < 65
        ? 'Gentle gel cleanser'
        : 'Gentle cream cleanser',
      brightener,
      soother,
      'Moisturizer suited to how your skin feels',
      'Broad-spectrum SPF 30+',
    ].filter(Boolean),
    evening: [
      'Cleanse away SPF and makeup',
      soother || brightener,
      exfoliant,
      oilBalance,
    ].filter(Boolean),
    weekly: exfoliant
      ? 'Start with one exfoliating evening, then build to two only if the skin feels comfortable. Skip it on any day the skin feels irritated.'
      : 'Keep the routine consistent, patch test new products, and give any change two to three weeks before judging it.',
  };
}

export function routineForPlanner(report) {
  const routine = buildRoutine(report);
  const morning = routine.morning.slice(0, 3).join(' · ');
  const evening = routine.evening.slice(0, 3).join(' · ');
  return `AM: ${morning}\nPM: ${evening}`;
}

export function reportDateLabel(report) {
  if (!report?.createdAt) return '';
  return new Date(report.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
