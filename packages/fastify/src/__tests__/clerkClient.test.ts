const createClerkClientMock = jest.fn(() => {
  return 'clerkClient';
});

jest.mock('@clerk/backend', () => {
  return {
    ...jest.requireActual('@clerk/backend'),
    createClerkClient: createClerkClientMock,
  };
});

import { clerkClient } from '../clerkClient';

describe('clerk', () => {
  afterAll(() => {
    jest.resetModules();
  });

  test('initializes clerk with constants', () => {
    expect(createClerkClientMock.mock.calls).toMatchSnapshot();
    expect(clerkClient).toEqual('clerkClient');
  });
});
