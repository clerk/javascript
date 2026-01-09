import { describe, expect, test, vi } from 'vitest';

import { TokenVerificationErrorReason } from '../../errors';
import { decodeJwt } from '../../jwt/verifyJwt';
import { authenticateRequest } from '../request';
import { verifyToken } from '../verify';

vi.mock('../verify', () => ({
  verifyToken: vi.fn(),
  verifyMachineAuthToken: vi.fn(),
}));

vi.mock('../../jwt/verifyJwt', () => ({
  decodeJwt: vi.fn(),
}));

describe('authenticateRequest with cookie token', () => {
  test('throws TokenMissingAzp when azp claim is missing', async () => {
    const payload = {
      sub: 'user_123',
      sid: 'sess_123',
      iat: 1234567891,
      exp: 1234567991,
      // azp is missing
    };

    // Mock verifyToken to return a payload without azp
    vi.mocked(verifyToken).mockResolvedValue({
      data: payload as any,
      errors: undefined,
    });

    // Mock decodeJwt to return the same payload
    vi.mocked(decodeJwt).mockReturnValue({
      data: { payload } as any,
      errors: undefined,
    });

    const request = new Request('http://localhost:3000', {
      headers: {
        cookie: '__session=mock_token; __client_uat=1234567890',
      },
    });

    const options = {
      publishableKey: 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA',
      secretKey: 'sk_live_deadbeef',
    };

    const result = await authenticateRequest(request, options);

    expect(result.status).toBe('signed-out');
    // @ts-expect-error - reason is only available on signed-out state
    expect(result.reason).toBe(TokenVerificationErrorReason.TokenMissingAzp);
    // @ts-expect-error - message is only available on signed-out state
    expect(result.message).toBe(
      'Session tokens from cookies must have an azp claim. (reason=token-missing-azp, token-carrier=cookie)',
    );
  });

  test('succeeds when azp claim is present', async () => {
    const payload = {
      sub: 'user_123',
      sid: 'sess_123',
      iat: 1234567891,
      exp: 1234567991,
      azp: 'http://localhost:3000',
    };

    // Mock verifyToken to return a payload with azp
    vi.mocked(verifyToken).mockResolvedValue({
      data: payload as any,
      errors: undefined,
    });

    // Mock decodeJwt to return the same payload
    vi.mocked(decodeJwt).mockReturnValue({
      data: { payload } as any,
      errors: undefined,
    });

    const request = new Request('http://localhost:3000', {
      headers: {
        cookie: '__session=mock_token; __client_uat=1234567890',
      },
    });

    const options = {
      publishableKey: 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA',
      secretKey: 'sk_live_deadbeef',
    };

    const result = await authenticateRequest(request, options);
    expect(result.isSignedIn).toBe(true);
  });
});

describe('authenticateRequest with header token', () => {
  test('succeeds when azp claim is missing', async () => {
    const payload = {
      sub: 'user_123',
      sid: 'sess_123',
      iat: 1234567891,
      exp: 1234567991,
      // azp is missing
    };

    // Mock verifyToken to return a payload without azp
    vi.mocked(verifyToken).mockResolvedValue({
      data: payload as any,
      errors: undefined,
    });

    // Mock decodeJwt to return the same payload
    vi.mocked(decodeJwt).mockReturnValue({
      data: { payload } as any,
      errors: undefined,
    });

    const request = new Request('http://localhost:3000', {
      headers: {
        authorization: 'Bearer mock_token',
      },
    });

    const options = {
      publishableKey: 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA',
      secretKey: 'sk_live_deadbeef',
    };

    const result = await authenticateRequest(request, options);
    expect(result.isSignedIn).toBe(true);
  });
});
