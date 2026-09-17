import { act, render, renderHook, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserProfileBackupCodesDialog } from '../../../../mosaic/src/features/user-profile/user-profile-backup-codes.dialog';
import { MosaicProvider } from '../../../../mosaic/src/MosaicProvider';
import { useUserProfileMfaFixture } from './user-profile-mfa';

const enrollmentCodes = ['enrollment-code-1', 'enrollment-code-2'];
const regeneratedCodes = ['regenerated-code-1', 'regenerated-code-2'];

function setup(enrollmentBackupCodes: readonly string[] = enrollmentCodes) {
  const onCopy = vi.fn<(codes: readonly string[]) => Promise<void>>().mockResolvedValue(undefined);
  const onDownload = vi.fn<(codes: readonly string[]) => Promise<void>>().mockResolvedValue(undefined);
  const onRegenerateBackupCodes = vi.fn<() => Promise<readonly string[]>>().mockResolvedValue(regeneratedCodes);
  return {
    ...renderHook(() =>
      useUserProfileMfaFixture({ enrollmentBackupCodes, onRegenerateBackupCodes, onCopy, onDownload }),
    ),
    onCopy,
    onDownload,
    onRegenerateBackupCodes,
  };
}

async function complete(action: () => void) {
  await act(async () => {
    action();
    await vi.advanceTimersByTimeAsync(1500);
  });
}

