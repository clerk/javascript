// The computable checks of the data-viz palette validator (dataviz skill, `validate_palette.js`),
// ported with its thresholds and its Machado 2009 CVD model so the token test fails where the
// validator would.

type Vector = readonly [number, number, number];

export type PaletteMode = 'light' | 'dark';

const BAND: Record<PaletteMode, readonly [number, number]> = { light: [0.43, 0.77], dark: [0.48, 0.67] };
const CHROMA_FLOOR = 0.1;
const CVD_TARGET = 8;
const NORMAL_FLOOR = 15;
const CONTRAST_MIN = 3;

const MACHADO = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
} as const;

const multiply = (matrix: readonly (readonly number[])[], [r, g, b]: Vector): Vector => [
  matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b,
  matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b,
  matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b,
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** An sRGB color quantized to 8 bits per channel, as the validator reads a hex value. */
export type Srgb8 = Vector;

export function oklchToSrgb8(l: number, c: number, h: number): Srgb8 {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const lms: Vector = [
    (l + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    (l - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    (l - 0.0894841775 * a - 1.291485548 * b) ** 3,
  ];
  const linear = multiply(
    [
      [4.0767416621, -3.3077115913, 0.2309699292],
      [-1.2684380046, 2.6097574011, -0.3413193965],
      [-0.0041960863, -0.7034186147, 1.707614701],
    ],
    lms,
  );
  if (linear.some(channel => channel < -1e-4 || channel > 1 + 1e-4)) {
    throw new Error(`oklch(${l} ${c} ${h}) is outside sRGB`);
  }
  const [r, g, bl] = linear.map(channel => Math.round(toGamma(clamp(channel)) * 255) / 255);
  return [r, g, bl];
}

const linearOf = (color: Srgb8): Vector => [toLinear(color[0]), toLinear(color[1]), toLinear(color[2])];

function oklabOfLinear([r, g, b]: Vector): Vector {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function deltaE(first: Srgb8, second: Srgb8, kind?: keyof typeof MACHADO) {
  const view = (color: Srgb8) => {
    const linear = linearOf(color);
    if (!kind) {
      return oklabOfLinear(linear);
    }
    const [r, g, b] = multiply(MACHADO[kind], linear);
    return oklabOfLinear([clamp(r), clamp(g), clamp(b)]);
  };
  const [l1, a1, b1] = view(first);
  const [l2, a2, b2] = view(second);
  return 100 * Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

function contrast(first: Srgb8, second: Srgb8) {
  const luminance = (color: Srgb8) => {
    const [r, g, b] = linearOf(color);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [high, low] = [luminance(first), luminance(second)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

/**
 * Throws with every failed check when a categorical palette, in slot order, fails the validator's
 * adjacent-pair checks against a surface: lightness band, chroma floor, CVD separation (protan and
 * deutan), the normal-vision floor and 3:1 contrast.
 */
export function assertChartPalette(palette: readonly Srgb8[], mode: PaletteMode, surface: Srgb8) {
  const failures: string[] = [];
  const [low, high] = BAND[mode];
  palette.forEach((color, index) => {
    const [l, a, b] = oklabOfLinear(linearOf(color));
    const slot = index + 1;
    if (l < low || l > high) {
      failures.push(`slot ${slot}: lightness ${l.toFixed(3)} outside ${low}-${high}`);
    }
    if (Math.hypot(a, b) < CHROMA_FLOOR) {
      failures.push(`slot ${slot}: chroma ${Math.hypot(a, b).toFixed(3)} below ${CHROMA_FLOOR}`);
    }
    if (contrast(color, surface) < CONTRAST_MIN) {
      failures.push(`slot ${slot}: contrast ${contrast(color, surface).toFixed(2)} below ${CONTRAST_MIN}:1`);
    }
  });
  for (let index = 1; index < palette.length; index++) {
    const pair = `slots ${index} and ${index + 1}`;
    const cvd = Math.min(
      deltaE(palette[index - 1], palette[index], 'protan'),
      deltaE(palette[index - 1], palette[index], 'deutan'),
    );
    if (cvd < CVD_TARGET) {
      failures.push(`${pair}: CVD ΔE ${cvd.toFixed(1)} below ${CVD_TARGET}`);
    }
    const normal = deltaE(palette[index - 1], palette[index]);
    if (normal < NORMAL_FLOOR) {
      failures.push(`${pair}: ΔE ${normal.toFixed(1)} below ${NORMAL_FLOOR}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`The ${mode} chart palette fails the data-viz checks:\n${failures.join('\n')}`);
  }
}
