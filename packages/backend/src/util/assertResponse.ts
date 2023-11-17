type ApiResponse<T> = { data: T | null; errors: null | any[] };
type SuccessApiResponse<T> = { data: T; errors: null };
type ErrorApiResponse = { data: null; errors: any[]; clerkTraceId: string; status: number; statusText: string };
export function assertResponse<T>(assert: Assert, resp: ApiResponse<T>): asserts resp is SuccessApiResponse<T> {
  assert.equal(resp.errors, null);
}
export function assertErrorResponse<T>(assert: Assert, resp: ApiResponse<T>): asserts resp is ErrorApiResponse {
  assert.notEqual(resp.errors, null);
}
