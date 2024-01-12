import type QUnit from 'qunit';
import sinon from 'sinon';

import emailJson from '../fixtures/responses/email.json';
import userJson from '../fixtures/responses/user.json';
import runtime from '../runtime';
import { jsonError, jsonNotOk, jsonOk } from '../util/mockFetch';
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

      if (!payload) {
        assert.false(true, 'This assertion should never fail. We need to check for payload to make TS happy.');
        return;
      }

      assert.equal(payload.firstName, 'John');
      assert.equal(payload.lastName, 'Doe');
      assert.equal(payload.emailAddresses[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(payload.phoneNumbers[0].phoneNumber, '+311-555-2368');
      assert.equal(payload.externalAccounts[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(payload.publicMetadata.zodiac_sign, 'leo');
      // assert.equal(payload.errors, null);

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

      const payload = await apiClient.users.getUserList({ offset: 2, limit: 5 });

      if (!payload) {
        assert.false(true, 'This assertion should never fail. We need to check for payload to make TS happy.');
        return;
      }

      assert.equal(payload[0].firstName, 'John');
      assert.equal(payload[0].lastName, 'Doe');
      assert.equal(payload[0].emailAddresses[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(payload[0].phoneNumbers[0].phoneNumber, '+311-555-2368');
      assert.equal(payload[0].externalAccounts[0].emailAddress, 'john.doe@clerk.test');
      assert.equal(payload[0].publicMetadata.zodiac_sign, 'leo');
      // assert.equal(payload.errors, null);

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

    test('executes a successful backend API request for a resource that contains data (key related to pagination)', async assert => {
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk(emailJson));

      const body = {
        fromEmailName: 'foobar123',
        emailAddressId: 'test@test.dev',
        body: 'this is a test',
        subject: 'this is a test',
      };
      const requestBody =
        '{"from_email_name":"foobar123","email_address_id":"test@test.dev","body":"this is a test","subject":"this is a test"}';
      const payload = await apiClient.emails.createEmail(body);

      if (!payload) {
        assert.false(true, 'This assertion should never fail. We need to check for payload to make TS happy.');
        return;
      }
      assert.equal(JSON.stringify(payload.data), '{}');
      assert.equal(payload.id, 'ema_2PHa2N3bS7D6NPPQ5mpHEg0waZQ');

      assert.ok(
        fakeFetch.calledOnceWith('https://api.clerk.test/v1/emails', {
          method: 'POST',
          body: requestBody,
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
        meta: {
          param_name: 'whatever_param',
        },
      };
      const traceId = 'trace_id_123';
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonNotOk({ errors: [mockErrorPayload], clerk_trace_id: traceId }));

      try {
        await apiClient.users.getUser('user_deadbeef');
      } catch (e: any) {
        assert.equal(e.clerkTraceId, traceId);
        assert.equal(e.clerkError, true);
        assert.equal(e.status, 422);
        assert.equal(e.errors[0].code, 'whatever_error');
        assert.equal(e.errors[0].message, 'whatever error');
        assert.equal(e.errors[0].longMessage, 'some long message');
        assert.equal(e.errors[0].meta.paramName, 'whatever_param');
      }

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

      try {
        await apiClient.users.getUser('user_deadbeef');
      } catch (e: any) {
        assert.equal(e.clerkError, true);
        assert.equal(e.status, 500);
        assert.equal(e.clerkTraceId, 'mock_cf_ray');
      }

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
