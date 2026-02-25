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
  test('returns signed-out when azp claim is missing and request is not eligible for handshake', async () => {
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

    // No sec-fetch-dest or Accept headers, so not eligible for handshake
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
    expect(result.reason).toBe('session-token-missing-azp');
  });

  test('returns handshake when azp claim is missing and request is a document request', async () => {
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

    // sec-fetch-dest: document makes request eligible for handshake
    const request = new Request('http://localhost:3000', {
      headers: {
        cookie: '__session=mock_token; __client_uat=1234567890',
        'sec-fetch-dest': 'document',
      },
    });

    const options = {
      publishableKey: 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA',
      secretKey: 'sk_live_deadbeef',
    };

    const result = await authenticateRequest(request, options);

    expect(result.status).toBe('handshake');
    expect(result.reason).toBe('session-token-missing-azp');
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
