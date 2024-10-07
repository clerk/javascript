import { beforeAll } from 'vitest';

globalThis.PACKAGE_NAME = '@clerk/nextjs';
globalThis.PACKAGE_VERSION = '1';
globalThis.SIGN_IN_URL = 'https://signin.clerk.com';

beforeAll(() => {});
