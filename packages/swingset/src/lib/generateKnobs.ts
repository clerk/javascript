import type { KnobDef, KnobRecord, KnobValues, StoryMeta } from './types';

type VariantMap = Record<string, Record<string, unknown>>;

function variantToKnob(key: string, options: Record<string, unknown>, defaultValue?: unknown): KnobDef {
  const keys = Object.keys(options);

  if (keys.every(k => k === 'true' || k === 'false')) {
    const resolved = defaultValue !== undefined ? defaultValue === true || defaultValue === 'true' : false;
    return { type: 'boolean', label: key, defaultValue: resolved };
  }

  const resolvedDefault =
    typeof defaultValue === 'string' && keys.includes(defaultValue) ? defaultValue : (keys[0] ?? '');

  return { type: 'select', label: key, options: keys, defaultValue: resolvedDefault };
}

export function generateKnobs(meta: StoryMeta): KnobRecord {
  const knobs: KnobRecord = {};

  // CVA variants → boolean/select knobs.
  if (meta.styles?._variants) {
    const variants = meta.styles._variants as VariantMap;
    const defaults = meta.styles._defaultVariants ?? {};
    for (const [key, options] of Object.entries(variants)) {
      knobs[key] = variantToKnob(key, options, defaults[key]);
    }
  }

  // Ad-hoc knobs declared on the story (e.g. text content props) extend the variant set.
  if (meta.knobs) {
    Object.assign(knobs, meta.knobs);
  }

  return knobs;
}

export function initKnobValues(knobs: KnobRecord): KnobValues {
  return Object.fromEntries(Object.entries(knobs).map(([key, def]) => [key, def.defaultValue]));
}
