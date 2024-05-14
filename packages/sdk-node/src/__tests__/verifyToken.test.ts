const verifyTokenMock = jest.fn();

jest.mock('@clerk/backend', () => ({
  ...jest.requireActual('@clerk/backend'),
  verifyToken: verifyTokenMock,
}));

import { createClerkClient } from '../clerkClient';

afterEach(() => {
  verifyTokenMock.mockReset();
});

describe('verifyToken', () => {
  it('correctly use the predefined options of clerkClient', async () => {
    const clerkClient = createClerkClient({
      secretKey: '123',
      jwtKey: '456',
    });

    await clerkClient.verifyToken('token');
    expect(verifyTokenMock).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({
        secretKey: '123',
        jwtKey: '456',
      }),
    );
  });

  it('correctly use the passed options in verifyToken', async () => {
    const clerkClient = createClerkClient({
      secretKey: '123',
      jwtKey: '456',
    });

    await clerkClient.verifyToken('token', {
      secretKey: '987',
    });
    expect(verifyTokenMock).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({
        secretKey: '987',
        jwtKey: '456',
      }),
    );
  });
});
