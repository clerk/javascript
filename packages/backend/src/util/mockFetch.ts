import { constants } from '../constants';

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
