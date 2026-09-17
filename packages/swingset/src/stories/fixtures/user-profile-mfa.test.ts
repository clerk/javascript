import { act, render, renderHook, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserProfileBackupCodesDialog } from '../../../../mosaic/src/features/user-profile/user-profile-backup-codes.dialog';
import { deferred } from '../../../../mosaic/src/machines/__tests__/test-utils';
import { MosaicProvider } from '../../../../mosaic/src/MosaicProvider';
import { useUserProfileMfaFixture } from './user-profile-mfa';

const enrollmentCodes = ['enrollment-code-1', 'enrollment-code-2'];
const regeneratedCodes = ['regenerated-code-1', 'regenerated-code-2'];

function setup(enrollmentBackupCodes: readonly string[] = enrollmentCodes, backupCodesEnabled = true) {
  const onCopy = vi.fn<(codes: readonly string[]) => Promise<void>>().mockResolvedValue(undefined);
  const onDownload = vi.fn<(codes: readonly string[]) => Promise<void>>().mockResolvedValue(undefined);
  const onGenerateBackupCodes = vi.fn<() => Promise<readonly string[]>>().mockResolvedValue(regeneratedCodes);
  return {
    ...renderHook(
      ({ backupCodesEnabled }) =>
        useUserProfileMfaFixture({
          enrollmentBackupCodes,
          onGenerateBackupCodes: backupCodesEnabled ? onGenerateBackupCodes : undefined,
          onCopy,
          onDownload,
        }),
      { initialProps: { backupCodesEnabled } },
    ),
    onCopy,
    onDownload,
    onGenerateBackupCodes,
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

  it.each(['sms', 'authenticator'] as const)('rejects 000000 for %s and accepts a corrected code', async type => {
    const { result } = setup();
    act(() => result.current.section.onAdd?.(type));
    if (type === 'sms') {
      await complete(() => result.current.sms.onSubmit());
      expect(result.current.sms.step).toBe('verify');
    }
    const methods = result.current.section.methods;
    act(() => result.current[type].onCodeChange('000000'));
    act(() => result.current[type].onSubmit('000000'));
    expect(result.current[type].isPending).toBe(true);
    await complete(() => undefined);
    expect(result.current[type].open).toBe(true);
    expect(result.current[type].isPending).toBe(false);
    expect(result.current[type].errorMessage).toBe('That code is incorrect. Try again.');
    expect(result.current.section.methods).toEqual(methods);
    expect(result.current.backupCodes.open).toBe(false);

    act(() => result.current[type].onCodeChange('123456'));
    expect(result.current[type].errorMessage).toBeUndefined();
    await complete(() => result.current[type].onSubmit('123456'));
    expect(result.current[type].open).toBe(false);
    expect(result.current.backupCodes.open).toBe(true);
  });

  it('keeps the setup dialog open from method selection through enrollment and backup codes', async () => {
    const { result } = setup();
    act(() => result.current.setup.onOpenChange(true));
    expect(result.current.setup).toMatchObject({ open: true, step: 'select' });
    act(() => result.current.section.onAdd?.('sms'));
    expect(result.current.setup).toMatchObject({ open: true, step: 'sms' });
    act(() => result.current.sms.onSelectedPhoneIdChange('other'));
    await complete(() => result.current.sms.onSubmit());
    expect(result.current.setup).toMatchObject({ open: true, step: 'backup-codes' });
    await complete(() => result.current.backupCodes.onCopy());
    expect(result.current.setup.open).toBe(false);
    act(() => result.current.setup.onOpenChange(true));
    expect(result.current.setup).toMatchObject({ open: true, step: 'select' });
  });

  it.each(['sms', 'backup-codes'] as const)('starts an inline %s example at its first screen', initialFlow => {
    const { result } = renderHook(() =>
      useUserProfileMfaFixture({
        initialFlow,
        enrollmentBackupCodes: enrollmentCodes,
        onCopy: vi.fn(),
        onDownload: vi.fn(),
      }),
    );
    expect(result.current.sms.open).toBe(initialFlow === 'sms');
    expect(result.current.backupCodes.open).toBe(initialFlow === 'backup-codes');
    expect(result.current.sms.step).toBe('select');
    expect(result.current.sms.selectedPhoneId).toBe('work');
    expect(result.current.backupCodes.codes).toEqual(initialFlow === 'backup-codes' ? enrollmentCodes : []);
  });

  it('creates backup codes for existing SMS enrollment when the instance enables them later', async () => {
    const { result, rerender, onGenerateBackupCodes } = setup([], false);
    expect(result.current.section.methods.map(method => method.type)).toEqual(['sms']);
    expect(result.current.section.addableMethods).not.toContain('backup-codes');

    rerender({ backupCodesEnabled: true });
    expect(result.current.section.addableMethods).toContain('backup-codes');
    const request = deferred<readonly string[]>();
    onGenerateBackupCodes.mockReturnValueOnce(request.promise);
    act(() => result.current.section.onAdd?.('backup-codes'));
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.backupCodes.pendingAction).toBe('generate');
    expect(result.current.section.methods.map(method => method.type)).toEqual(['sms']);
    expect(result.current.section.onRegenerateBackupCodes).toBeUndefined();

    await act(async () => {
      request.resolve(regeneratedCodes);
      await request.promise;
    });

    expect(result.current.section.methods.map(method => method.type)).toEqual(['sms', 'backup-codes']);
    expect(result.current.backupCodes.codes).toEqual(regeneratedCodes);
    expect(result.current.backupCodes.pendingAction).toBeUndefined();
    expect(result.current.section.addableMethods).not.toContain('backup-codes');
    expect(result.current.section.onRegenerateBackupCodes).toBeDefined();
    expect(onGenerateBackupCodes).toHaveBeenCalledOnce();
  });

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
    expect(screen.getByRole('button', { name: 'Download' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Copy and close' })).toBeVisible();
  });

  it('withholds backup-code creation until the instance enables codes and the user has MFA', async () => {
    const { result, rerender, onGenerateBackupCodes } = setup([], false);
    act(() => result.current.section.onAdd?.('backup-codes'));
    expect(result.current.backupCodes.open).toBe(false);
    expect(onGenerateBackupCodes).not.toHaveBeenCalled();

    await complete(() => void result.current.section.onRemove?.('personal'));
    rerender({ backupCodesEnabled: true });
    expect(result.current.section.addableMethods).not.toContain('backup-codes');
    act(() => result.current.section.onAdd?.('backup-codes'));
    expect(result.current.backupCodes.open).toBe(false);
    expect(onGenerateBackupCodes).not.toHaveBeenCalled();

    act(() => result.current.section.onAdd?.('authenticator'));
    await complete(() => result.current.authenticator.onSubmit('123456'));
    expect(result.current.section.addableMethods).toContain('backup-codes');
  });

  it.each(['rejection', 'empty result'])(
    'retries backup-code creation after %s without adding a row early',
    async failure => {
      const { result, onGenerateBackupCodes } = setup([]);
      if (failure === 'rejection') {
        onGenerateBackupCodes.mockRejectedValueOnce(new Error('Try again'));
      } else {
        onGenerateBackupCodes.mockResolvedValueOnce([]);
      }

      await complete(() => result.current.section.onAdd?.('backup-codes'));
      expect(result.current.backupCodes.open).toBe(true);
      expect(result.current.backupCodes.errorMessage).toContain('Unable to generate');
      expect(result.current.backupCodes.codes).toEqual([]);
      expect(result.current.section.methods.map(method => method.type)).toEqual(['sms']);
      expect(result.current.section.addableMethods).toContain('backup-codes');
      expect(result.current.section.onRegenerateBackupCodes).toBeUndefined();

      await complete(() => result.current.backupCodes.onRetry());
      expect(result.current.backupCodes.codes).toEqual(regeneratedCodes);
      expect(result.current.backupCodes.errorMessage).toBeUndefined();
      expect(result.current.section.methods.map(method => method.type)).toEqual(['sms', 'backup-codes']);
      expect(result.current.section.addableMethods).not.toContain('backup-codes');
      await complete(() => result.current.backupCodes.onCopy());
      expect(result.current.backupCodes.open).toBe(false);

      await complete(() => result.current.section.onRegenerateBackupCodes?.());
      expect(result.current.backupCodes.open).toBe(true);
      expect(result.current.section.methods.filter(method => method.type === 'backup-codes')).toHaveLength(1);
      expect(onGenerateBackupCodes).toHaveBeenCalledTimes(3);
    },
  );

  it('automatically adds supplied backup codes during enrollment and removes their Add choice', async () => {
    const { result } = setup();
    expect(result.current.section.addableMethods).toEqual(['sms', 'authenticator', 'backup-codes']);
    act(() => result.current.section.onAdd?.('authenticator'));
    await complete(() => result.current.authenticator.onSubmit('123456'));
    expect(result.current.section.methods.map(method => method.type)).toEqual(['authenticator', 'sms', 'backup-codes']);
    const codes = result.current.backupCodes.codes;
    expect(codes).toEqual(enrollmentCodes);
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.backupCodes.codes).toEqual(codes);
  });

  it('enrolls an authenticator on the first attempt, saves backup codes, and regenerates them', async () => {
    const { result, onCopy, onDownload, onGenerateBackupCodes } = setup();
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
    expect(onGenerateBackupCodes).not.toHaveBeenCalled();
    await complete(() => result.current.backupCodes.onDownload());
    expect(onDownload).toHaveBeenCalledExactlyOnceWith(codes);
    expect(result.current.backupCodes.open).toBe(true);
    await complete(() => result.current.backupCodes.onCopy());
    expect(onCopy).toHaveBeenCalledExactlyOnceWith(codes);
    expect(result.current.backupCodes.open).toBe(false);
    await complete(() => result.current.section.onRegenerateBackupCodes?.());
    expect(result.current.backupCodes.open).toBe(true);
    expect(result.current.backupCodes.codes).toEqual(regeneratedCodes);
    expect(onGenerateBackupCodes).toHaveBeenCalledOnce();
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

  it('allows changing the default SMS number while an authenticator keeps the Default badge', async () => {
    const { result } = setup([]);
    act(() => result.current.section.onAdd?.('sms'));
    act(() => result.current.sms.onSelectedPhoneIdChange('other'));
    await complete(() => result.current.sms.onSubmit());
    act(() => result.current.section.onAdd?.('authenticator'));
    await complete(() => result.current.authenticator.onSubmit('123456'));

    expect(result.current.section.methods.filter(method => method.canSetDefault).map(method => method.id)).toEqual([
      'personal',
      'other',
    ]);
    await complete(() => void result.current.section.onSetDefault?.('other'));
    expect(result.current.section.methods.filter(method => method.isDefault).map(method => method.id)).toEqual([
      'authenticator',
    ]);

    await complete(() => void result.current.section.onRemove?.('authenticator'));
    expect(result.current.section.methods.find(method => method.id === 'other')).toMatchObject({
      isDefault: true,
      canSetDefault: false,
    });
    expect(result.current.section.methods.find(method => method.id === 'personal')).toMatchObject({
      isDefault: false,
      canSetDefault: true,
    });
  });

  it.each([false, true])('orders the default SMS number first with authenticator enabled: %s', async authenticator => {
    const { result } = setup([]);
    if (authenticator) {
      act(() => result.current.section.onAdd?.('authenticator'));
      await complete(() => result.current.authenticator.onSubmit('123456'));
    }
    act(() => result.current.section.onAdd?.('sms'));
    act(() => result.current.sms.onSelectedPhoneIdChange('other'));
    await complete(() => result.current.sms.onSubmit());
    expect(result.current.section.methods.filter(method => method.type === 'sms').map(method => method.id)).toEqual([
      'personal',
      'other',
    ]);

    await complete(() => void result.current.section.onSetDefault?.('other'));

    expect(result.current.section.methods.filter(method => method.type === 'sms').map(method => method.id)).toEqual([
      'other',
      'personal',
    ]);
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
      expect(result.current.section.addableMethods).toContain('backup-codes');
      expect(result.current.backupCodes.open).toBe(false);
      expect(result.current.backupCodes.codes).toEqual([]);
      expect(result.current.section.onRegenerateBackupCodes).toBeUndefined();
    },
  );

  it.each(['rejection', 'empty result'])(
    'retries backup-code regeneration after %s without presenting old codes as new',
    async failure => {
      const { result, onGenerateBackupCodes } = setup();
      act(() => result.current.section.onAdd?.('authenticator'));
      await complete(() => result.current.authenticator.onSubmit('123456'));
      act(() => result.current.backupCodes.onOpenChange(false));
      if (failure === 'rejection') {
        onGenerateBackupCodes.mockRejectedValueOnce(new Error('Try again'));
      } else {
        onGenerateBackupCodes.mockResolvedValueOnce([]);
      }
      await complete(() => result.current.section.onRegenerateBackupCodes?.());
      expect(result.current.backupCodes.open).toBe(true);
      expect(result.current.backupCodes.codes).toEqual([]);
      expect(result.current.backupCodes.errorMessage).toContain('Unable to generate');
      expect(result.current.section.methods.some(method => method.type === 'backup-codes')).toBe(true);
      await complete(() => result.current.backupCodes.onRetry());
      expect(result.current.backupCodes.codes).toEqual(regeneratedCodes);
      expect(result.current.backupCodes.errorMessage).toBeUndefined();
      expect(result.current.backupCodes.pendingAction).toBeUndefined();
    },
  );
});
import '@testing-library/jest-dom/vitest';
