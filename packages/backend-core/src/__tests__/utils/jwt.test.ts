import { checkClaims } from '../../util/jwt';
import { JWTPayload } from '../../util/types';

test('check jwt claims with no issuer', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
  }

  expect(() => checkClaims(dummyClaims)).toThrow(`Issuer is invalid: ${dummyClaims.iss}`)
})

test('check jwt claims with invalid issuer', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'invalid-issuer',
  }

  expect(() => checkClaims(dummyClaims)).toThrow(`Issuer is invalid: ${dummyClaims.iss}`)
})

test('check jwt claims with valid issuer', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
  }

  expect(() => checkClaims(dummyClaims)).not.toThrow()
})

test('check jwt claims with invalid azp', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
    azp: 'invalid-azp',
  }
  const authorizedParties: string[] = ['valid-azp', 'another-valid-azp']

  expect(() => checkClaims(dummyClaims, authorizedParties)).toThrow(`Authorized party is invalid: ${dummyClaims.azp}`)
})

test('check jwt claims with no azp and no authorized parties', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
  }

  expect(() => checkClaims(dummyClaims)).not.toThrow()
})

test('check jwt claims with no azp and provided authorized parties', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
  }
  const authorizedParties: string[] = ['valid-azp', 'another-valid-azp']

  expect(() => checkClaims(dummyClaims, authorizedParties)).not.toThrow()
})

test('check jwt claims with azp and no authorized parties', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
    azp: 'random-azp',
  }

  expect(() => checkClaims(dummyClaims)).not.toThrow()
})

test('check jwt claims with no azp and provided authorized parties', () => {
  const dummyClaims: JWTPayload = {
    sub: 'subject',
    exp: 1643374283,
    iss: 'https://clerk.happy.path',
    azp: 'valid-azp',
  }
  const authorizedParties: string[] = ['a-valid-azp', 'valid-azp', 'another-valid-azp']

  expect(() => checkClaims(dummyClaims, authorizedParties)).not.toThrow()
})
