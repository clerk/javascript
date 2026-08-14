/**
 * Tints the mobile browser's own chrome to match the dialog's scrim, so an open overlay reads as
 * one continuous surface instead of a dimmed page inside undimmed browser furniture.
 *
 * Two surfaces have to move together:
 *
 * - `<meta name="theme-color">` tints the address bar and toolbar on iOS Safari and Chrome/Firefox
 *   for Android.
 * - `<body>`'s background propagates to the CANVAS (per CSS, when `<html>` has none of its own),
 *   which is what paints everything OUTSIDE the layout viewport: the rubber-band overscroll gutter,
 *   the strip revealed as the address bar collapses, and the area behind the home indicator. A
 *   `position: fixed` scrim covers none of those, so without this the app's original colour shows
 *   through at the edges as an undimmed band.
 *
 * Nothing here is an opinion. The target colour is DERIVED — the backdrop's own computed
 * background composited over whatever the page already had — so this ships no colour, and stays
 * correct if a consumer retunes the scrim. It reverts exactly, and it is inert on platforms that
 * ignore `theme-color`.
 */

/** How the page looked before any dialog opened. Captured once, on the first open. */
interface Snapshot {
  /** The meta we inserted, so teardown removes exactly ours. */
  meta: HTMLMetaElement;
  /** `<body>`'s own inline background, restored verbatim (including "not set"). */
  bodyBackground: string;
  /** The colour the chrome had before we touched it, and what we composite over. */
  base: string;
}

/** One open dialog's contribution to the tint. */
interface Layer {
  /** The backdrop's computed background, composited over whatever is beneath it. */
  scrim: string;
  /**
   * The backdrop's LIVE computed style, not a snapshot of its timing.
   *
   * `getComputedStyle` returns a live object, and that matters twice. The backdrop's duration
   * differs by direction — shorter leaving than arriving — so reading it at each use gets the
   * right one for free. And it is `0s` on the entering frame, where the headless layer sets an
   * inline `transition: none`; a value captured there would make every fade a snap.
   */
  styles: CSSStyleDeclaration;
}

/** Read at each use, never cached — see `Layer.styles`. */
const layerDuration = (layer: Layer) => firstDuration(layer.styles.transitionDuration);
const layerEase = (layer: Layer) => makeEasing(layer.styles.transitionTimingFunction);

let snapshot: Snapshot | null = null;
/**
 * The open dialogs, outermost first. A STACK rather than a count, because the tint has to be
 * reversible: closing a nested dialog must return the chrome to what the dialogs still open
 * compose to, which a counter cannot reconstruct. Recomputing from the base every time also makes
 * the result independent of the order things happened in.
 */
const layers: Layer[] = [];
let frame = 0;
/**
 * The deferred teardown, so it can be CANCELLED if a dialog opens again before it fires.
 *
 * Without this, closing schedules a `finish` that removes the meta after the fade — and anything
 * that re-opens inside that window (a second dialog, or React StrictMode's mount → cleanup →
 * mount in dev) gets its tint torn out from under it a beat later. The symptom is a dialog that
 * tints the chrome correctly and then reverts to the page's own colour while still open.
 */
let teardown = 0;

/**
 * A 1x1 scratch canvas, used as the colour engine. Created lazily and reused.
 */
let scratch: CanvasRenderingContext2D | null | undefined;
function context(): CanvasRenderingContext2D | null {
  if (scratch === undefined) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Feature-detected rather than assumed: jsdom hands back a context object with none of the
    // drawing methods on it, so a plain null check is not enough. Without a usable canvas the
    // colour work is skipped entirely — the meta is still added and removed, so nothing else
    // changes; only the tint is absent.
    const usable =
      typeof ctx?.clearRect === 'function' &&
      typeof ctx.fillRect === 'function' &&
      typeof ctx.getImageData === 'function';
    scratch = usable ? ctx : null;
  }
  return scratch;
}

