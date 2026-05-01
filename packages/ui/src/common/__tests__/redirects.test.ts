import { describe, expect, it } from 'vitest';

import { buildVerificationRedirectUrl } from '../redirects';

describe('buildVerificationRedirectUrl(routing, baseUrl)', () => {
  it('defaults to hash based routing strategy on empty routing', function () {
    expect(
      buildVerificationRedirectUrl({ ctx: { path: '', authQueryString: '' } as any, baseUrl: '', intent: 'sign-in' }),
    ).toBe('http://localhost:3000/#/verify');
  });
  it('returns the magic link redirect url for components using path based routing ', function () {
    expect(
      buildVerificationRedirectUrl({
        ctx: { routing: 'path', authQueryString: '' } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: { routing: 'path', path: '/sign-in', authQueryString: '' } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/sign-in/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/sign-in/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: 'https://accounts.clerk.com/sign-in',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/sign-in/verify?redirectUrl=https://clerk.com');
  });
  it('returns the magic link redirect url for components using hash based routing ', function () {
    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          authQueryString: '',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/#/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          path: '/sign-in',
          authQueryString: null,
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/#/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          path: '',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/#/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/#/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: 'https://accounts.clerk.com/sign-in',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/#/verify?redirectUrl=https://clerk.com');
  });
  it('returns the magic link redirect url for components using virtual routing ', function () {
    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'virtual',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: 'https://accounts.clerk.com/sign-in',
        intent: 'sign-in',
      }),
    ).toBe('https://accounts.clerk.com/sign-in#/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'virtual',
        } as any,
        baseUrl: 'https://accounts.clerk.com/sign-in',
        intent: 'sign-in',
      }),
    ).toBe('https://accounts.clerk.com/sign-in#/verify');
  });

  it('returns the magic link redirect url for components using the combined flow based on intent', function () {
    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '/sign-up',
          isCombinedFlow: true,
        } as any,
        baseUrl: '',
        intent: 'sign-up',
      }),
    ).toBe('http://localhost:3000/sign-up/create/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '/sign-in',
          isCombinedFlow: true,
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost:3000/sign-in/verify');
  });
});
