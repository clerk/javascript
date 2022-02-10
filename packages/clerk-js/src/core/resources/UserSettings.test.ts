import { UserSettingsJSON } from '@clerk/types';
import { UserSettings } from 'core/resources/internal';

describe('UserSettings', () => {
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

  it('returns enabled social provier strategies', function () {
    const sut = new UserSettings({
      social: {
        oauth_google: {
          enabled: true,
          required: false,
          authenticatable: true,
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

    const res = sut.socialProviderStrategies;
    expect(res).toEqual(['oauth_facebook', 'oauth_google']);
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

    const res = sut.standardFormAttributes;
    expect(res).toEqual(['email_address', 'phone_number']);
  });
});
