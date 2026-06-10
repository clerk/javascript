import type { AxeMatchers } from 'vitest-axe/matchers';
import 'vitest';

declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
