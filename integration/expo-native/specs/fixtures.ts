import { createTest } from '@clerk/internal-mobile-e2e/specs/fixtures';
import { app } from './app.ts';

export const { test, expect, CLERK_TEST_CODE } = createTest(app);
