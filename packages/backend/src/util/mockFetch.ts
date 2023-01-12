export function jsonOk(body: unknown) {
  // Mock response object that satisfies the window.Response interface
  const mockResponse = {
    ok: true,
    status: 200,
    headers: {
      'Content-type': 'application/json',
    },
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
    headers: {
      'Content-type': 'application/json',
    },
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
    headers: {
      'Content-type': 'application/json',
    },
    json() {
      return Promise.resolve(body);
    },
  };

  return Promise.resolve(mockResponse);
}
