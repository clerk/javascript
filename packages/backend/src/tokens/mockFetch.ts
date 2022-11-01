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
