import type QUnit from 'qunit';
import sinon from 'sinon';

// @ts-ignore
import userJson from '../../fixtures/user.json';
import runtime from '../../runtime';
import { jsonError, jsonNotOk, jsonOk, jsonPaginatedOk } from '../../util/testUtils';
import { createBackendApiClient } from '../factory';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('api.client', hooks => {
    const apiClient = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      secretKey: 'deadbeef',
    });

    let fakeFetch;

    hooks.afterEach(() => {
      fakeFetch?.restore();
    });

    test('executes a successful backend API request for a single resource and parses the response', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk(userJson));

      const response = await apiClient.users.getUser('user_deadbeef');

      assert.equal(response.firstName, 'John');
      assert.equal(response.lastName, 'Doe');
      assert.equal(response.emailAddresses[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(response.phoneNumbers[0].phoneNumber, '+311-555-2368');
      assert.equal(response.externalAccounts[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(response.publicMetadata.zodiac_sign, 'leo');

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users/user_deadbeef', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'User-Agent': '@clerk/backend@0.0.0-test',
          },
        }),
      );
    });

    test('executes a successful backend API request for a list of resources and parses the response', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk([userJson]));

      const response = await apiClient.users.getUserList({ offset: 2, limit: 5 });

      assert.equal(response[0].firstName, 'John');
      assert.equal(response[0].lastName, 'Doe');
      assert.equal(response[0].emailAddresses[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(response[0].phoneNumbers[0].phoneNumber, '+311-555-2368');
      assert.equal(response[0].externalAccounts[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(response[0].publicMetadata.zodiac_sign, 'leo');

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users?offset=2&limit=5', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'User-Agent': '@clerk/backend@0.0.0-test',
          },
        }),
      );
    });

    test('executes a successful backend API request for a paginated response', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonPaginatedOk([userJson], 3));

      const response = await apiClient.users.getUserList({ offset: 2, limit: 5 });

      assert.equal(response[0].firstName, 'John');
      assert.equal(response[0].lastName, 'Doe');
      assert.equal(response[0].emailAddresses[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(response[0].phoneNumbers[0].phoneNumber, '+311-555-2368');
      assert.equal(response[0].externalAccounts[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(response[0].publicMetadata.zodiac_sign, 'leo');
      // payload.length is different from response total_count to check that totalCount use the total_count from response
      assert.equal(response.totalCount, 3);

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users?offset=2&limit=5', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'User-Agent': '@clerk/backend@0.0.0-test',
          },
        }),
      );
    });

    test('executes a successful backend API request to create a new resource', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk(userJson));

      const response = await apiClient.users.createUser({
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: {
          star_sign: 'Leon',
        },
      });

      assert.equal(response.firstName, 'John');

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'User-Agent': '@clerk/backend@0.0.0-test',
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
      const mockErrorPayload = {
        code: 'whatever_error',
        message: 'whatever error',
        long_message: 'some long message',
        meta: { param_name: 'some param' },
      };
      const traceId = 'trace_id_123';
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonNotOk({ errors: [mockErrorPayload], clerk_trace_id: traceId }));

      const errResponse = await apiClient.users.getUser('user_deadbeef').catch(err => err);

      assert.equal(errResponse.clerkTraceId, traceId);
      assert.equal(errResponse.status, 422);
      assert.equal(errResponse.errors[0].code, 'whatever_error');
      assert.equal(errResponse.errors[0].message, 'whatever error');
      assert.equal(errResponse.errors[0].longMessage, 'some long message');
      assert.equal(errResponse.errors[0].meta.paramName, 'some param');

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users/user_deadbeef', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'User-Agent': '@clerk/backend@0.0.0-test',
          },
        }),
      );
    });

    test('executes a failed backend API request and include cf ray id when trace not present', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonError({ errors: [] }));

      const errResponse = await apiClient.users.getUser('user_deadbeef').catch(err => err);

      assert.equal(errResponse.status, 500);
      assert.equal(errResponse.clerkTraceId, 'mock_cf_ray');

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/users/user_deadbeef', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'User-Agent': '@clerk/backend@0.0.0-test',
          },
        }),
      );
    });

    test('executes a successful backend API request to delete a domain', async assert => {
      const domainId = 'dmn_123';
      const fakeResponse = {
        object: 'domain',
        id: domainId,
        deleted: true,
      };

      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk(fakeResponse, 204));

      await apiClient.domains.deleteDomain(domainId);

      assert.ok(
        fakeFetch.calledOnceWith(`https://api.clerk.test/v1/domains/${domainId}`, {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer deadbeef',
            'Content-Type': 'application/json',
            'User-Agent': '@clerk/backend@0.0.0-test',
          },
        }),
      );
    });
  });
};
