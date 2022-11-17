import type QUnit from 'qunit';
import sinon from 'sinon';

import userJson from '../fixtures/responses/user.json';
import runtime from '../runtime';
import { jsonNotOk, jsonOk } from '../util/mockFetch';
import { createBackendApiClient } from './factory';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('api.client', hooks => {
    const apiClient = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      apiKey: 'deadbeef',
    });

    let fakeFetch;

    hooks.afterEach(() => {
      fakeFetch?.restore();
    });

    test('executes a successful backend API request for a single resource and parses the response', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk(userJson));

      const payload = await apiClient.users.getUser('user_deadbeef');

      if (!payload.data) {
        assert.false(true, 'This assertion should never fail. We need to check for payload.data to make TS happy.');
        return;
      }

      assert.equal(payload.data.firstName, 'John');
      assert.equal(payload.data.lastName, 'Doe');
      assert.equal(payload.data.emailAddresses[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(payload.data.phoneNumbers[0].phoneNumber, '+311-555-2368');
      assert.equal(payload.data.externalAccounts[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(payload.data.publicMetadata.zodiac_sign, 'leo');
      assert.equal(payload.errors, null);

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users/user_deadbeef', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'Clerk-Backend-SDK': '@clerk/backend',
          },
        }),
      );
    });

    test('executes a successful backend API request for a list of resources and parses the response', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk([userJson]));

      const payload = await apiClient.users.getUserList({ offset: 2, limit: 5 });

      if (!payload.data) {
        assert.false(true, 'This assertion should never fail. We need to check for payload.data to make TS happy.');
        return;
      }

      assert.equal(payload.data[0].firstName, 'John');
      assert.equal(payload.data[0].lastName, 'Doe');
      assert.equal(payload.data[0].emailAddresses[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(payload.data[0].phoneNumbers[0].phoneNumber, '+311-555-2368');
      assert.equal(payload.data[0].externalAccounts[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(payload.data[0].publicMetadata.zodiac_sign, 'leo');
      assert.equal(payload.errors, null);

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users?offset=2&limit=5', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'Clerk-Backend-SDK': '@clerk/backend',
          },
        }),
      );
    });

    test('executes a successful backend API request to create a new resource', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk([userJson]));

      await apiClient.users.createUser({
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: {
          star_sign: 'Leon',
        },
      });

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'Clerk-Backend-SDK': '@clerk/backend',
          },
          body: JSON.stringify({
            first_name: 'John',
            last_name: 'Doe',
            public_metadata: {
              star_sign: 'Leon',
            },
          }),
        }),
      );
    });

    test('executes a failed backend API request and parses the error response', async assert => {
      const mockErrorPayload = { code: 'whatever_error', message: 'whatever error', meta: {} };
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonNotOk([mockErrorPayload]));

      const payload = await apiClient.users.getUser('user_deadbeef');

      assert.equal(payload.data, null);
      // @ts-expect-error
      assert.equal(payload.errors[0].code, 'whatever_error');

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users/user_deadbeef', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'Clerk-Backend-SDK': '@clerk/backend',
          },
        }),
      );
    });
  });
};
