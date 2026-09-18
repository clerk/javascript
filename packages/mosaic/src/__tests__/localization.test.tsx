import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { mosaicMessages, resolveLocalization, useLocale, useMessages } from '../localization';
import { MosaicProvider } from '../MosaicProvider';

describe('resolveLocalization', () => {
  it('returns the base messages untouched when nothing is overridden', () => {
    expect(resolveLocalization(undefined).messages).toBe(mosaicMessages);
    expect(resolveLocalization({}).messages).toBe(mosaicMessages);
    expect(resolveLocalization({ messages: {} }).messages).toEqual(mosaicMessages);
  });

  it('overlays nested overrides and keeps sibling keys', () => {
    const { messages } = resolveLocalization({ messages: { userButton: { trigger: { open: 'Menü für {name}' } } } });
    expect(messages.userButton.trigger.open).toBe('Menü für {name}');
    expect(messages.userButton.popup.label).toBe(mosaicMessages.userButton.popup.label);
    expect(messages.userProfile).toBe(mosaicMessages.userProfile);
  });

  it('expands dot paths', () => {
    const { messages } = resolveLocalization({ messages: { 'userButton.popup.label': 'Konto' } });
    expect(messages.userButton.popup.label).toBe('Konto');
    expect(messages.userButton.workspaces.personal).toBe(mosaicMessages.userButton.workspaces.personal);
  });

  it('merges plural forms per category', () => {
    const { messages } = resolveLocalization({
      messages: { 'userButton.workspaces.members': { few: '{count} Mitglieder' } },
    });
    expect(messages.userButton.workspaces.members).toEqual({
      one: '{count} member',
      few: '{count} Mitglieder',
      other: '{count} members',
    });
  });

  it('lets later keys win over earlier ones when nested and dot forms overlap', () => {
    const { messages } = resolveLocalization({
      messages: {
        userButton: { popup: { label: 'nested' } },
        'userButton.popup.label': 'flat',
      },
    });
    expect(messages.userButton.popup.label).toBe('flat');
  });

  it('applies overrides on top of the messages', () => {
    const esES = { 'userButton.popup.label': 'Cuenta', 'userButton.trigger.open': 'Abrir menú de {name}' };
    const { messages } = resolveLocalization({ messages: esES, overrides: { 'userButton.popup.label': 'Mi cuenta' } });
    expect(messages.userButton.popup.label).toBe('Mi cuenta');
    expect(messages.userButton.trigger.open).toBe('Abrir menú de {name}');
  });

  it('defaults the locale to en and passes a given one through', () => {
    expect(resolveLocalization(undefined).locale).toBe('en');
    expect(resolveLocalization({ locale: 'es-ES' }).locale).toBe('es-ES');
  });

  it('falls back to en when the locale is not a valid BCP 47 tag', () => {
    expect(resolveLocalization({ locale: 'en_US' }).locale).toBe('en');
    expect(resolveLocalization({ locale: '' }).locale).toBe('en');
    expect(resolveLocalization({ locale: 'zz' }).locale).toBe('zz');
  });

  it('does not mutate the base messages', () => {
    resolveLocalization({ messages: { 'userButton.popup.label': 'Konto' } });
    expect(mosaicMessages.userButton.popup.label).toBe('Account');
  });
});

describe('useMessages', () => {
  it('returns the base namespace without a provider', () => {
    const { result } = renderHook(() => useMessages('userButton'));
    expect(result.current).toBe(mosaicMessages.userButton);
  });

  it('returns the localized namespace under a provider', () => {
    const { result } = renderHook(() => useMessages('userButton'), {
      wrapper: ({ children }) =>
        React.createElement(
          MosaicProvider,
          { localization: { messages: { 'userButton.popup.label': 'Konto' } } },
          children,
        ),
    });
    expect(result.current.popup.label).toBe('Konto');
    expect(result.current.trigger.open).toBe(mosaicMessages.userButton.trigger.open);
  });
});

describe('useLocale', () => {
  it('defaults to en', () => {
    expect(renderHook(() => useLocale()).result.current).toBe('en');
  });

  it('reads the provider locale', () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }) => React.createElement(MosaicProvider, { localization: { locale: 'de' } }, children),
    });
    expect(result.current).toBe('de');
  });
});
