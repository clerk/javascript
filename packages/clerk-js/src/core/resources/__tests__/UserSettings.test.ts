import type { UserSettingsJSON } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { UserSettings } from '../internal';

describe('UserSettings', () => {
  it('defaults values when instantiated with no arguments', function () {
    expect(new UserSettings()).toMatchObject({
      actions: {
        create_organization: false,
        delete_self: false,
      },
      attributes: expect.objectContaining({
        email_address: expect.objectContaining({
          enabled: true,
          required: true,
          used_for_first_factor: true,
          verify_at_sign_up: true,
        }),
        password: expect.objectContaining({
          enabled: true,
          required: true,
        }),
      }),
    });
  });

  it('returns enabled web3 first factors', function () {
    const sut = new UserSettings({
      attributes: {
        username: {
          enabled: false,
          required: false,
          used_for_first_factor: false,
          first_factors: [],
          used_for_second_factor: false,
          second_factors: [],
          verifications: [],
          verify_at_sign_up: false,
        },
        web3_wallet: {
          enabled: true,
          required: true,
          used_for_first_factor: true,
          first_factors: ['web3_metamask_signature'],
          used_for_second_factor: false,
          second_factors: [],
          verifications: ['web3_metamask_signature'],
          verify_at_sign_up: true,
        },
      },
    } as any as UserSettingsJSON);

    const res = sut.web3FirstFactors;
    expect(res).toEqual(['web3_metamask_signature']);
  });

  it('returns if the instance is passwordless or password-based', function () {
    let sut = new UserSettings({
      attributes: {
        password: {
          enabled: true,
          required: true,
        },
      },
    } as any as UserSettingsJSON);

    expect(sut.instanceIsPasswordBased).toEqual(true);

    sut = new UserSettings({
      attributes: {
        password: {
          enabled: true,
          required: false,
        },
      },
    } as any as UserSettingsJSON);
    expect(sut.instanceIsPasswordBased).toEqual(false);
  });

  it('respects default values for min and max password length', function () {
    let sut = new UserSettings({
      attributes: {
        password: {
          enabled: true,
          required: false,
        },
      },
      password_settings: {
        min_length: 0,
        max_length: 0,
      },
    } as any as UserSettingsJSON);

    expect(sut.passwordSettings).toMatchObject({
      min_length: 8,
      max_length: 72,
    });

    sut = new UserSettings({
      attributes: {
        password: {
          enabled: true,
          required: false,
        },
      },
      password_settings: {
        min_length: 10,
        max_length: 50,
      },
    } as any as UserSettingsJSON);

    expect(sut.passwordSettings).toMatchObject({
      min_length: 10,
      max_length: 50,
    });

    sut = new UserSettings({
      attributes: {
        password: {
          enabled: true,
          required: false,
        },
      },
      password_settings: {
        min_length: 10,
        max_length: 100,
      },
    } as any as UserSettingsJSON);

    expect(sut.passwordSettings).toMatchObject({
      min_length: 10,
      max_length: 72,
    });
  });

  it('returns true if the instance has a valid auth factor', function () {
    let sut = new UserSettings({
      attributes: {
        email_address: {
          enabled: true,
          required: true,
        },
        phone_number: {
          enabled: false,
          required: false,
        },
        password: {
          enabled: true,
          required: false,
        },
        username: {
          enabled: false,
          required: false,
        },
      },
    } as any as UserSettingsJSON);
    expect(sut.hasValidAuthFactor).toEqual(true);

    sut = new UserSettings({
      attributes: {
        email_address: {
          enabled: false,
          required: false,
        },
        phone_number: {
          enabled: true,
          required: false,
        },
        password: {
          enabled: false,
          required: false,
        },
        username: {
          enabled: true,
          required: false,
        },
      },
    } as any as UserSettingsJSON);
    expect(sut.hasValidAuthFactor).toEqual(true);

    sut = new UserSettings({
      attributes: {
        email_address: {
          enabled: false,
          required: false,
        },
        phone_number: {
          enabled: false,
          required: false,
        },
        password: {
          enabled: true,
          required: true,
        },
        username: {
          enabled: true,
          required: true,
        },
      },
    } as any as UserSettingsJSON);
    expect(sut.hasValidAuthFactor).toEqual(true);
  });

  it('returns false if the instance has not a valid auth factor', function () {
    const sut = new UserSettings({
      attributes: {
        email_address: {
          enabled: false,
          required: false,
        },
        phone_number: {
          enabled: false,
          required: false,
        },
        password: {
          enabled: true,
          required: false,
        },
        username: {
          enabled: false,
          required: false,
        },
      },
    } as any as UserSettingsJSON);
    expect(sut.hasValidAuthFactor).toEqual(false);
  });

  it('returns enabled social provider strategies', function () {
    const sut = new UserSettings({
      social: {
        oauth_google: {
          enabled: true,
          required: false,
          authenticatable: false,
          strategy: 'oauth_google',
        },
        oauth_gitlab: {
          enabled: false,
          required: false,
          authenticatable: false,
          strategy: 'oauth_gitlab',
        },
        oauth_facebook: {
          enabled: true,
          required: false,
          authenticatable: true,
          strategy: 'oauth_facebook',
        },
      },
      attributes: {
        username: {
          enabled: true,
          required: false,
        },
        web3_wallet: {
          enabled: false,
          required: false,
        },
      },
    } as any as UserSettingsJSON);

    expect(sut.socialProviderStrategies).toEqual(['oauth_facebook', 'oauth_google']);
    expect(sut.authenticatableSocialStrategies).toEqual(['oauth_facebook']);
  });

  it('returns enabled standard form attributes', function () {
    const sut = new UserSettings({
      attributes: {
        email_address: {
          enabled: true,
          required: false,
          used_for_first_factor: true,
          first_factors: ['email_link'],
          used_for_second_factor: false,
          second_factors: [],
          verifications: ['email_link'],
          verify_at_sign_up: true,
        },
        phone_number: {
          enabled: true,
          required: false,
          used_for_first_factor: true,
          first_factors: ['phone_code'],
          used_for_second_factor: true,
          second_factors: ['phone_code'],
          verifications: ['phone_code'],
          verify_at_sign_up: true,
        },
        username: {
          enabled: false,
          required: false,
          used_for_first_factor: false,
          first_factors: [],
          used_for_second_factor: false,
          second_factors: [],
          verifications: [],
          verify_at_sign_up: false,
        },
      },
    } as any as UserSettingsJSON);

    const res = sut.enabledFirstFactorIdentifiers;
    expect(res).toEqual(['email_address', 'phone_number']);
  });
});
