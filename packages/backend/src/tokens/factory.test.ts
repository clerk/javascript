import type QUnit from 'qunit';

import type { ApiClient } from '../api';
import { createAuthenticateRequest } from './factory';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('createAuthenticateRequest({ options, apiClient })', hooks => {
    let fakeAuthenticateRequest;
    hooks.afterEach(() => {
      fakeAuthenticateRequest?.restore();
    });

    test('fallbacks to build-time options', async assert => {
      const buildTimeOptions = {
        secretKey: 'sk',
        jwtKey: 'jwtKey',
        apiUrl: 'apiUrl',
        apiVersion: 'apiVersion',
        proxyUrl: 'proxyUrl',
        publishableKey: 'pk',
        isSatellite: false,
        domain: 'domain',
        audience: 'domain',
      };

      const { authenticateRequest } = createAuthenticateRequest({
        options: buildTimeOptions,
        apiClient: {} as ApiClient,
      });

      const requestState = await authenticateRequest({ request: new Request('http://example.com/') });
      assert.propContains(requestState.toAuth()?.debug(), buildTimeOptions);
    });

    test('overrides build-time options with runtime options', async assert => {
      const buildTimeOptions = {
        secretKey: 'sk',
        jwtKey: 'jwtKey',
        apiUrl: 'apiUrl',
        apiVersion: 'apiVersion',
        proxyUrl: 'proxyUrl',
        publishableKey: 'pk',
        isSatellite: false,
        domain: 'domain',
        audience: 'domain',
      };

      const { authenticateRequest } = createAuthenticateRequest({
        options: buildTimeOptions,
        apiClient: {} as ApiClient,
      });

      const overrides = {
        secretKey: 'r-sk',
        publishableKey: 'r-pk',
      };
      const requestState = await authenticateRequest({
        request: new Request('http://example.com/'),
        ...overrides,
      });
      assert.propContains(requestState.toAuth()?.debug(), {
        ...buildTimeOptions,
        ...overrides,
      });
    });

    test('ignore runtime apiUrl and apiVersion options', async assert => {
      const buildTimeOptions = {
        secretKey: 'sk',
        jwtKey: 'jwtKey',
        apiUrl: 'apiUrl',
        apiVersion: 'apiVersion',
        proxyUrl: 'proxyUrl',
        publishableKey: 'pk',
        isSatellite: false,
        domain: 'domain',
        audience: 'domain',
      };

      const { authenticateRequest } = createAuthenticateRequest({
        options: buildTimeOptions,
        apiClient: {} as ApiClient,
      });

      const requestState = await authenticateRequest({
        request: new Request('http://example.com/'),
        // @ts-expect-error is used to check runtime code
        apiUrl: 'r-apiUrl',
        apiVersion: 'r-apiVersion',
      });
      assert.propContains(requestState.toAuth()?.debug(), buildTimeOptions);
    });
  });
};
