import { describe, expectTypeOf, test } from 'vitest';

import type { MosaicCatalog, MosaicLocalization } from './catalog';
import { useMessages } from './context';
import type { MosaicMessages } from './registry';

// Message overrides are derived from the message files: nested objects or dot paths, every key
// optional, string leaves stay strings, plural leaves accept any CLDR category.

describe('MosaicCatalog', () => {
  test('accepts nested overrides', () => {
    const value: MosaicCatalog = {
      userButton: { trigger: { open: 'Menü für {name}' }, workspaces: { members: { few: '{count} Mitglieder' } } },
    };
    void value;
  });

  test('accepts dot paths, mixed with nested', () => {
    const value: MosaicCatalog = {
      'userButton.popup.label': 'Konto',
      'userButton.workspaces.members': { many: '{count} членов' },
      userProfile: { label: 'Profil' },
    };
    void value;
  });

  test('rejects unknown keys and paths', () => {
    const value: MosaicCatalog = {
      // @ts-expect-error typo in the path
      'userButton.popup.lable': 'x',
    };
    const nested: MosaicCatalog = {
      userButton: {
        // @ts-expect-error unknown key
        nope: 'x',
      },
    };
    void [value, nested];
  });

  test('keeps a leaf its kind', () => {
    const value: MosaicCatalog = {
      // @ts-expect-error a string leaf cannot become plural forms
      'userButton.popup.label': { other: 'x' },
    };
    const nested: MosaicCatalog = {
      // @ts-expect-error plural forms cannot become a string
      userButton: { workspaces: { members: 'x' } },
    };
    void [value, nested];
  });
});

describe('MosaicLocalization', () => {
  test('takes a locale, its catalog and overrides on top', () => {
    const esES: MosaicCatalog = { 'userButton.popup.label': 'Cuenta' };
    const catalog: MosaicLocalization = { locale: 'es-ES', messages: esES };
    const tweaked: MosaicLocalization = {
      locale: 'es-ES',
      messages: esES,
      overrides: { userButton: { popup: { label: 'Mi cuenta' } } },
    };
    const english: MosaicLocalization = { overrides: { 'userButton.popup.label': 'My account' } };
    void [catalog, tweaked, english];
  });

  test('checks the catalog and the overrides against the message keys', () => {
    const value: MosaicLocalization = {
      // @ts-expect-error unknown path
      overrides: { 'userButton.popup.lable': 'x' },
    };
    void value;
  });
});

describe('useMessages', () => {
  test('returns the namespace with its template types', () => {
    expectTypeOf(useMessages('userButton')).toEqualTypeOf<MosaicMessages['userButton']>();
    expectTypeOf(useMessages('userButton').trigger.open).toEqualTypeOf<'Open account menu for {name}'>();
    // @ts-expect-error unknown namespace
    useMessages('nope');
  });
});
