import { describe, expect, it } from 'vitest';

import { TOTP } from '../TOTP';

describe('TOTP', () => {
  it('has the same initial properties', () => {
    const totp = new TOTP({
      object: 'totp',
      id: 'totp_123',
      secret: 'JBSWY3DPEHPK3PXP',
      uri: 'otpauth://totp/MyApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyApp',
      verified: true,
      backup_codes: ['code1', 'code2'],
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    expect(totp).toMatchObject({
      id: 'totp_123',
      secret: 'JBSWY3DPEHPK3PXP',
      uri: 'otpauth://totp/MyApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyApp',
      verified: true,
      backupCodes: ['code1', 'code2'],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('TOTP Snapshots', () => {
  it('should match snapshot for TOTP structure', () => {
    const totp = new TOTP({
      object: 'totp',
      id: 'totp_123',
      secret: 'JBSWY3DPEHPK3PXP',
      uri: 'otpauth://totp/ClerkApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=ClerkApp',
      verified: true,
      backup_codes: ['backup_abc123', 'backup_def456'],
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    expect(totp).toMatchSnapshot();
  });

  it('should match snapshot for unverified TOTP', () => {
    const totp = new TOTP({
      object: 'totp',
      id: 'totp_456',
      secret: 'MFRGG43FMZWXO33V',
      uri: 'otpauth://totp/ClerkApp:newuser@test.com?secret=MFRGG43FMZWXO33V&issuer=ClerkApp',
      verified: false,
      backup_codes: [],
      created_at: 1735689500000,
      updated_at: 1735689500000,
    });

    expect(totp).toMatchSnapshot();
  });
});
