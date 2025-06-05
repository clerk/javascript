import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

globalThis.PACKAGE_NAME = '@clerk/clerk-js';
globalThis.PACKAGE_VERSION = '0.0.0-test';
globalThis.__BUILD_VARIANT_CHIPS__ = false;

afterEach(cleanup);
