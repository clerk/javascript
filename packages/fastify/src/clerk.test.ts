const ClerkMock = jest.fn(() => {
  return 'clerkClient';
});
jest.mock('@clerk/clerk-sdk-node', () => {
  return { Clerk: ClerkMock };
});

import { clerkClient } from './clerk';

describe('clerk', () => {
  afterAll(() => {
    jest.resetModules();
  });

  test('initializes clerk with constants', () => {
    expect(ClerkMock.mock.calls).toMatchSnapshot();
    expect(clerkClient).toEqual('clerkClient');
  });
});
