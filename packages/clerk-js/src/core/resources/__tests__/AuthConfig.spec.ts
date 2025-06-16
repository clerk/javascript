import { describe, expect, it, vi } from 'vitest';

import { unixEpochToDate } from '../../../utils/date';
import { AuthConfig } from '../AuthConfig';

vi.mock('../../../utils/date', () => ({
  unixEpochToDate: vi.fn(timestamp => new Date(timestamp)),
}));

describe('AuthConfig', () => {
  it('initializes with default values', () => {
    const authConfig = new AuthConfig();

    expect(authConfig.claimedAt).toBeNull();
    expect(authConfig.reverification).toBe(false);
    expect(authConfig.singleSessionMode).toBe(false);
  });

  it('initializes with provided values', () => {
    const mockData = {
      claimed_at: 1672531200000,
      reverification: true,
      single_session_mode: true,
    };

    const authConfig = new AuthConfig(mockData);

    expect(unixEpochToDate).toHaveBeenCalledWith(1672531200000);
    expect(authConfig.claimedAt).toEqual(new Date(1672531200000));
    expect(authConfig.reverification).toBe(true);
    expect(authConfig.singleSessionMode).toBe(true);
  });

  it('converts to JSON snapshot correctly', () => {
    const authConfig = new AuthConfig({
      claimed_at: 1672531200000,
      reverification: true,
      single_session_mode: true,
    });

    const snapshot = authConfig.__internal_toSnapshot();

    expect(snapshot).toEqual({
      object: 'auth_config',
      claimed_at: 1672531200000,
      id: '',
      reverification: true,
      single_session_mode: true,
    });
  });
});
