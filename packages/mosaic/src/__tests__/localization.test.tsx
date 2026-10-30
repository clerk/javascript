import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { mosaicMessages, resolveLocalization, useLocale, useMessages } from '../localization';
import { MosaicProvider } from '../mosaic-provider';

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
    expect(messages.userProfile).toEqual(mosaicMessages.userProfile);
  });

  it('expands dot paths', () => {
    const { messages } = resolveLocalization({ messages: { 'userButton.popup.label': 'Konto' } });
    expect(messages.userButton.popup.label).toBe('Konto');
    expect(messages.userButton.organizations.personal).toBe(mosaicMessages.userButton.organizations.personal);
  });

  it('merges plural forms per category', () => {
    const { messages } = resolveLocalization({
      messages: { 'userButton.organizations.members': { few: '{count} Mitglieder' } },
    });
    expect(messages.userButton.organizations.members).toEqual({
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

describe('terms', () => {
  const workspace = { organization: { one: 'workspace', other: 'workspaces' } };

  it('keeps the organization noun in English by default', () => {
    const { messages } = resolveLocalization(undefined);
    expect(messages.organizationProfile.label).toBe('Organization');
    expect(messages.organizationSwitcher.popup.label).toBe('Organizations');
    expect(messages.organizationSwitcher.organizations.loading).toBe('Loading organizations…');
    expect(messages.organizationProfile.danger.leave.label).toBe('Leave organization');
  });

  it('derives all four placeholders from one term', () => {
    const { messages } = resolveLocalization({ overrides: { terms: workspace } });
    expect(messages.organizationProfile.label).toBe('Workspace');
    expect(messages.organizationSwitcher.popup.label).toBe('Workspaces');
    expect(messages.organizationSwitcher.organizations.loading).toBe('Loading workspaces…');
    expect(messages.organizationProfile.danger.leave.label).toBe('Leave workspace');
  });

  it('leaves no organization noun behind in any built-in string', () => {
    const { messages } = resolveLocalization({ overrides: { terms: workspace } });
    const { terms: _terms, ...rest } = messages;
    const strings: string[] = [];
    const collect = (node: unknown) => {
      if (typeof node === 'string') {
        strings.push(node);
      } else if (typeof node === 'object' && node !== null) {
        Object.values(node).forEach(collect);
      }
    };
    collect(rest);
    expect(strings.filter(value => /\borganizations?\b/i.test(value))).toEqual([]);
  });

  it('accepts a term from a catalog, by dot path, with overrides winning', () => {
    const fromCatalog = resolveLocalization({
      locale: 'es-ES',
      messages: { 'terms.organization': { one: 'organización', other: 'organizaciones' } },
    });
    expect(fromCatalog.messages.organizationProfile.label).toBe('Organización');

    const overridden = resolveLocalization({
      locale: 'es-ES',
      messages: { terms: { organization: { one: 'organización' } } },
      overrides: { terms: { organization: { one: 'espacio' } } },
    });
    expect(overridden.messages.organizationProfile.label).toBe('Espacio');
  });

  it('uses the form the locale picks for one', () => {
    const { messages } = resolveLocalization({
      locale: 'ja',
      messages: { terms: { organization: { other: '組織' } } },
    });
    expect(messages.organizationProfile.label).toBe('組織');
    expect(messages.organizationSwitcher.popup.label).toBe('組織');
  });

  it('capitalizes with the rules of the locale', () => {
    const { messages } = resolveLocalization({
      locale: 'tr',
      messages: { terms: { organization: { one: 'işyeri', other: 'işyerleri' } } },
    });
    expect(messages.organizationProfile.label).toBe('İşyeri');
  });

  it('lets a specific key win over a term', () => {
    const { messages } = resolveLocalization({
      overrides: { terms: workspace, 'organizationProfile.label': 'Team' },
    });
    expect(messages.organizationProfile.label).toBe('Team');
    expect(messages.organizationSwitcher.popup.label).toBe('Workspaces');
  });

  it('fills terms in custom strings, plural forms and error messages', () => {
    const { messages } = resolveLocalization({
      overrides: { terms: workspace, 'userButton.popup.label': 'Your {organization}' },
    });
    expect(messages.userButton.popup.label).toBe('Your workspace');
    expect(messages.organizationProfile.danger.delete.dialogDescription.other).toContain('all workspace data');
    expect(messages.errors.organization_changed).toBe('The active workspace changed. Please try again.');
  });

  it('keeps other placeholders and markup for later', () => {
    const { messages } = resolveLocalization({
      overrides: { terms: workspace, 'userButton.popup.label': '{#strong}{organization}{/strong} {name}' },
    });
    expect(messages.userButton.popup.label).toBe('{#strong}workspace{/strong} {name}');
    expect(messages.organizationSwitcher.trigger.open).toBe('Open workspace menu for {name}');
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
