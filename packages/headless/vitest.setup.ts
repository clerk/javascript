import '@testing-library/jest-dom/vitest';
import { toHaveNoViolations } from './src/test-utils/axe';
import { expect } from 'vitest';

expect.extend({ toHaveNoViolations });
