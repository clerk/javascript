const ClerkMock = jest.fn(() => {
  return 'clerkClient';
});

jest.mock('@clerk/backend', () => {
  return {
    ...jest.requireActual('@clerk/backend'),
    Clerk: ClerkMock,
  };
});

import { clerkClient } from './clerkClient';

describe('clerk', () => {
  afterAll(() => {
    jest.resetModules();
  });

  test('initializes clerk with constants', () => {
    expect(ClerkMock.mock.calls).toMatchSnapshot();
    expect(clerkClient).toEqual('clerkClient');
  });
});
