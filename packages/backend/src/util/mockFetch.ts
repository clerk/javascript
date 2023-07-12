import { constants } from '../constants';

export function jsonOk(body: unknown, status = 200) {
  // Mock response object that satisfies the window.Response interface
  const mockResponse = {
    ok: true,
    status,
    headers: { get: mockHeadersGet },
    json() {
      return Promise.resolve(body);
    },
  };

  return Promise.resolve(mockResponse);
}

export function jsonNotOk(body: unknown) {
  // Mock response object that satisfies the window.Response interface
  const mockResponse = {
    ok: false,
    status: 422,
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
    status: status,
    headers: { get: mockHeadersGet },
    json() {
      return Promise.resolve(body);
    },
  };

  return Promise.resolve(mockResponse);
}

const mockHeadersGet = (key: string) => (key === constants.Headers.ContentType ? constants.ContentTypes.Json : null);
