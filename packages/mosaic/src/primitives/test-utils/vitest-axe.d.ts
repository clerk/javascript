import 'vitest';

import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Extending vitest's matcher types requires interface merging.
  interface Assertion<_R, _T> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Extending vitest's matcher types requires interface merging.
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
