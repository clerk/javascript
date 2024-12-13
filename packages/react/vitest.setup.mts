import { beforeAll } from 'vitest';

globalThis.__DEV__ = true;
globalThis.PACKAGE_NAME = '@clerk/clerk-react';
globalThis.PACKAGE_VERSION = '0.0.0-test';

beforeAll(() => {});