describe('MFA playground', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each(['sms', 'authenticator'] as const)('opens Save your backup codes after %s enrollment', async type => {
    const { result } = setup();
    act(() => result.current.section.onAdd?.(type));
    if (type === 'authenticator') {
      await complete(() => result.current.authenticator.onSubmit('123456'));
    } else {
      act(() => result.current.sms.onSelectedPhoneIdChange('other'));
      await complete(() => result.current.sms.onSubmit());
    }
    expect(result.current.sms.open).toBe(false);
    expect(result.current.authenticator.open).toBe(false);
    expect(result.current.backupCodes.open).toBe(true);
    render(
      createElement(MosaicProvider, null, createElement(UserProfileBackupCodesDialog, result.current.backupCodes)),
    );
    expect(screen.getByRole('dialog', { name: 'Save your backup codes' })).toBeVisible();
    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(enrollmentCodes);
    expect(screen.getByRole('button', { name: 'Download', exact: true })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Copy and close' })).toBeVisible();
  });

  it('automatically adds backup codes during enrollment without offering them in Add', async () => {
    const { result } = setup();
    expect(result.current.section.addableMethods).toEqual(['sms', 'authenticator']);
    act(() => result.current.section.onAdd?.('authenticator'));
    await complete(() => result.current.authenticator.onSubmit('123456'));
    expect(result.current.section.methods.map(method => method.type)).toEqual(['authenticator', 'sms', 'backup-codes']);
    const codes = result.current.backupCodes.codes;
    expect(codes).toEqual(enrollmentCodes);
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.backupCodes.codes).toEqual(codes);
  });

  it('enrolls an authenticator on the first attempt, saves backup codes, and regenerates them', async () => {
    const { result, onCopy, onDownload, onRegenerateBackupCodes } = setup();
    act(() => result.current.section.onAdd?.('authenticator'));
    expect(result.current.authenticator.open).toBe(true);
    await complete(() => result.current.authenticator.onSubmit('123456'));
    expect(result.current.authenticator.open).toBe(false);
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.backupCodes.codes).toEqual(enrollmentCodes);
    expect(result.current.section.methods.map(method => method.type)).toEqual(['authenticator', 'sms', 'backup-codes']);
    expect(result.current.section.addableMethods).toEqual(['sms']);
    const codes = result.current.backupCodes.codes;
    expect(codes).toEqual(enrollmentCodes);
    expect(onRegenerateBackupCodes).not.toHaveBeenCalled();
    await complete(() => result.current.backupCodes.onDownload());
    expect(onDownload).toHaveBeenCalledExactlyOnceWith(codes);
    expect(result.current.backupCodes.open).toBe(true);
    await complete(() => result.current.backupCodes.onCopy());
    expect(onCopy).toHaveBeenCalledExactlyOnceWith(codes);
    expect(result.current.backupCodes.open).toBe(false);
    await complete(() => result.current.section.onRegenerateBackupCodes?.());
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.backupCodes.codes).toEqual(regeneratedCodes);
    expect(onRegenerateBackupCodes).toHaveBeenCalledOnce();
    expect(result.current.section.methods.filter(method => method.type === 'backup-codes')).toHaveLength(1);
  });

  it('verifies a new phone, updates the row, and keeps the phone available after removing SMS', async () => {
    const { result } = setup();
    act(() => result.current.section.onAdd?.('sms'));
    act(() => result.current.sms.onAddPhone());
    act(() => result.current.sms.onPhoneNumberChange('+18015550300'));
    await complete(() => result.current.sms.onSubmit());
    expect(result.current.sms.step).toBe('verify');
    await complete(() => result.current.sms.onSubmit('123456'));
    expect(result.current.backupCodes.open).toBe(true);
    const method = result.current.section.methods.find(method => method.id === 'phone-+18015550300');
    expect(method).toBeDefined();
    if (!method) {
      throw new Error('New SMS method missing');
    }
    act(() => result.current.backupCodes.onOpenChange(false));
    await complete(() => void result.current.section.onSetDefault?.(method.id));
    expect(result.current.section.methods.find(item => item.isDefault)?.id).toBe(method.id);
    await complete(() => void result.current.section.onRemove?.(method.id));
    expect(result.current.section.methods.some(item => item.id === method.id)).toBe(false);
    act(() => result.current.section.onAdd?.('sms'));
    expect(result.current.sms.phoneNumbers.some(phone => phone.phoneNumber === '+18015550300')).toBe(true);
    expect(result.current.section.methods.filter(item => item.isDefault)).toHaveLength(1);
  });

  it('enables a verified existing number directly and verifies an unverified number', async () => {
    const { result } = setup();
    act(() => result.current.section.onAdd?.('sms'));
    expect(result.current.sms.phoneNumbers.some(phone => phone.id === 'personal')).toBe(false);
    act(() => result.current.sms.onSelectedPhoneIdChange('other'));
    await complete(() => result.current.sms.onSubmit());
    expect(result.current.sms.open).toBe(false);
    expect(result.current.section.methods.some(method => method.id === 'other')).toBe(true);
    act(() => result.current.backupCodes.onOpenChange(false));
    act(() => result.current.section.onAdd?.('sms'));
    act(() => result.current.sms.onSelectedPhoneIdChange('work'));
    await complete(() => result.current.sms.onSubmit());
    expect(result.current.sms.step).toBe('verify');
    await complete(() => result.current.sms.onSubmit('654321'));
    expect(result.current.sms.open).toBe(false);
    expect(result.current.backupCodes.open).toBe(false);
    expect(result.current.section.methods.some(method => method.id === 'work')).toBe(true);
  });

  it('preserves codes on a real copy failure and closes after a successful retry', async () => {
    const { result, onCopy } = setup();
    act(() => result.current.section.onAdd?.('authenticator'));
    await complete(() => result.current.authenticator.onSubmit('123456'));
    const codes = result.current.backupCodes.codes;
    onCopy.mockRejectedValueOnce(new Error('Clipboard unavailable'));
    await complete(() => result.current.backupCodes.onCopy());
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.backupCodes.codes).toEqual(codes);
    expect(result.current.backupCodes.errorMessage).toContain('Unable to copy');
    await complete(() => result.current.backupCodes.onCopy());
    expect(result.current.backupCodes.open).toBe(false);
    expect(result.current.backupCodes.errorMessage).toBeUndefined();
  });

  it('cancels enrollment without changing methods and clears the code before reopening', () => {
    const { result } = setup();
    const initialMethods = result.current.section.methods;
    act(() => result.current.section.onAdd?.('authenticator'));
    act(() => result.current.authenticator.onCodeChange('123'));
    act(() => result.current.authenticator.onOpenChange(false));
    expect(result.current.section.methods).toEqual(initialMethods);
    act(() => result.current.section.onAdd?.('authenticator'));
    expect(result.current.authenticator.code).toBe('');
  });

  it.each(['authenticator', 'sms'] as const)('removes backup codes when the last %s method is removed', async type => {
    const { result } = setup();
    act(() => result.current.section.onAdd?.('authenticator'));
    await complete(() => result.current.authenticator.onSubmit('123456'));
    act(() => result.current.backupCodes.onOpenChange(false));
    const firstId = type === 'authenticator' ? 'personal' : 'authenticator';
    const lastId = type === 'authenticator' ? 'authenticator' : 'personal';
    await complete(() => void result.current.section.onRemove?.(firstId));
    expect(result.current.section.methods.map(method => method.type)).toEqual([type, 'backup-codes']);
    expect(result.current.backupCodes.codes).toEqual(enrollmentCodes);

    await complete(() => void result.current.section.onRemove?.(lastId));
    expect(result.current.section.methods).toEqual([]);
    expect(result.current.backupCodes.codes).toEqual([]);
    expect(result.current.backupCodes.open).toBe(false);
    expect(result.current.section.onRegenerateBackupCodes).toBeUndefined();
    expect(result.current.section.addableMethods).toEqual(['sms', 'authenticator']);

    act(() => result.current.section.onAdd?.('authenticator'));
    await complete(() => result.current.authenticator.onSubmit('123456'));
    expect(result.current.section.methods.map(method => method.type)).toEqual(['authenticator', 'backup-codes']);
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.backupCodes.codes).toEqual(enrollmentCodes);
  });

  it('keeps enrollment and backup codes when dismissed during regeneration', async () => {
    const { result } = setup();
    act(() => result.current.section.onAdd?.('authenticator'));
    await complete(() => result.current.authenticator.onSubmit('123456'));
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.section.methods.some(method => method.type === 'authenticator')).toBe(true);
    act(() => result.current.backupCodes.onOpenChange(false));
    expect(result.current.backupCodes.open).toBe(false);
    expect(result.current.section.methods.some(method => method.type === 'authenticator')).toBe(true);
    expect(result.current.section.addableMethods).toEqual(['sms']);
    expect(result.current.section.methods.some(method => method.type === 'backup-codes')).toBe(true);
    expect(result.current.backupCodes.codes).toEqual(enrollmentCodes);
    await complete(() => result.current.section.onRegenerateBackupCodes?.());
    expect(result.current.section.methods.some(method => method.type === 'authenticator')).toBe(true);
    expect(result.current.backupCodes.open).toBe(true);
  });

  it.each(['authenticator', 'sms'] as const)(
    'finishes %s enrollment without backup codes when none are supplied',
    async type => {
      const { result } = setup([]);
      act(() => result.current.section.onAdd?.(type));
      if (type === 'authenticator') {
        await complete(() => result.current.authenticator.onSubmit('123456'));
      } else {
        act(() => result.current.sms.onSelectedPhoneIdChange('other'));
        await complete(() => result.current.sms.onSubmit());
      }
      expect(result.current.section.methods.some(method => method.type === type)).toBe(true);
      expect(result.current.section.methods.some(method => method.type === 'backup-codes')).toBe(false);
      expect(result.current.section.addableMethods).not.toContain('backup-codes');
      expect(result.current.backupCodes.open).toBe(false);
      expect(result.current.backupCodes.codes).toEqual([]);
      expect(result.current.section.onRegenerateBackupCodes).toBeUndefined();
    },
  );

  it.each(['rejection', 'empty result'])(
    'retries backup-code regeneration after %s without presenting old codes as new',
    async failure => {
      const { result, onRegenerateBackupCodes } = setup();
      act(() => result.current.section.onAdd?.('authenticator'));
      await complete(() => result.current.authenticator.onSubmit('123456'));
      act(() => result.current.backupCodes.onOpenChange(false));
      if (failure === 'rejection') {
        onRegenerateBackupCodes.mockRejectedValueOnce(new Error('Try again'));
      } else {
        onRegenerateBackupCodes.mockResolvedValueOnce([]);
      }
      await complete(() => result.current.section.onRegenerateBackupCodes?.());
      expect(result.current.backupCodes.open).toBe(true);
      expect(result.current.backupCodes.codes).toEqual([]);
      expect(result.current.backupCodes.errorMessage).toContain('Unable to regenerate');
      expect(result.current.section.methods.some(method => method.type === 'backup-codes')).toBe(true);
      await complete(() => result.current.backupCodes.onRetry());
      expect(result.current.backupCodes.codes).toEqual(regeneratedCodes);
      expect(result.current.backupCodes.errorMessage).toBeUndefined();
      expect(result.current.backupCodes.pendingAction).toBeUndefined();
    },
  );
});
