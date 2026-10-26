export const OCCASIONS = ['Everyday', 'Work', 'Evening', 'Weekend'];
export const PALETTES = ['Warm neutrals', 'Plum', 'Soft rose', 'Denim blues'];
export const LOOK_KINDS = ['All', 'Outfit', 'Beauty'];

export const looks = [
  {
    id: 'silk-hour',
    title: 'The Silk Hour',
    kind: 'Outfit',
    occasion: 'Evening',
    palette: 'Plum',
    image: '/images/look-silk.jpg',
    alt: 'A flowing evening look in soft, warm light',
    caption: 'A study in movement and restraint.',
    description:
      'A bias-cut slip, a whisper of sheer knit, and a sculptural sandal. The beauty stays close to skin: sheer berry, brushed brows, and a little light at the inner eye.',
    pieces: ['Bias-cut midi slip', 'Sheer cropped cardigan', 'Sculptural sandal'],
    beauty: 'Sheer berry lip · brushed brows · skin-first base',
    swatches: ['#4b1e3a', '#8a5b68', '#d7b4a6'],
    note: 'A quiet alternative to obvious eveningwear.',
  },
  {
    id: 'city-in-motion',
    title: 'City in Motion',
    kind: 'Outfit',
    occasion: 'Everyday',
    palette: 'Warm neutrals',
    image: '/images/look-city.jpg',
    alt: 'An editorial city outfit with relaxed tailoring',
    caption: 'Tailoring, softened.',
    description:
      'An easy column of oatmeal and ecru with a long coat, low slung bag, and a practical flat. A clean brow and tinted balm keep the pace.',
    pieces: ['Long wool coat', 'Fine-knit column', 'Leather tote', 'Soft flat'],
    beauty: 'Tinted balm · clean brow · invisible SPF',
    swatches: ['#c9b79d', '#8b735d', '#ede5da'],
    note: 'Built for a day that moves faster than the plan.',
  },
  {
    id: 'soft-focus',
    title: 'Soft Focus',
    kind: 'Beauty',
    occasion: 'Everyday',
    palette: 'Soft rose',
    image: '/images/look-soft.jpg',
    alt: 'A soft-toned beauty still life',
    caption: 'A lighter hand, deliberately.',
    description:
      'Cream blush placed high on the cheek, a wash of taupe on the lid, and a rosewater lip. The finish sits somewhere between satin and skin.',
    pieces: ['Cream blush in muted rose', 'Taupe eye colour', 'Rose lip tint', 'Brow soap'],
    beauty: 'Cream blush · satin skin · rose lip',
    swatches: ['#c8948d', '#a97a72', '#e8d6ce'],
    note: 'The five-minute face that still looks considered.',
  },
  {
    id: 'quiet-neutrals',
    title: 'Quiet Neutrals',
    kind: 'Outfit',
    occasion: 'Work',
    palette: 'Warm neutrals',
    image: '/images/look-neutral.jpg',
    alt: 'A pared-back neutral outfit in natural light',
    caption: 'Nothing to prove.',
    description:
      'Tonal layers in ivory, camel, and a deep espresso. The shape does the talking; the accessories stay small and deliberate.',
    pieces: ['Ivory silk shirt', 'Camel tailored trouser', 'Espresso belt', 'Small gold hoop'],
    beauty: 'Sheer skin · soft brown liner · clear gloss',
    swatches: ['#e8dfd2', '#b19271', '#4a3730'],
    note: 'A strong case for buying the quiet version.',
  },
  {
    id: 'after-dark',
    title: 'After Dark',
    kind: 'Outfit',
    occasion: 'Evening',
    palette: 'Plum',
    image: '/images/look-evening.jpg',
    alt: 'An evening fashion look in a rich, dark palette',
    caption: 'A little depth, a little shine.',
    description:
      'A deep plum column with a satin heel and a single, larger earring. The face is left mostly bare, with a smoked lash line and balm.',
    pieces: ['Deep plum dress', 'Satin slingback', 'Sculpted earring'],
    beauty: 'Smoked lash line · bare lip · soft highlight',
    swatches: ['#3e1d30', '#71465d', '#b98a86'],
    note: 'Let one element carry the evening.',
  },
  {
    id: 'sunday-unhurried',
    title: 'Sunday, Unhurried',
    kind: 'Outfit',
    occasion: 'Weekend',
    palette: 'Denim blues',
    image: '/images/look-denim.jpg',
    alt: 'A relaxed weekend outfit with denim and a soft bag',
    caption: 'Errands, but make them editorial.',
    description:
      'A straight-leg jean, a worn-in shirt, and a soft leather bag. Hair is air-dried; the only makeup is a tinted sunscreen and a flush of colour.',
    pieces: ['Straight-leg denim', 'Oversized poplin shirt', 'Soft leather shoulder bag'],
    beauty: 'Tinted SPF · gel blush · lip balm',
    swatches: ['#5c718a', '#a5b3c4', '#efe3d5'],
    note: 'Comfort is part of the point.',
  },
  {
    id: 'studio-glow',
    title: 'Studio Glow',
    kind: 'Beauty',
    occasion: 'Evening',
    palette: 'Soft rose',
    image: '/images/beauty.jpg',
    alt: 'A luminous makeup editorial portrait',
    caption: 'Skin first, always.',
    description:
      'A sheer, lit-from-within base with cream highlighter on the high points of the face. Brown mascara and a blurred rose lip keep it from feeling formal.',
    pieces: ['Luminous skin tint', 'Cream highlighter', 'Brown mascara', 'Blurred rose lip'],
    beauty: 'Skin tint · cream glow · blurred rose',
    swatches: ['#ce9e92', '#e7c4b8', '#8d6258'],
    note: 'Works with the light, not against it.',
  },
  {
    id: 'the-evening-ritual',
    title: 'The Evening Ritual',
    kind: 'Beauty',
    occasion: 'Weekend',
    palette: 'Warm neutrals',
    image: '/images/texture.jpg',
    alt: 'A calm skincare still life with warm textures',
    caption: 'A slower close to the day.',
    description:
      'A double cleanse only when needed, a hydrating layer on damp skin, and a ceramide cream pressed in. Sundays get a gentle exfoliation and nothing more.',
    pieces: ['Cream cleanser', 'Hydrating toner', 'Ceramide moisturizer', 'Weekly PHA'],
    beauty: 'Cleanse · hydrate · seal · rest',
    swatches: ['#dccbb8', '#b8a48d', '#f2e9dd'],
    note: 'A routine you can keep is better than a perfect one.',
  },
];

export function filterLooks(items, { kind = 'All', occasion = 'All', palette = 'All' } = {}) {
  return items.filter((look) => {
    if (kind !== 'All' && look.kind !== kind) return false;
    if (occasion !== 'All' && look.occasion !== occasion) return false;
    if (palette !== 'All' && look.palette !== palette) return false;
    return true;
  });
}

export function looksForPreference(items, { occasion, palette }) {
  return [...items].sort((a, b) => {
    const scoreA = (a.occasion === occasion ? 1 : 0) + (a.palette === palette ? 1 : 0);
    const scoreB = (b.occasion === occasion ? 1 : 0) + (b.palette === palette ? 1 : 0);
    return scoreB - scoreA;
  });
}
