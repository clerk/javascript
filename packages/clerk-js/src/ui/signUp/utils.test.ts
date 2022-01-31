import { EnvironmentResource } from '@clerk/types';
import {
  determineFirstPartyFields,
  determineOauthOptions,
  determineWeb3Options,
} from './utils';

describe('determineFirstPartyFields()', () => {
  // For specs refer to https://www.notion.so/clerkdev/Vocabulary-8f775765258643978f5811c88b140b2d
  // and the current Instance User settings options
  describe('returns first party field based on auth config', () => {
    type Scenario = [string, Object, Object];

    const scenaria: Scenario[] = [
      [
        'email only option',
        {
          authConfig: {
            identificationRequirements: [['email_address']],
            firstName: 'required',
            lastName: 'required',
            password: 'required',
            username: 'on',
          },
        },
        {
          emailAddress: 'required',
          firstName: 'required',
          lastName: 'required',
          password: 'required',
          username: 'on',
        },
      ],
      [
        'phone only option',
        {
          authConfig: {
            identificationRequirements: [['phone_number']],
            firstName: 'required',
            lastName: 'required',
            password: 'required',
            username: 'on',
          },
        },
        {
          phoneNumber: 'required',
          firstName: 'required',
          lastName: 'required',
          password: 'required',
          username: 'on',
        },
      ],
      [
        'email or phone option',
        {
          authConfig: {
            identificationRequirements: [['email_address'], ['phone_number']],
            firstName: 'required',
            lastName: 'required',
            password: 'required',
            username: 'on',
          },
        },
        {
          emailOrPhone: 'required',
          firstName: 'required',
          lastName: 'required',
          password: 'required',
          username: 'on',
        },
      ],
      [
        'optional first and last name',
        {
          authConfig: {
            identificationRequirements: [['email_address'], ['phone_number']],
            firstName: 'on',
            lastName: 'on',
            password: 'required',
            username: 'on',
          },
        },
        {
          emailOrPhone: 'required',
          firstName: 'on',
          lastName: 'on',
          password: 'required',
          username: 'on',
        },
      ],
      [
        'no fields enabled',
        {
          authConfig: {
            identificationRequirements: [],
            firstName: 'off',
            lastName: 'off',
            password: 'off',
            username: 'off',
          },
        },
        {},
      ],
    ];

    it.each(scenaria)('%s', (___, environment, result) => {
      expect(
        determineFirstPartyFields(environment as EnvironmentResource),
      ).toEqual(result);
    });

    it.each(scenaria)('with invitation, %s', (___, environment, result) => {
      // Email address or phone number cannot be required when there's an
      // invitation token present. Instead, we'll require the invitationToken
      // parameter
      const {
        // @ts-ignore 2339
        emailAddress: ___emailAddress,
        // @ts-ignore 2339
        emailOrPhone: ___emailOrPhone,
        // @ts-ignore 2339
        phoneNumber: ___phoneNumber,
        ...expected
      } = result;
      expect(
        determineFirstPartyFields(environment as EnvironmentResource, true),
      ).toEqual({ ...expected, invitationToken: 'required' });
    });
  });
});

describe('determineOauthOptions(environment)', () => {
  it('returns oauth options based on auth config', () => {
    const environment = {
      authConfig: {
        identificationRequirements: [
          ['email_address', 'oauth_google', 'oauth_facebook'],
          ['oauth_google'],
        ],
      },
    } as EnvironmentResource;

    expect(determineOauthOptions(environment)).toEqual([
      'oauth_facebook',
      'oauth_google',
    ]);
  });
});

describe('determineWeb3Options(environment)', () => {
  it('returns web3 options based on auth config', () => {
    const environment = {
      authConfig: {
        firstFactors: [
          'email_address',
          'web3_metamask_signature',
          'oauth_facebook',
        ],
      },
    } as EnvironmentResource;

    expect(determineWeb3Options(environment)).toEqual([
      'web3_metamask_signature',
    ]);
  });
});
