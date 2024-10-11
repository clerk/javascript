import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './src/mock-server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

server.events.on('request:start', ({ request }) => {
  // FOR DEBUGGING
  // console.log('MSW intercepted:', request.method, request.url);
});

globalThis.PACKAGE_NAME = '@clerk/backend';
globalThis.PACKAGE_VERSION = '1';
