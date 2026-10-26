export const SKIN_DEPTHS = {
  essential: {
    id: 'essential',
    label: 'Essential study',
    actions: ['hd_texture', 'hd_pore', 'hd_redness', 'hd_acne'],
    estimatedUnits: 12,
  },
  complete: {
    id: 'complete',
    label: 'Complete study',
    actions: [
      'hd_texture',
      'hd_pore',
      'hd_redness',
      'hd_acne',
      'hd_moisture',
      'hd_radiance',
      'hd_oiliness',
      'hd_skin_type',
    ],
    estimatedUnits: 16,
  },
};

export const SKIN_FEATURES = {
  hd_texture: {
    key: 'texture',
    label: 'Texture',
    short: 'The look and feel of the skin surface',
    plain: 'Reflects how smooth and even the skin surface appears in the photo.',
    ingredients: ['PHA or lactic acid', 'Glycerin', 'Niacinamide'],
    productTypes: ['Gentle exfoliant', 'Barrier-supporting moisturizer'],
    care: 'Introduce exfoliation slowly, one or two evenings a week, and keep the rest of the routine gentle.',
  },
  hd_pore: {
    key: 'pores',
    label: 'Pores',
    short: 'Visible pore appearance',
    plain: 'Describes how visible pores appear across the T-zone and cheeks.',
    ingredients: ['Salicylic acid (BHA)', 'Niacinamide', 'Zinc PCA'],
    productTypes: ['BHA treatment', 'Lightweight gel moisturizer'],
    care: 'Keep cleansing consistent without over-washing. A once-weekly clarifying treatment is often enough to start.',
  },
  hd_redness: {
    key: 'redness',
    label: 'Redness',
    short: 'Visible redness across the face',
    plain: 'Describes the amount of visible redness captured in this image.',
    ingredients: ['Centella asiatica', 'Panthenol', 'Azelaic acid'],
    productTypes: ['Soothing serum', 'Fragrance-free moisturizer', 'Mineral sunscreen'],
    care: 'Favor fragrance-free, soothing formulas and daily sunscreen. Persistent or painful redness deserves professional advice.',
  },
  hd_acne: {
    key: 'blemishes',
    label: 'Blemishes',
    short: 'Visible blemish appearance',
    plain: 'Reflects the visible blemish-like texture detected in the image, not a medical diagnosis.',
    ingredients: ['Salicylic acid', 'Niacinamide', 'Benzoyl peroxide'],
    productTypes: ['Non-comedogenic moisturizer', 'Targeted blemish treatment'],
    care: 'Use one active at a time and avoid picking. If blemishes are painful, widespread, or persistent, consult a dermatologist.',
  },
  hd_moisture: {
    key: 'hydration',
    label: 'Hydration',
    short: 'Surface hydration appearance',
    plain: 'Describes how hydrated the skin surface appears in this photo.',
    ingredients: ['Hyaluronic acid', 'Glycerin', 'Ceramides'],
    productTypes: ['Hydrating serum', 'Ceramide moisturizer'],
    care: 'Apply hydrating layers to slightly damp skin, then seal with moisturizer. Avoid very hot water and harsh cleansers.',
  },
  hd_radiance: {
    key: 'radiance',
    label: 'Radiance',
    short: 'Brightness and light reflection',
    plain: 'Describes how bright and reflective the skin appears under this lighting.',
    ingredients: ['Vitamin C', 'Niacinamide', 'Glycolic acid'],
    productTypes: ['Antioxidant serum', 'Daily sunscreen'],
    care: 'Daily sunscreen protects the radiance you already have. Introduce brightening actives gradually and patch test.',
  },
  hd_oiliness: {
    key: 'oiliness',
    label: 'Oil balance',
    short: 'Visible shine and oiliness',
    plain: 'Describes the visible oiliness captured at the time of the photo.',
    ingredients: ['Niacinamide', 'Zinc PCA', 'Salicylic acid'],
    productTypes: ['Gel moisturizer', 'Gentle foaming cleanser'],
    care: 'Hydration still matters for oily skin. Choose lightweight layers rather than stripping cleansers.',
  },
  hd_skin_type: {
    key: 'skin_type',
    label: 'Skin type',
    short: 'API-assigned skin type',
    plain: 'The API classifies the skin type from the photo. Skin can change with weather, routine, and hormones.',
    ingredients: [],
    productTypes: [],
    care: 'Use the classification as one useful snapshot, not a permanent label.',
  },
};

export const SKIN_TYPE_LABELS = {
  normal: 'Normal',
  oily: 'Oily',
  dry: 'Dry',
  combination: 'Combination',
  redness: 'Redness-prone',
  'dry and redness': 'Dry with redness',
  'dry & redness': 'Dry with redness',
  'oily and redness': 'Oily with redness',
  'oily & redness': 'Oily with redness',
  'combination and redness': 'Combination with redness',
  'combination & redness': 'Combination with redness',
};

