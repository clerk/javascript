export const mockJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yNzh0MTNOUllpRTJsamhsZVJvRVp4YnVGUXQiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLnJlZ3VsYXIuc2xvdGgtOTEubGNsLmRldiIsImV4cCI6MTY2NjEwMDAwNSwiaWF0IjoxNjY2MDk5OTQ1LCJpc3MiOiJodHRwczovL2NsZXJrLnJlZ3VsYXIuc2xvdGgtOTEubGNsLmRldiIsImp0aSI6IjVjOGU3MTMzNDkxYWVhMzYwMzc3IiwibmJmIjoxNjY2MDk5OTM1LCJzaWQiOiJzZXNzXzJHSkhta0ZWRXNmYzNoYUJKdkNpQlJvZEV2QSIsInN1YiI6InVzZXJfMjc5RUZCSjRGODFCUndkcFJtNWRUd2tXREhFIn0.St4FqFRG0l4XlGhCurBSfXX8yBzusekOIJWEjh0Gm3xTXiZSBk5pOO4Xk3CtN1W0c3rEcqXfSptgVTmi4T39djo1GhgVQg6nrz1-UMvkyL5fkNqIFsRT99PAym5xu5Zx_JoBk-XNbouyAhAnTygdqmZCFN-XHVTyrI1pe2m26k47d2xkKOoioiKQ7Ibi9HMjAbcfAqvsgFk0SYvDLcW_AOk9-fU_r-BzOOByr3ESjKdrlV98aTbQ-po2mzBZIwbXsaSLaTnvozYTldJM6E4-56PhsO_pbTMLeEGYfcs2BFFHZ05HYQsLKVcQ71NKiyyUa8QdD2p_EDpRihoGFZxalA';

export const mockJwtHeader = {
  alg: 'RS256',
  kid: 'ins_278t13NRYiE2ljhleRoEZxbuFQt',
  typ: 'JWT',
};

export const mockJwtPayload = {
  azp: 'https://accounts.regular.sloth-91.lcl.dev',
  exp: 1666100005,
  iat: 1666099945,
  iss: 'https://clerk.regular.sloth-91.lcl.dev',
  jti: '5c8e7133491aea360377',
  nbf: 1666099935,
  sid: 'sess_2GJHmkFVEsfc3haBJvCiBRodEvA',
  sub: 'user_279EFBJ4F81BRwdpRm5dTwkWDHE',
};

export const mockRsaJwkKid = 'ins_278t13NRYiE2ljhleRoEZxbuFQt';

export const mockRsaJwk = {
  alg: 'RS256',
  e: 'AQAB',
  kid: mockRsaJwkKid,
  kty: 'RSA',
  n: 'mrofzyr1qC1KL3Z286jj-y1d0borfCEpK0YaboaBMJITvyipX70_C47vHuWao6-O21gHWhuPA1O_EyPG__5OexTbVjTIy2Jv8ZCuW1CL5ZKd_lZB_kEtTTH9abkgXJnRsd2sZk0pJ3ufYtPnxITaMJBdGMQrzpf3YSijelsQsHYUKW5JfhizHlI84J7MnRQawteJl_Eji6n8PJfyAOOh1H_y9Cm9u1JYno2arneJFkznzwOXLuquHiSubq2MxHQYC8K8p9sOecRWq2EbkxtBvyTEYo--DVBFbfw1vm-7tA5TQqbMR4HzumH_pTBq9GmCSacZ_fDK71DCW9z9nPqdMQ',
  use: 'sig',
};

// export const mockEcJwk = {
//   crv: 'P-256',
//   d: 'l8JrXagEZUbRd908vDnTjKPdYPrr3V8ZQ8EtzieUxt8',
//   kid: 'ins_42_es256',
//   kty: 'EC',
//   use: 'sig',
//   x: '6PzW5LsKpsgbq568WqKmQ6bthPknDBZG7SinCv-Ic44',
//   y: 'Ac3ZZAhAr8z0Bl_6C2pNh7Vg6Tc3OfeYsdIefBTClH8',
// };

export const mockJwks = {
  keys: [mockRsaJwk],
};
