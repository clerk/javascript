// import nock from 'nock';

// import { mockJwks, mockRsaJwk, mockRsaJwkKid } from './fixtures';
// import { loadClerkJWKFromLocal, loadClerkJWKFromRemote } from './keys';

// describe('loadClerkJWKFromLocal(localKey)', () => {
//   it('loads the local PEM format from CLERK_JWT_KEY', () => {
//     expect(() => loadClerkJWKFromLocal()).toThrow('Missing local JWK');
//   });

//   it('loads the local PEM format from CLERK_JWT_KEY', () => {
//     expect(loadClerkJWKFromLocal('deadbeef')).toEqual({
//       e: 'AQAB',
//       kid: 'local',
//       kty: 'RSA',
//       n: '',
//     });
//   });
// });

// describe('loadClerkJWKFromRemote(options)', () => {
//   beforeAll(() => {
//     nock.disableNetConnect();
//   });
//   afterAll(() => {
//     nock.enableNetConnect();
//   });
//   afterEach(() => {
//     nock.cleanAll();
//   });

//   it('loads JWKS from Backend API when apiUrl and apiKey are provided', async () => {
//     nock('https://api.clerk.test').get('/v1/jwks').once().reply(200, mockJwks);

//     const jwk = await loadClerkJWKFromRemote({
//       apiUrl: 'https://api.clerk.test',
//       apiKey: 'deadbeef',
//       kid: mockRsaJwkKid,
//     });

//     expect(jwk).toEqual(mockRsaJwk);
//   });

//   it('loads JWKS from Frontend API when issuer is provided', async () => {
//     nock('https://accounts.inspired.puma-74.lcl.dev').get('/.well-known/jwks.json').once().reply(200, mockJwks);

//     const jwk = await loadClerkJWKFromRemote({
//       issuer: 'https://accounts.inspired.puma-74.lcl.dev',
//       kid: mockRsaJwkKid,
//     });

//     expect(jwk).toEqual(mockRsaJwk);
//   });

//   it('caches JWK by kid', async () => {
//     nock('https://api.clerk.test').get('/v1/jwks').once().reply(200, mockJwks);

//     // Fetch once from Backend API
//     expect(
//       await loadClerkJWKFromRemote({
//         apiUrl: 'https://api.clerk.test',
//         apiKey: 'deadbeef',
//         kid: mockRsaJwkKid,
//       }),
//     ).toEqual(mockRsaJwk);

//     // Fetch from cache (ttl is 1 hour by default)
//     expect(
//       await loadClerkJWKFromRemote({
//         apiUrl: 'https://api.clerk.test',
//         apiKey: 'deadbeef',
//         kid: mockRsaJwkKid,
//       }),
//     ).toEqual(mockRsaJwk);
//   });

//   it('retries five times with exponential back-off policy to fetch JWKS before it fails', async () => {
//     nock('https://api.clerk.test')
//       .get('/v1/jwks')
//       .replyWithError('something awful happened')
//       .get('/v1/jwks')
//       .times(3)
//       .reply(500, 'server error')
//       .get('/v1/jwks')
//       .times(1)
//       .reply(542);

//     await expect(
//       loadClerkJWKFromRemote({
//         apiUrl: 'https://api.clerk.test',
//         apiKey: 'deadbeef',
//         kid: 'ins_whatever',
//       }),
//     ).rejects.toThrow('Error loading Clerk JWKS from https://api.clerk.test/v1/jwks with code=542');
//   });

//   it('throws an error when JWKS can not be fetched from Backend or Frontend API', async () => {
//     // await new Promise(r => setTimeout(r, 1));
//     // @ts-expect-error
//     await expect(loadClerkJWKFromRemote({ kid: 'ins_whatever' })).rejects.toThrow(
//       'Failed to load JWKS from Clerk Backend or Frontend API',
//     );
//   });

//   it('throws an error when no JWK matches the provided kid', async () => {
//     nock('https://api.clerk.test').get('/v1/jwks').once().reply(200, mockJwks);
//     await expect(
//       loadClerkJWKFromRemote({
//         apiUrl: 'https://api.clerk.test',
//         apiKey: 'deadbeef',
//         kid: 'ins_whatever',
//       }),
//     ).rejects.toThrow("Unable to find a signing key in JWKS that matches kid='ins_whatever'");
//   });
// });
