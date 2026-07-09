import 'vitest';
import './vitest-axe';

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// `@testing-library/jest-dom/vitest` registers its matcher types via a
// triple-slash `/// <reference>` to an internal declaration file, which does not
// reliably apply when re-exported through this package's test setup. Declare the
// `vitest` module augmentation explicitly so `expect(...).toBeInTheDocument()` and
// friends are typed. `import 'vitest'` keeps this file a module augmentation
// rather than an ambient module declaration that would shadow vitest's own types.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}
