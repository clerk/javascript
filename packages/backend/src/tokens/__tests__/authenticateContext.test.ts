import type QUnit from 'qunit';
import sinon from 'sinon';

import { createCookieHeader, createJwt, mockJwtPayload, pkLive, pkTest } from '../../fixtures';
import { createAuthenticateContext } from '../authenticateContext';
import { createClerkRequest } from '../clerkRequest';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('AuthenticateContext', hooks => {
    let fakeClock;

    const nowTimestampInSec = mockJwtPayload.iat;

    const suffixedSession = createJwt({ header: {} });
    const session = createJwt();
    const sessionWithInvalidIssuer = createJwt({ payload: { iss: 'http:whatever' } });
    const newSession = createJwt({ payload: { iat: nowTimestampInSec + 60 } });
    const clientUat = '1717490192';
    const suffixedClientUat = '1717490193';

    hooks.beforeEach(() => {
      fakeClock = sinon.useFakeTimers(nowTimestampInSec * 1000);
    });

    hooks.afterEach(() => {
      fakeClock.restore();
      sinon.restore();
    });
    module('suffixedCookies', () => {
      module('use un-suffixed cookies', () => {
        test('request with un-suffixed cookies', assert => {
          const headers = new Headers({
            cookie: createCookieHeader({
              __client_uat: clientUat,
              __session: session,
            }),
          });
          const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
          const context = createAuthenticateContext(clerkRequest, {
            publishableKey: pkLive,
          });

          assert.false(context.suffixedCookies);
          assert.equal(context.sessionTokenInCookie, session);
          assert.equal(context.clientUat, clientUat);
        });

        test('request with suffixed and valid newer un-suffixed cookies - case of ClerkJS downgrade', assert => {
          const headers = new Headers({
            cookie: createCookieHeader({
              __client_uat: clientUat,
              __client_uat_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: suffixedClientUat,
              __session: newSession,
              __session_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: suffixedSession,
              __clerk_db_jwt: '__clerk_db_jwt',
              __clerk_db_jwt_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: '__clerk_db_jwt-suffixed',
            }),
          });
          const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
          const context = createAuthenticateContext(clerkRequest, {
            publishableKey: pkLive,
          });

          assert.false(context.suffixedCookies);
          assert.equal(context.sessionTokenInCookie, newSession);
          assert.equal(context.clientUat, clientUat);
          assert.equal(context.devBrowserToken, '__clerk_db_jwt');
        });

        test('request with suffixed client_uat as signed-out and un-suffixed client_uat as signed-in - case of ClerkJS downgrade', assert => {
          const headers = new Headers({
            cookie: createCookieHeader({
              __client_uat: clientUat,
              __client_uat_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: '0',
              __session: session,
              __clerk_db_jwt: '__clerk_db_jwt',
            }),
          });
          const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
          const context = createAuthenticateContext(clerkRequest, {
            publishableKey: pkTest,
          });

          assert.false(context.suffixedCookies);
          assert.equal(context.sessionTokenInCookie, session);
          assert.equal(context.clientUat, clientUat);
        });

        test('prod: request with suffixed session and signed-out suffixed client_uat', assert => {
          const headers = new Headers({
            cookie: createCookieHeader({
              __client_uat: '0',
              __client_uat_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: '0',
              __session: session,
              __session_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: suffixedSession,
            }),
          });
          const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
          const context = createAuthenticateContext(clerkRequest, {
            publishableKey: pkLive,
          });

          assert.true(context.suffixedCookies);
          assert.equal(context.sessionTokenInCookie, suffixedSession);
          assert.equal(context.clientUat, '0');
        });
      });

      module('use suffixed cookies', () => {
        test('prod: request with valid suffixed and un-suffixed cookies', assert => {
          const headers = new Headers({
            cookie: createCookieHeader({
              __client_uat: clientUat,
              __client_uat_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: suffixedClientUat,
              __session: session,
              __session_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: suffixedSession,
            }),
          });
          const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
          const context = createAuthenticateContext(clerkRequest, {
            publishableKey: pkLive,
          });
          assert.true(context.suffixedCookies);
          assert.equal(context.sessionTokenInCookie, suffixedSession);
          assert.equal(context.clientUat, suffixedClientUat);
        });

        test('prod: request with invalid issuer un-suffixed and valid suffixed cookies - case of multiple apps on same eTLD+1 domain', assert => {
          const headers = new Headers({
            cookie: createCookieHeader({
              __client_uat: clientUat,
              __client_uat_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: suffixedClientUat,
              __session: sessionWithInvalidIssuer,
              __session_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: suffixedSession,
            }),
          });
          const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
          const context = createAuthenticateContext(clerkRequest, {
            publishableKey: pkLive,
          });
          assert.true(context.suffixedCookies);
          assert.equal(context.sessionTokenInCookie, suffixedSession);
          assert.equal(context.clientUat, suffixedClientUat);
        });

        test('dev: request with invalid issuer un-suffixed and valid multiple suffixed cookies - case of multiple apps on localhost', assert => {
          const blahSession = createJwt({ payload: { iss: 'http://blah' } });
          const fooSession = createJwt({ payload: { iss: 'http://foo' } });
          const headers = new Headers({
            cookie: createCookieHeader({
              __client_uat: '0',
              __client_uat_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: '0',
              __client_uat_Y2xlcmsuYmxhaC5wdW1hLTc1LmxjbC5kZXYk: '1717490193',
              __client_uat_Y2xlcmsuZm9vLnB1bWEtNzUubGNsLmRldiQ: '1717490194',
              __session: session,
              __session_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: suffixedSession,
              __session_Y2xlcmsuYmxhaC5wdW1hLTc1LmxjbC5kZXYk: blahSession,
              __session_Y2xlcmsuZm9vLnB1bWEtNzUubGNsLmRldiQ: fooSession,
              __clerk_db_jwt: '__clerk_db_jwt',
              __clerk_db_jwt_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: '__clerk_db_jwt-suffixed',
              __clerk_db_jwt_Y2xlcmsuYmxhaC5wdW1hLTc1LmxjbC5kZXYk: '__clerk_db_jwt-suffixed-blah',
              __clerk_db_jwt_Y2xlcmsuZm9vLnB1bWEtNzUubGNsLmRldiQ: '__clerk_db_jwt-suffixed-foo',
            }),
          });
          const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
          const context = createAuthenticateContext(clerkRequest, {
            publishableKey: pkTest,
          });

          assert.true(context.suffixedCookies);
          assert.equal(context.sessionTokenInCookie, suffixedSession);
          assert.equal(context.clientUat, '0');
          assert.equal(context.devBrowserToken, '__clerk_db_jwt-suffixed');
        });

        test('dev: request with suffixed session and signed-out suffixed client_uat', assert => {
          const headers = new Headers({
            cookie: createCookieHeader({
              __client_uat: '0',
              __client_uat_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: '0',
              __session: session,
              __session_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: suffixedSession,
              __clerk_db_jwt: '__clerk_db_jwt',
              __clerk_db_jwt_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: '__clerk_db_jwt-suffixed',
            }),
          });
          const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
          const context = createAuthenticateContext(clerkRequest, {
            publishableKey: pkTest,
          });

          assert.true(context.suffixedCookies);
          assert.equal(context.sessionTokenInCookie, suffixedSession);
          assert.equal(context.clientUat, '0');
          assert.equal(context.devBrowserToken, '__clerk_db_jwt-suffixed');
        });

        test('prod: request without suffixed session and signed-out suffixed client_uat', assert => {
          const headers = new Headers({
            cookie: createCookieHeader({
              __client_uat: '0',
              __client_uat_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA: '0',
              __session: session,
            }),
          });
          const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
          const context = createAuthenticateContext(clerkRequest, {
            publishableKey: pkLive,
          });

          assert.true(context.suffixedCookies);
          assert.strictEqual(context.sessionTokenInCookie, undefined);
          assert.equal(context.clientUat, '0');
        });
      });
    });
  });
};
