import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
import { toHaveNoViolations } from 'vitest-axe/matchers';

expect.extend(matchers);
expect.extend({ toHaveNoViolations });
