import { expectTypeOf } from 'expect-type';
import type { NextMiddleware } from 'next/server';

import type { WithAuthOptions } from '../types';
import { withClerkMiddleware } from '../withClerkMiddleware';

describe('withClerkMiddleware', () => {
  describe('Type tests', () => {
    describe('WithAuthOptions', () => {
      it('is the options argument for withClerkMiddleware', () => {
        () => {
          withClerkMiddleware({} as NextMiddleware, {} as WithAuthOptions);
        };
      });

      it('can receive the appropriate keys', () => {
        expectTypeOf({ publishableKey: '', secretKey: '' }).toMatchTypeOf<WithAuthOptions>();
        expectTypeOf({ frontendApi: '', secretKey: '' }).toMatchTypeOf<WithAuthOptions>();
        expectTypeOf({ publishableKey: '', apiKey: '' }).toMatchTypeOf<WithAuthOptions>();
        expectTypeOf({ frontendApi: '', apiKey: '' }).toMatchTypeOf<WithAuthOptions>();
      });

      describe('Multi domain', () => {
        const defaultProps = { publishableKey: '', secretKey: '' };

        it('proxyUrl (primary app)', () => {
          expectTypeOf({ ...defaultProps, proxyUrl: 'test' }).toMatchTypeOf<WithAuthOptions>();
        });

        it('proxyUrl + isSatellite (satellite app)', () => {
          expectTypeOf({ ...defaultProps, proxyUrl: 'test', isSatellite: true }).toMatchTypeOf<WithAuthOptions>();
        });

        it('domain + isSatellite (satellite app)', () => {
          expectTypeOf({ ...defaultProps, domain: 'test', isSatellite: true }).toMatchTypeOf<WithAuthOptions>();
        });

        it('only domain is not allowed', () => {
          expectTypeOf({ ...defaultProps, domain: 'test' }).not.toMatchTypeOf<WithAuthOptions>();
        });

        it('only isSatellite is not allowed', () => {
          expectTypeOf({ ...defaultProps, isSatellite: true }).not.toMatchTypeOf<WithAuthOptions>();
        });

        it('proxyUrl + domain is not allowed', () => {
          expectTypeOf({ ...defaultProps, proxyUrl: 'test', domain: 'test' }).not.toMatchTypeOf<WithAuthOptions>();
        });

        it('proxyUrl + domain + isSatellite is not allowed', () => {
          expectTypeOf({
            ...defaultProps,
            proxyUrl: 'test',
            domain: 'test',
            isSatellite: true,
          }).not.toMatchTypeOf<WithAuthOptions>();
        });
      });
    });
  });
});
