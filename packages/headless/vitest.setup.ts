import * as matchers from '@testing-library/jest-dom/matchers';
import { toHaveNoViolations } from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(matchers);
expect.extend({ toHaveNoViolations });
