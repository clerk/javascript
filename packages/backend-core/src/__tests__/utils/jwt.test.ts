import { JWTPayload } from '../../types';
import { checkClaims } from '../../util/jwt';

test('check jwt claims with no issuer', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://fake.issuer',
    sid: 'test-session-id',
    nbf: 1643374281,
    iat: 1643374280,
  };

  expect(() => checkClaims(dummyClaims)).toThrow(`Issuer is invalid: ${dummyClaims.iss}`);
});

test('check jwt claims with invalid issuer', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'invalid-issuer',
    sid: 'test-session-id',
    nbf: 1643374281,
    iat: 1643374280,
  };

  expect(() => checkClaims(dummyClaims)).toThrow(`Issuer is invalid: ${dummyClaims.iss}`);
});

test('check jwt claims with valid issuer', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
    sid: 'test-session-id',
    nbf: 1643374281,
    iat: 1643374280,
  };

  expect(() => checkClaims(dummyClaims)).not.toThrow();
});

test('check jwt claims with invalid azp', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
    sid: 'test-session-id',
    azp: 'invalid-azp',
    nbf: 1643374281,
    iat: 1643374280,
  };
  const authorizedParties: string[] = ['valid-azp', 'another-valid-azp'];

  expect(() => checkClaims(dummyClaims, authorizedParties)).toThrow(`Authorized party is invalid: ${dummyClaims.azp}`);
});

test('check jwt claims with no azp and no authorized parties', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
    sid: 'test-session-id',
    nbf: 1643374281,
    iat: 1643374280,
  };

  expect(() => checkClaims(dummyClaims)).not.toThrow();
});

test('check jwt claims with no azp and provided authorized parties', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
    sid: 'test-session-id',
    nbf: 1643374281,
    iat: 1643374280,
  };
  const authorizedParties: string[] = ['valid-azp', 'another-valid-azp'];

  expect(() => checkClaims(dummyClaims, authorizedParties)).not.toThrow();
});

test('check jwt claims with azp and no authorized parties', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
    sid: 'test-session-id',
    azp: 'random-azp',
    nbf: 1643374281,
    iat: 1643374280,
  };

  expect(() => checkClaims(dummyClaims)).not.toThrow();
});

test('check jwt claims with no azp and provided authorized parties', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
    azp: 'valid-azp',
    sid: 'test-session-id',
    nbf: 1643374281,
    iat: 1643374280,
  };

  const authorizedParties: string[] = ['a-valid-azp', 'valid-azp', 'another-valid-azp'];

  expect(() => checkClaims(dummyClaims, authorizedParties)).not.toThrow();
});
