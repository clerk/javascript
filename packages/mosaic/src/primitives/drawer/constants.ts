/**
 * Tunable thresholds for the drag/snap engine. Values ported from vaul
 * (`src/constants.ts`) and base-ui (`useSwipeDismiss`). Visual timing
 * (durations, easing) lives in CSS, never here — see the styled-layer contract
 * in the README.
 */

/** Fraction of the popup height past which a release closes the drawer. (vaul) */
export const CLOSE_THRESHOLD = 0.25;

/** px/ms release velocity above which a downward flick closes regardless of distance. (vaul) */
export const VELOCITY_THRESHOLD = 0.4;

/** px/ms release velocity above which a snap is skipped on release. (vaul) */
export const SNAP_SKIP_VELOCITY = 2;

/** ms window after an inner scroll during which drag is suppressed. (vaul) */
export const SCROLL_LOCK_TIMEOUT = 100;

/** ms after open during which drag is suppressed so the enter animation can settle. (vaul) */
export const OPEN_GRACE_PERIOD = 500;

/** Lower bound for the velocity sampling interval, so a stray fast sample can't blow up. (base-ui) */
export const MIN_SAMPLE_MS = 16;

/** ms; a release velocity sampled longer ago than this is treated as stale (0). (base-ui) */
export const RELEASE_VEL_MAX_AGE_MS = 80;
