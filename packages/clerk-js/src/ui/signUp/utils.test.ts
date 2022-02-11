import { EnvironmentResource, UserSettingsJSON } from '@clerk/types';
import { UserSettings } from 'core/resources/UserSettings';

import { determineFirstPartyFields } from './utils';

describe('determineFirstPartyFields()', () => {
  // For specs refer to https://www.notion.so/clerkdev/Vocabulary-8f775765258643978f5811c88b140b2d
  // and the current Instance User settings options
  describe('returns first party field based on auth config', () => {
    type Scenario = [string, any, any];

    const scenaria: Scenario[] = [
      [
        'email only option',
        {
          userSettings: new UserSettings({
            attributes: {
              email_address: {
                enabled: true,
                required: true,
              },
              first_name: {
                enabled: true,
                required: true,
              },
              last_name: {
                enabled: true,
                required: true,
              },
              password: {
                enabled: true,
                required: true,
              },
              username: {
                enabled: true,
              },
            },
          } as UserSettingsJSON),
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
          userSettings: new UserSettings({
            attributes: {
              phone_number: {
                enabled: true,
                required: true,
              },
              first_name: {
                enabled: true,
                required: true,
              },
              last_name: {
                enabled: true,
                required: true,
              },
              password: {
                enabled: true,
                required: true,
              },
              username: {
                enabled: true,
              },
            },
          } as UserSettingsJSON),
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
          userSettings: new UserSettings({
            attributes: {
              phone_number: {
                enabled: true,
                required: true,
              },
              email_address: {
                enabled: true,
                required: true,
              },
              first_name: {
                enabled: true,
                required: true,
              },
              last_name: {
                enabled: true,
                required: true,
              },
              password: {
                enabled: true,
                required: true,
              },
              username: {
                enabled: true,
              },
            },
          } as UserSettingsJSON),
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
          userSettings: new UserSettings({
            attributes: {
              first_name: {
                enabled: true,
              },
              last_name: {
                enabled: true,
              },
              password: {
                enabled: true,
                required: true,
              },
              username: {
                enabled: true,
              },
            },
          } as UserSettingsJSON),
        },
        {
          firstName: 'on',
          lastName: 'on',
          password: 'required',
          username: 'on',
        },
      ],
      [
        'no fields enabled',
        {
          userSettings: new UserSettings({
            attributes: {
              phone_number: {
                enabled: false,
                required: false,
              },
              email_address: {
                enabled: false,
                required: false,
              },
              first_name: {
                enabled: false,
                required: false,
              },
              last_name: {
                enabled: false,
                required: false,
              },
              password: {
                enabled: false,
                required: false,
              },
              username: {
                enabled: false,
              },
            },
          } as UserSettingsJSON),
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
      const res = { ...result };
      delete res.emailAddress;
      delete res.phoneNumber;
      delete res.emailOrPhone;

      expect(
        determineFirstPartyFields(environment as EnvironmentResource, true),
      ).toEqual({ ...result, invitationToken: 'required' });
    });
  });
});
