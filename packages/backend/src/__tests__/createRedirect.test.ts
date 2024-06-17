import type QUnit from 'qunit';
import sinon from 'sinon';

import { createRedirect } from '../createRedirect';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('redirect(redirectAdapter)', () => {
    const returnBackUrl = 'http://current.url:3000/path?q=1#hash';
    const encodedUrl = 'http%3A%2F%2Fcurrent.url%3A3000%2Fpath%3Fq%3D1%23hash';

    test('exposes redirectToSignIn / redirectToSignUp', assert => {
      const helpers = createRedirect({
        redirectAdapter: sinon.spy(),
        publishableKey: '',
        baseUrl: 'http://www.clerk.com',
      });
      assert.propEqual(Object.keys(helpers).sort(), ['redirectToSignIn', 'redirectToSignUp']);
    });

    test('returns path based url with signInUrl as absolute path and returnBackUrl missing', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        signInUrl: 'http://signin.url:3001/sign-in',
        signUpUrl: 'http://signin.url:3001/sign-up',
        publishableKey: '',
      });

      const result = redirectToSignIn();
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://signin.url:3001/sign-in`));
    });

    test('returns path based url with signInUrl as relative path', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        baseUrl: 'http://current.url:3000',
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
        publishableKey: '',
      });

      const result = redirectToSignIn({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://current.url:3000/sign-in?redirect_url=${encodedUrl}`));
    });

    test('returns path based url with signInUrl as absolute path', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signInUrl: 'http://signin.url:3001/sign-in',
        signUpUrl: 'http://signin.url:3001/sign-up',
        publishableKey: '',
        baseUrl: 'http://www.clerk.com',
      });

      const result = redirectToSignIn({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://signin.url:3001/sign-in?redirect_url=${encodedUrl}`));
    });

    test('raises error without signInUrl and publishableKey in redirectToSignIn', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signUpUrl: 'http://signin.url:3001/sign-up',
        baseUrl: 'http://www.clerk.com',
      } as any);

      assert.raises(
        () => redirectToSignIn({ returnBackUrl }),
        new Error(
          '@clerk/backend: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.',
        ),
      );
    });

    test('returns path based url with development publishableKey but without signInUrl to redirectToSignIn', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
      });

      const result = redirectToSignIn({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(
        redirectAdapterSpy.calledWith(
          `https://accounts.included.katydid-92.lcl.dev/sign-in?redirect_url=${encodedUrl}`,
        ),
      );
    });

    test('returns path based url with production publishableKey but without signInUrl to redirectToSignIn', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
      });

      const result = redirectToSignIn({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`https://accounts.example.com/sign-in?redirect_url=${encodedUrl}`));
    });

    test('returns path based url with development (kima) publishableKey but without signInUrl to redirectToSignIn', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_aW5jbHVkZWQua2F0eWRpZC05Mi5jbGVyay5hY2NvdW50cy5kZXYk',
      });

      const result = redirectToSignIn({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(
        redirectAdapterSpy.calledWith(`https://included.katydid-92.accounts.dev/sign-in?redirect_url=${encodedUrl}`),
      );
    });

    test('returns path based url with signUpUrl as absolute path and returnBackUrl missing', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signUpUrl: 'http://signin.url:3001/sign-up',
        baseUrl: 'http://www.clerk.com',
        publishableKey: '',
      });

      const result = redirectToSignUp();
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://signin.url:3001/sign-up`));
    });

    test('returns path based url with signUpUrl as relative path', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signUpUrl: '/sign-up',
        baseUrl: 'http://current.url:3000',
        publishableKey: '',
      });

      const result = redirectToSignUp({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://current.url:3000/sign-up?redirect_url=${encodedUrl}`));
    });

    test('returns path based url with signUpUrl as absolute path', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        signUpUrl: 'http://signup.url:3001/sign-up',
        baseUrl: 'http://www.clerk.com',
        publishableKey: '',
      });

      const result = redirectToSignUp({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://signup.url:3001/sign-up?redirect_url=${encodedUrl}`));
    });

    test('raises error without signUpUrl and publishableKey in redirectToSignUp', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        redirectAdapter: redirectAdapterSpy,
        publishableKey: '',
        baseUrl: 'http://www.clerk.com',
      });

      assert.raises(
        () => redirectToSignUp({ returnBackUrl }),
        new Error(
          '@clerk/backend: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.',
        ),
      );
    });

    test('returns path based url with development publishableKey but without signUpUrl to redirectToSignUp', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
      });

      const result = redirectToSignUp({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(
        redirectAdapterSpy.calledWith(
          `https://accounts.included.katydid-92.lcl.dev/sign-up?redirect_url=${encodedUrl}`,
        ),
      );
    });

    test('returns path based url with production publishableKey but without signUpUrl to redirectToSignUp', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
      });

      const result = redirectToSignUp({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`https://accounts.example.com/sign-up?redirect_url=${encodedUrl}`));
    });

    test('returns path based url with development (kima) publishableKey but without signUpUrl to redirectToSignUp', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_aW5jbHVkZWQua2F0eWRpZC05Mi5jbGVyay5hY2NvdW50cy5kZXYk',
      });

      const result = redirectToSignUp({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(
        redirectAdapterSpy.calledWith(`https://included.katydid-92.accounts.dev/sign-up?redirect_url=${encodedUrl}`),
      );
    });

    test('returns path based url with development (kima) publishableKey (with staging Clerk) but without signUpUrl to redirectToSignUp', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_aW5jbHVkZWQua2F0eWRpZC05Mi5jbGVyay5hY2NvdW50c3N0YWdlLmRldiQ',
      });

      const result = redirectToSignUp({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(
        redirectAdapterSpy.calledWith(
          `https://included.katydid-92.accountsstage.dev/sign-up?redirect_url=${encodedUrl}`,
        ),
      );
    });

    test('passed dev browser when cross-origin redirect in dev', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = createRedirect({
        baseUrl: 'http://www.clerk.com',
        devBrowserToken: 'deadbeef',
        redirectAdapter: redirectAdapterSpy,
        publishableKey: 'pk_test_aW5jbHVkZWQua2F0eWRpZC05Mi5jbGVyay5hY2NvdW50cy5kZXYk',
      });

      const result = redirectToSignUp({ returnBackUrl });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(
        redirectAdapterSpy.calledWith(
          `https://included.katydid-92.accounts.dev/sign-up?redirect_url=${encodedUrl}&__clerk_db_jwt=deadbeef`,
        ),
      );
    });
  });
};
