import { constants } from '../constants';

type ApiResponse<T> = { data: T | null; errors: null | any[] };
type SuccessApiResponse<T> = { data: T; errors: null };
type ErrorApiResponse = { data: null; errors: any[]; clerkTraceId: string; status: number; statusText: string };
export function assertResponse<T>(assert: Assert, resp: ApiResponse<T>): asserts resp is SuccessApiResponse<T> {
  assert.equal(resp.errors, null);
}
export function assertErrorResponse<T>(assert: Assert, resp: ApiResponse<T>): asserts resp is ErrorApiResponse {
  assert.notEqual(resp.errors, null);
}

export function jsonOk(body: unknown, status = 200) {
  // Mock response object that satisfies the window.Response interface
  const mockResponse = {
    ok: true,
    status,
    statusText: status.toString(),
    headers: { get: mockHeadersGet },
    json() {
      return Promise.resolve(body);
    },
  };

  return Promise.resolve(mockResponse);
}

export function jsonPaginatedOk(body: unknown[], total_count: number, status = 200) {
  // Mock response object that satisfies the window.Response interface
  const mockResponse = {
    ok: true,
    status,
    statusText: status.toString(),
    headers: { get: mockHeadersGet },
    json() {
      return Promise.resolve({
        data: body,
        total_count,
      });
    },
  };

  return Promise.resolve(mockResponse);
}

export function jsonNotOk(body: unknown) {
  // Mock response object that satisfies the window.Response interface
  const mockResponse = {
    ok: false,
    status: 422,
    statusText: 422,
    headers: { get: mockHeadersGet },
    json() {
      return Promise.resolve(body);
    },
  };

  return Promise.resolve(mockResponse);
}

export function jsonError(body: unknown, status = 500) {
  // Mock response object that satisfies the window.Response interface
  const mockResponse = {
    ok: false,
    status,
    statusText: status.toString(),
    headers: { get: mockHeadersGet },
    json() {
      return Promise.resolve(body);
    },
  };

  return Promise.resolve(mockResponse);
}

const mockHeadersGet = (key: string) => {
  if (key === constants.Headers.ContentType) {
    return constants.ContentTypes.Json;
  }

  if (key === 'cf-ray') {
    return 'mock_cf_ray';
  }

  return null;
};

// used instead of the explicitly invoking assert.ok to avoid
// type casting the data param
export function assertOk<T = string>(assert: Assert, data: unknown): asserts data is T {
  assert.ok(data);
}