/**
 * Resolves any CSS colour the browser can render to sRGB `[r, g, b]`, by painting it and reading
 * the pixel back.
 *
 * Parsing the string ourselves is not an option, and the reason is worth stating: a computed
 * colour is NOT necessarily `rgb()`. Our scrim serialises as `oklab(0 0 0 / 0.4)` and a light
 * page's background as `oklab(1 0 0)` — where the three numbers are lightness and two opponent
 * axes, not channels. Reading them positionally turns white into `rgb(1, 0, 0)`, i.e. black, which
 * is exactly the bug this replaces. Canvas applies the real colour grammar and hands back sRGB.
 *
 * Returns `null` when the value is not a colour the canvas will take, which callers treat as "do
 * nothing" — a colour we cannot resolve is not one to guess at.
 */
function readColor(input: string): [number, number, number] | null {
  const ctx = context();
  if (!ctx || !input) {
    return null;
  }
  // A sentinel that the input cannot coincidentally equal: if assignment is rejected, `fillStyle`
  // keeps this value and we know the parse failed rather than silently painting the wrong colour.
  ctx.fillStyle = '#010203';
  ctx.fillStyle = input;
  if (ctx.fillStyle === '#010203' && input !== '#010203') {
    return null;
  }
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

/**
 * The scrim over the page, composited by the canvas rather than by hand — so the scrim's alpha,
 * its colour space, and the blend are all the browser's own arithmetic.
 */
function composite(under: string, over: string): [number, number, number] | null {
  const ctx = context();
  if (!ctx || !readColor(under) || !readColor(over)) {
    return null;
  }
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = under;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = over;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

const toCss = ([r, g, b]: [number, number, number]) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

/**
 * The colour the chrome already had. Prefers the app's own `theme-color` — honouring `media`, since
 * an app may ship one per colour scheme and only the first MATCHING one applies — and falls back to
 * the body's background, which is what a browser samples when no meta is present.
 */
function readBaseColor(): string {
  const metas = document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  for (const meta of metas) {
    const media = meta.getAttribute('media');
    if (!media || window.matchMedia(media).matches) {
      return meta.content;
    }
  }
  return getComputedStyle(document.body).backgroundColor;
}

/**
 * A cubic-bézier sampler backed by a lookup table.
 *
 * Solving x→t exactly per frame is a Newton iteration on the main thread during the one animation
 * the user is watching. Sampling the curve once into a table and interpolating between entries is a
 * binary search instead, and at this resolution the error is far below a colour step.
 */
function makeEasing(spec: string): (t: number) => number {
  const match = spec.match(/cubic-bezier\(([^)]+)\)/);
  if (!match) {
    return t => t;
  }
  const [x1, y1, x2, y2] = match[1].split(',').map(Number);
  if ([x1, y1, x2, y2].some(Number.isNaN)) {
    return t => t;
  }
  const axis = (p1: number, p2: number, t: number) => {
    const u = 1 - t;
    return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
  };
  const SAMPLES = 32;
  const table = Array.from({ length: SAMPLES + 1 }, (_, i) => axis(x1, x2, i / SAMPLES));
  return (x: number) => {
    let lo = 0;
    while (lo < SAMPLES && table[lo + 1] < x) {
      lo++;
    }
    const span = table[lo + 1] - table[lo];
    const t = (lo + (span > 0 ? (x - table[lo]) / span : 0)) / SAMPLES;
    return axis(y1, y2, t);
  };
}

/** Seconds from the first entry of a computed `transition-duration` list. */
const firstDuration = (value: string) => {
  const first = value.split(',')[0].trim();
  const n = parseFloat(first);
  return Number.isNaN(n) ? 0 : first.endsWith('ms') ? n : n * 1000;
};

function animate(from: string, to: string, durationMs: number, ease: (t: number) => number) {
  cancelAnimationFrame(frame);
  const apply = (value: string) => {
    if (!snapshot) {
      return;
    }
    snapshot.meta.content = value;
    document.body.style.backgroundColor = value;
  };
  const a = readColor(from);
  const b = readColor(to);
  if (!a || !b || durationMs <= 0) {
    apply(to);
    return;
  }
  const start = performance.now();
  const step = () => {
    if (!snapshot) {
      return;
    }
    const p = Math.min(1, (performance.now() - start) / durationMs);
    const e = ease(p);
    apply(toCss([a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e]));
    if (p < 1) {
      frame = requestAnimationFrame(step);
    }
  };
  frame = requestAnimationFrame(step);
}

/**
 * Called by every mounted backdrop. Refcounted like floating-ui's scroll lock, so stacked dialogs
 * compose: the first open captures and tints, each further open re-derives from the deeper scrim,
 * and only the last close restores.
 *
 * @param backdrop - the element whose computed background and transition timing drive both the
 * target colour and how long it takes to get there. Reading the timing from CSS rather than
 * duplicating a constant means the chrome automatically follows the sheet's longer fade on mobile.
 */
/**
 * The colour the chrome should show right now: the captured base with every open dialog's scrim
 * composited over it in order, so two stacked dialogs land on the same value their two backdrops
 * do. Recomputed from scratch on every change rather than accumulated, which is what makes
 * closing one of them exactly reversible.
 */
function resolveTint(): string | null {
  if (!snapshot) {
    return null;
  }
  let colour = snapshot.base;
  for (const layer of layers) {
    const next = composite(colour, layer.scrim);
    if (!next) {
      return null;
    }
    colour = toCss(next);
  }
  return colour;
}

export function acquireBrowserChrome(backdrop: HTMLElement): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  // Reclaim a teardown that has not fired yet: the snapshot it would have torn down is the one
  // about to be reused.
  window.clearTimeout(teardown);
  teardown = 0;

  if (!snapshot) {
    const base = readBaseColor();
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = base;
    // PREPENDED, never mutating the app's own. The UA uses the first `theme-color` in tree order
    // whose media matches, so inserting ahead of theirs overrides it without touching it — and
    // removing ours restores their value with no bookkeeping. That also sidesteps frameworks that
    // manage the tag themselves (Next's `viewport.themeColor`), which can revert a mutation on
    // any re-render.
    document.head.prepend(meta);
    snapshot = { meta, bodyBackground: document.body.style.backgroundColor, base };
  }

  const styles = getComputedStyle(backdrop);
  const layer: Layer = { scrim: styles.backgroundColor, styles };
  layers.push(layer);

  const target = resolveTint();
  if (target) {
    animate(snapshot.meta.content, target, layerDuration(layer), layerEase(layer));
  }

  // Idempotent: callers release on `data-ending-style` and again at unmount, and a second call
  // must not re-run the fade or the teardown.
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    const index = layers.indexOf(layer);
    if (index >= 0) {
      layers.splice(index, 1);
    }
    if (!snapshot) {
      return;
    }

    // Dialogs still open: return to what THEY compose to. The old code returned early here, which
    // left a nested dialog's deeper tint on the chrome after it closed.
    if (layers.length > 0) {
      const remaining = resolveTint();
      if (remaining) {
        animate(snapshot.meta.content, remaining, layerDuration(layer), layerEase(layer));
      }
      return;
    }

    const closing = snapshot;
    const { meta, bodyBackground, base } = closing;
    // Fade back before tearing down, so closing reads as the reverse of opening rather than as a
    // flash. `snapshot` is cleared only once the colour has landed.
    const finish = () => {
      teardown = 0;
      // Identity check as well as the cancel above: a re-open replaces `snapshot`, and this
      // closure must not remove a meta that now belongs to a dialog which is still open.
      if (snapshot !== closing) {
        return;
      }
      cancelAnimationFrame(frame);
      meta.remove();
      document.body.style.backgroundColor = bodyBackground;
      snapshot = null;
    };
    const durationMs = layerDuration(layer);
    if (durationMs <= 0) {
      finish();
      return;
    }
    animate(meta.content, base, durationMs, layerEase(layer));
    teardown = window.setTimeout(finish, durationMs);
  };
}
