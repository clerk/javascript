import { describe, expect, test } from 'vitest';

import { apiUrlFromPublishableKey } from '../apiUrlFromPublishableKey';

describe('apiUrlFromPublishableKey', () => {
  test('returns the prod API URL when given a prod publishable key', async () => {
    const apiUrl = apiUrlFromPublishableKey('pk_test_bWFueS1zZWFsLTkwLmNsZXJrLmFjY291bnRzLmRldiQ');
    expect(apiUrl).toBe('https://api.clerk.com');
  });

  test('returns the stage API URL when given a staging publishable key', async () => {
    const apiUrl = apiUrlFromPublishableKey('pk_test_aW1tdW5lLWhhd2stNjUuY2xlcmsuYWNjb3VudHNzdGFnZS5kZXYk');
    expect(apiUrl).toBe('https://api.clerkstage.dev');
  });

  test('returns the local API URL when given a local publishable key', async () => {
    const apiUrl = apiUrlFromPublishableKey('pk_test_cGF0aWVudC1nb29zZS01LmNsZXJrLmFjY291bnRzLmxjbGNsZXJrLmNvbSQ');
    expect(apiUrl).toBe('https://api.lclclerk.com');
  });

  test('returns prod API URL when given a legacy publishable key', async () => {
    const apiUrl = apiUrlFromPublishableKey('pk_test_Y2xlcmsucHlpMTcucWJqNngubGNsLmRldiQ');
    expect(apiUrl).toBe('https://api.clerk.com');
  });
});
