import type QUnit from 'qunit';
import sinon from 'sinon';

import { redirect } from './redirect';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('redirect(redirectAdapter)', () => {
    const url = 'http://current.url:3000/path?q=1#hash';
    const encodedUrl = 'http%3A%2F%2Fcurrent.url%3A3000%2Fpath%3Fq%3D1%23hash';

    test('exposes redirectToSignIn / redirectToSignUp', assert => {
      const helpers = redirect(sinon.spy());
      assert.propEqual(Object.keys(helpers).sort(), ['redirectToSignIn', 'redirectToSignUp']);
    });

    test('returns hash based url with signInUrl as relative path', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = redirect(redirectAdapterSpy);

      const result = redirectToSignIn({ signInUrl: '/sign-in', url });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://current.url:3000/sign-in#/?redirect_url=${encodedUrl}`));
    });

    test('returns hash based url with signInUrl as absolute path', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignIn } = redirect(redirectAdapterSpy);

      const result = redirectToSignIn({ signInUrl: 'http://signin.url:3001/sign-in', url });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://signin.url:3001/sign-in#/?redirect_url=${encodedUrl}`));
    });

    test('returns hash based url with signUpUrl as relative path', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = redirect(redirectAdapterSpy);

      const result = redirectToSignUp({ signUpUrl: '/sign-up', url });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://current.url:3000/sign-up#/?redirect_url=${encodedUrl}`));
    });

    test('returns hash based url with signUpUrl as absolute path', assert => {
      const redirectAdapterSpy = sinon.spy(_url => 'redirectAdapterValue');
      const { redirectToSignUp } = redirect(redirectAdapterSpy);

      const result = redirectToSignUp({ signUpUrl: 'http://signup.url:3001/sign-up', url });
      assert.equal(result, 'redirectAdapterValue');
      assert.ok(redirectAdapterSpy.calledWith(`http://signup.url:3001/sign-up#/?redirect_url=${encodedUrl}`));
    });
  });
};
