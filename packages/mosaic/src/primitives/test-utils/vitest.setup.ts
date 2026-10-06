import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
// `vitest-axe/matchers` re-exports this as `export type *`, so under verbatimModuleSyntax
// TypeScript rejects it as a value import here. `dist/matchers` has the real (non-type-only) export.
import { toHaveNoViolations } from 'vitest-axe/dist/matchers';

expect.extend(matchers);
expect.extend({ toHaveNoViolations });
