import { describe, expect, test, vi } from 'vitest';

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
  test('logs a warning when azp claim is missing but still returns signed-in', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const payload = {
      sub: 'user_123',
      sid: 'sess_123',
      iat: 1234567891,
      exp: 1234567991,
      // azp is missing
    };

    vi.mocked(verifyToken).mockResolvedValue({
      data: payload as any,
      errors: undefined,
    });

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
    expect(warnSpy).toHaveBeenCalledWith(
      'Clerk: Session token from cookie is missing the azp claim. In a future version of Clerk, this token will be considered invalid. Please contact Clerk support if you see this warning.',
    );

    warnSpy.mockRestore();
  });

  test('does not warn when azp claim is present', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const payload = {
      sub: 'user_123',
      sid: 'sess_123',
      iat: 1234567891,
      exp: 1234567991,
      azp: 'http://localhost:3000',
    };

    vi.mocked(verifyToken).mockResolvedValue({
      data: payload as any,
      errors: undefined,
    });

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
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});

describe('authenticateRequest with header token', () => {
  test('succeeds without warning when azp claim is missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const payload = {
      sub: 'user_123',
      sid: 'sess_123',
      iat: 1234567891,
      exp: 1234567991,
      // azp is missing
    };

    vi.mocked(verifyToken).mockResolvedValue({
      data: payload as any,
      errors: undefined,
    });

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
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