const ERROR_COPY = {
  error_below_min_image_size: 'The photo is below the minimum size required by Skin AI. Use a portrait at least 1080px on the short side (JPG/PNG).',
  error_exceed_max_image_size: 'The photo is larger than Skin AI supports.',
  error_src_face_too_small: 'Move a little closer. Skin AI needs the face to fill more of the frame.',
  error_src_face_out_of_bound: 'Part of the face is outside the frame. Retake the photo with the full face visible.',
  error_lighting_dark: 'The photo is too dark. Try brighter, more even light.',
  error_multi_person: 'Skin AI needs a photo with one clear face.',
  invalid_parameter: 'The analysis request was rejected. Please check the upload and try again.',
  error_download_image: 'The image could not be retrieved by Skin AI. Please try a new upload.',
};

export function friendlyTaskError(code) {
  return ERROR_COPY[code] || 'Skin AI could not complete this photo. Try again with a well-lit, front-facing portrait.';
}

function normalizeScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(100, Math.max(1, number));
}

function normalizeRegion(region) {
  if (!region) return 'whole';
  return String(region).toLowerCase().replaceAll(' ', '_').replaceAll('-', '_');
}

function normalizeSkinType(value) {
  if (!value) return null;
  const cleaned = String(value).trim();
  return SKIN_TYPE_LABELS[cleaned.toLowerCase()] || cleaned;
}

export function parseSkinOutput(output, meta = {}) {
  if (!Array.isArray(output) || output.length === 0) {
    throw new Error('Skin AI returned no readable results.');
  }

  const measurements = [];
  const skinType = {};
  let overall = null;
  let skinAge = null;
  let visualUrl = null;

  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const type = String(item.type || '');

    if (type === 'all') {
      const score = normalizeScore(item.score);
      if (score !== null) overall = { value: score, source: 'api' };
      continue;
    }

    if (type === 'skin_age') {
      const age = Number(item.score ?? item.skin_age);
      if (Number.isFinite(age)) skinAge = age;
      continue;
    }

    if (type === 'resize_image') {
      visualUrl = item.mask_urls?.[0] || visualUrl;
      continue;
    }

    if (type === 'hd_skin_type' || type === 'skin_type') {
      const region = normalizeRegion(item.region || 'whole');
      if (item.skin_type) skinType[region] = normalizeSkinType(item.skin_type);
      visualUrl = item.mask_urls?.[0] || visualUrl;
      continue;
    }

    const feature = SKIN_FEATURES[type];
    if (!feature) continue;

    const score = normalizeScore(item.ui_score ?? item.score);
    const rawScore = normalizeScore(item.raw_score);
    const region = normalizeRegion(item.region || 'whole');

    const existing = measurements.find((measurement) => measurement.type === type);
    const regionValue = {
      region,
      score,
      rawScore,
      maskUrl: item.mask_urls?.[0] || null,
    };

    if (existing) {
      existing.regions.push(regionValue);
      if (region === 'whole' && score !== null) {
        existing.score = score;
        existing.rawScore = rawScore;
        existing.maskUrl = regionValue.maskUrl;
      }
      if (existing.score === null && score !== null) {
        existing.score = score;
        existing.rawScore = rawScore;
      }
    } else {
      measurements.push({
        type,
        key: feature.key,
        label: feature.label,
        short: feature.short,
        plain: feature.plain,
        ingredients: feature.ingredients,
        productTypes: feature.productTypes,
        care: feature.care,
        score,
        rawScore,
        region,
        maskUrl: regionValue.maskUrl,
        regions: [regionValue],
      });
    }

    visualUrl = item.mask_urls?.[0] || visualUrl;
  }

  if (!measurements.length) {
    throw new Error('Skin AI returned no supported concern scores.');
  }

  const scored = measurements.filter((measurement) => measurement.score !== null);
  if (!overall && scored.length) {
    const average = scored.reduce((total, measurement) => total + measurement.score, 0) / scored.length;
    overall = { value: Math.round(average * 10) / 10, source: 'average' };
  }

  const focusAreas = [...scored]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((measurement) => measurement.key);

  return {
    source: 'youcam',
    engine: 'Perfect Corp YouCam Skin AI v2.1',
    createdAt: meta.createdAt || new Date().toISOString(),
    taskId: meta.taskId || null,
    depth: meta.depth || null,
    estimatedUnits: meta.estimatedUnits ?? null,
    overall,
    skinAge,
    skinType,
    measurements,
    focusAreas,
    visualUrl,
  };
}

export function parseTask(taskResponse, meta = {}) {
  const data = taskResponse?.data;
  if (!data) throw new Error('Skin AI returned an unexpected task response.');

  if (data.task_status === 'running') return { status: 'running' };
  if (data.task_status === 'error') {
    return {
      status: 'error',
      code: data.error || 'TASK_FAILED',
      message: friendlyTaskError(data.error),
    };
  }
  if (data.task_status !== 'success') {
    throw new Error('Skin AI returned an unknown task status.');
  }

  const output = data.results?.output;
  const report = parseSkinOutput(output, meta);
  return { status: 'success', report };
}
