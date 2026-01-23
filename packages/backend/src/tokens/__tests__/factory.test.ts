import { describe, expect, it } from 'vitest';

import type { ApiClient } from '../../api';
import { createAuthenticateRequest } from '../factory';

const TEST_PK = 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA';

describe('createAuthenticateRequest({ options, apiClient })', () => {
  it('fallbacks to build-time options', async () => {
    const buildTimeOptions = {
      secretKey: 'sk',
      jwtKey: 'jwtKey',
      apiUrl: 'apiUrl',
      apiVersion: 'apiVersion',
      proxyUrl: 'proxyUrl',
      publishableKey: TEST_PK,
      audience: 'domain',
    };

    const { authenticateRequest } = createAuthenticateRequest({
      options: buildTimeOptions,
      apiClient: {} as ApiClient,
    });

    const requestState = await authenticateRequest(new Request('http://example.com/'));
    expect(requestState.toAuth()?.debug()).toMatchObject(buildTimeOptions);
  });

  it('overrides build-time options with runtime options', async () => {
    const buildTimeOptions = {
      secretKey: 'sk',
      jwtKey: 'jwtKey',
      apiUrl: 'apiUrl',
      apiVersion: 'apiVersion',
      proxyUrl: 'proxyUrl',
      publishableKey: TEST_PK,
      audience: 'domain',
    };

    const { authenticateRequest } = createAuthenticateRequest({
      options: buildTimeOptions,
      apiClient: {} as ApiClient,
    });

    const overrides = {
      secretKey: 'r-sk',
      publishableKey: TEST_PK,
    };
    const requestState = await authenticateRequest(new Request('http://example.com/'), {
      ...overrides,
    });
    expect(requestState.toAuth()?.debug()).toMatchObject({
      ...buildTimeOptions,
      ...overrides,
    });
  });

  it('ignore runtime apiUrl and apiVersion options', async () => {
    const buildTimeOptions = {
      secretKey: 'sk',
      jwtKey: 'jwtKey',
      apiUrl: 'apiUrl',
      apiVersion: 'apiVersion',
      proxyUrl: 'proxyUrl',
      publishableKey: TEST_PK,
      audience: 'domain',
    };

    const { authenticateRequest } = createAuthenticateRequest({
      options: buildTimeOptions,
      apiClient: {} as ApiClient,
    });

    const requestState = await authenticateRequest(new Request('http://example.com/'), {
      apiUrl: 'r-apiUrl',
      apiVersion: 'r-apiVersion',
    });
    expect(requestState.toAuth()?.debug()).toMatchObject(buildTimeOptions);
  });
});
