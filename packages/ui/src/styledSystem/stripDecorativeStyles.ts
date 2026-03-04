// Pure layout properties only. Everything else reverts to browser defaults.
// This gives raw mode a "plain HTML" feel where buttons look like <button>,
// inputs look like <input>, etc.
const STRUCTURAL_PROPERTIES = new Set([
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'gap',
  'rowGap',
  'columnGap',
  'zIndex',
  'boxSizing',
  'pointerEvents',
  'verticalAlign',
  'aspectRatio',
  'objectFit',
  'objectPosition',
  'float',
  'clear',
  'order',
  'alignSelf',
  'alignItems',
  'alignContent',
  'justifySelf',
  'justifyItems',
  'justifyContent',
  'placeSelf',
  'placeItems',
  'placeContent',
  'opacity',
  'visibility',
  'tableLayout',
  'borderCollapse',
  'borderSpacing',
]);

// Content-rendering properties that produce visible icon/image content.
// These must survive stripping so icons remain visible in raw mode.
const CONTENT_RENDERING_PREFIXES = ['background', 'mask', 'WebkitMask'];

const STRUCTURAL_PREFIXES = ['flex', 'inset', 'margin', 'padding', 'overflow', 'min', 'max', 'clip'];

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isStructuralProperty(key: string): boolean {
  if (STRUCTURAL_PROPERTIES.has(key)) return true;
  return STRUCTURAL_PREFIXES.some(prefix => key.startsWith(prefix));
}

function isContentRenderingProperty(key: string): boolean {
  return CONTENT_RENDERING_PREFIXES.some(prefix => key.startsWith(prefix));
}

export type StripOptions = {
  // When true, preserve backgroundImage/maskImage and related properties
  // so icon content remains visible. Used for sx props but NOT for variant
  // base styles where these properties are purely decorative.
  preserveContentRendering?: boolean;
};

export function stripDecorativeStyles(styles: Record<string, any>, options?: StripOptions): Record<string, any> {
  const preserveContent = options?.preserveContentRendering ?? false;

  // Emotion supports style arrays - recurse into each item
  if (Array.isArray(styles)) {
    return styles.map(s => {
      if (!s) return s;
      if (typeof s === 'object') return stripDecorativeStyles(s, options);
      return s;
    }) as any;
  }

  const result: Record<string, any> = {};
  for (const key in styles) {
    const value = styles[key];
    if (key.startsWith('--')) {
      // Keep CSS custom properties - structural properties may reference them
      // (e.g. grid math, spinner sizing). Decorative properties that consume
      // these vars are already stripped, so unused vars are harmless.
      result[key] = value;
      continue;
    }
    if (isPlainObject(value)) {
      const filtered = stripDecorativeStyles(value, options);
      if (Object.keys(filtered).length > 0) {
        result[key] = filtered;
      }
    } else if (isStructuralProperty(key) || (preserveContent && isContentRenderingProperty(key))) {
      result[key] = value;
    }
  }
  return result;
}
