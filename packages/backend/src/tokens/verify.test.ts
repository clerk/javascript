import nock from 'nock';

import { mockJwks, mockJwt, mockJwtPayload } from './fixtures';
import { verifyToken } from './verify';

describe('verifySessionToken(token, options)', () => {
  const RealDate = Date;

  beforeAll(() => {
    nock.disableNetConnect();
  });
  afterAll(() => {
    nock.enableNetConnect();
  });
  beforeEach(() => {
    // Notice: The modern fake timers of Jest can't be used as crypto uses timers under the hood.
    //
    // So instead of
    // jest.useFakeTimers('modern');
    // jest.setSystemTime(new Date(...));
    //
    // we just mock Date.now().
    global.Date.now = jest.fn(() => new Date(1666099945000).getTime());

    nock('https://api.clerk.test').get('/v1/jwks').once().reply(200, mockJwks);
  });
  afterEach(() => {
    global.Date = RealDate;
    nock.cleanAll();
  });

  it('verifies the provided session JWT', async () => {
    const payload = await verifyToken(mockJwt, {
      apiUrl: 'https://api.clerk.test',
      authorizedParties: ['https://accounts.regular.sloth-91.lcl.dev'],
      issuer: 'https://clerk.regular.sloth-91.lcl.dev',
    });

    expect(payload).toEqual(mockJwtPayload);
  });

  it.todo('verified the provided JWT template');

  it('throws an error when the verification fails', async () => {
    await expect(
      verifyToken(mockJwt, {
        apiUrl: 'https://api.clerk.test',
        issuer: 'whatever',
      }),
    ).rejects.toThrow('Invalid JWT issuer claim (iss) "https://clerk.regular.sloth-91.lcl.dev". Expected "whatever".');
  });
});
