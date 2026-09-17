import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserProfileMfaFixture } from './user-profile-mfa';

function setup() {
  const onCopy = vi.fn<(codes: readonly string[]) => Promise<void>>().mockResolvedValue(undefined);
  const onDownload = vi.fn<(codes: readonly string[]) => Promise<void>>().mockResolvedValue(undefined);
  return { ...renderHook(() => useUserProfileMfaFixture({ onCopy, onDownload })), onCopy, onDownload };
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

  it('enrolls an authenticator on the first attempt, saves backup codes, and regenerates them', async () => {
    const { result, onCopy, onDownload } = setup();
    act(() => result.current.section.onAdd?.('authenticator'));
    expect(result.current.authenticator.open).toBe(true);
    await complete(() => result.current.authenticator.onSubmit('123456'));
    expect(result.current.authenticator.open).toBe(false);
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.section.methods.map(method => method.type)).toEqual(['authenticator', 'sms', 'backup-codes']);
    expect(result.current.section.addableMethods).toEqual(['sms']);
    const codes = result.current.backupCodes.codes;
    expect(codes).toHaveLength(10);
    await complete(() => result.current.backupCodes.onDownload());
    expect(onDownload).toHaveBeenCalledExactlyOnceWith(codes);
    expect(result.current.backupCodes.open).toBe(true);
    await complete(() => result.current.backupCodes.onCopy());
    expect(onCopy).toHaveBeenCalledExactlyOnceWith(codes);
    expect(result.current.backupCodes.open).toBe(false);
    await complete(() => result.current.section.onRegenerateBackupCodes?.());
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.backupCodes.codes).not.toEqual(codes);
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
    await complete(() => result.current.section.onAdd?.('backup-codes'));
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

  it('cancels enrollment without changing methods and clears backup codes when the last factor is removed', async () => {
    const { result } = setup();
    const initialMethods = result.current.section.methods;
    act(() => result.current.section.onAdd?.('authenticator'));
    act(() => result.current.authenticator.onCodeChange('123'));
    act(() => result.current.authenticator.onOpenChange(false));
    expect(result.current.section.methods).toEqual(initialMethods);
    act(() => result.current.section.onAdd?.('authenticator'));
    expect(result.current.authenticator.code).toBe('');
    act(() => result.current.authenticator.onOpenChange(false));
    await complete(() => result.current.section.onAdd?.('backup-codes'));
    act(() => result.current.backupCodes.onOpenChange(false));
    await complete(() => void result.current.section.onRemove?.('personal'));
    expect(result.current.section.methods).toEqual([]);
    expect(result.current.section.addableMethods).toEqual(['sms', 'authenticator']);
  });
});
