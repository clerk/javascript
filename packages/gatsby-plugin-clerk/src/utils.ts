import { noFrontendApiError } from './errors';

export function assertFrontendApi(fapi: any): asserts fapi is string {
  if (!fapi || typeof fapi !== 'string') {
    throw new Error(noFrontendApiError);
  }
}
