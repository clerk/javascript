import { describe, expect, it } from 'vitest';

import { BackupCode } from '../BackupCode';

describe('BackupCode', () => {
  it('has the same initial properties', () => {
    const backupCode = new BackupCode({
      object: 'backup_code',
      id: 'backup_123',
      codes: ['abc123', 'def456', 'ghi789'],
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    expect(backupCode).toMatchObject({
      id: 'backup_123',
      codes: ['abc123', 'def456', 'ghi789'],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('BackupCode Snapshots', () => {
  it('should match snapshot for backup code structure', () => {
    const backupCode = new BackupCode({
      object: 'backup_code',
      id: 'backup_123',
      codes: ['backup_abc123', 'backup_def456', 'backup_ghi789', 'backup_jkl012'],
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: backupCode.id,
      codes: backupCode.codes,
      createdAt: backupCode.createdAt?.getTime(),
      updatedAt: backupCode.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for empty backup codes', () => {
    const backupCode = new BackupCode({
      object: 'backup_code',
      id: 'backup_empty',
      codes: [],
      created_at: 1735689500000,
      updated_at: 1735689500000,
    });

    const snapshot = {
      id: backupCode.id,
      codes: backupCode.codes,
      createdAt: backupCode.createdAt?.getTime(),
      updatedAt: backupCode.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });
});
