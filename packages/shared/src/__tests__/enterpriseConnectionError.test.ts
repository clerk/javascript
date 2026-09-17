import { describe, expect, it } from 'vitest';

import { ClerkAPIResponseError, isEnterpriseConnectionAmbiguousError } from '../error';

describe('isEnterpriseConnectionAmbiguousError', () => {
  it('recognizes an ambiguous connection among multiple API errors', () => {
    const error = new ClerkAPIResponseError('Invalid request', {
      status: 422,
      data: [
        { code: 'form_param_format_invalid', message: 'Invalid value' },
        { code: 'enterprise_connection_id_is_required_with_multiple_connections', message: 'Select a connection' },
      ],
    });
    expect(isEnterpriseConnectionAmbiguousError(error)).toBe(true);
  });

  it.each([null, undefined, new Error('Network unavailable'), { errors: [] }])('rejects unrelated errors %s', error => {
    expect(isEnterpriseConnectionAmbiguousError(error)).toBe(false);
  });

  it('rejects API errors that do not require connection selection', () => {
    const error = new ClerkAPIResponseError('Invalid request', {
      status: 422,
      data: [{ code: 'enterprise_sso_sign_in_connection_missing', message: 'Connection missing' }],
    });
    expect(isEnterpriseConnectionAmbiguousError(error)).toBe(false);
  });
});
