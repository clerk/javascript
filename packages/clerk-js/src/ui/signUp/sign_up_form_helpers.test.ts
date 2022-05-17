import { EnvironmentResource, UserSettingsJSON } from '@clerk/types';
import { UserSettings } from 'core/resources/UserSettings';

import { determineActiveFields, getInitialActiveIdentifier } from './sign_up_form_helpers';

describe('determineActiveFields()', () => {
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
                used_for_first_factor: true,
              },
              phone_number: {
                enabled: true,
                required: false,
                used_for_first_factor: false,
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
                required: false,
              },
            },
          } as UserSettingsJSON),
        },
        {
          emailAddress: {
            enabled: true,
            required: true,
            showAsDisabled: false,
          },
          phoneNumber: {
            enabled: false,
            required: false,
          },
          firstName: {
            enabled: true,
            required: true,
          },
          lastName: {
            enabled: true,
            required: true,
          },
          password: {
            enabled: true,
            required: true,
          },
          username: {
            enabled: true,
            required: false,
          },
          ticket: {
            enabled: false,
            required: false,
          },
        },
      ],
      [
        'phone only option',
        {
          userSettings: new UserSettings({
            attributes: {
              email_address: {
                enabled: true,
                required: false,
                used_for_first_factor: false,
              },
              phone_number: {
                enabled: true,
                required: true,
                used_for_first_factor: true,
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
                required: true,
              },
            },
          } as UserSettingsJSON),
        },
        {
          emailAddress: {
            enabled: false,
            required: false,
            showAsDisabled: false,
          },
          phoneNumber: {
            enabled: true,
            required: true,
          },
          firstName: {
            enabled: true,
            required: true,
          },
          lastName: {
            enabled: true,
            required: true,
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
      ],
      [
        'email or phone option',
        {
          userSettings: new UserSettings({
            attributes: {
              phone_number: {
                enabled: true,
                required: true,
                used_for_first_factor: true,
              },
              email_address: {
                enabled: true,
                required: true,
                used_for_first_factor: true,
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
                required: false,
              },
            },
          } as UserSettingsJSON),
        },
        {
          emailAddress: {
            enabled: true, // email will be toggled on initially
            required: true, // email will be toggled on initially
            showAsDisabled: false,
          },
          phoneNumber: {
            enabled: false, // phone will be toggled off initially
            required: false, // phone will be toggled off initially
          },
          firstName: {
            enabled: true,
            required: true,
          },
          lastName: {
            enabled: true,
            required: true,
          },
          password: {
            enabled: true,
            required: true,
          },
          username: {
            enabled: true,
            required: false,
          },
        },
      ],
      [
        'optional first and last name',
        {
          userSettings: new UserSettings({
            attributes: {
              email_address: {
                enabled: true,
                required: false,
                used_for_first_factor: false,
              },
              phone_number: {
                enabled: true,
                required: false,
                used_for_first_factor: false,
              },
              first_name: {
                enabled: true,
                required: false,
              },
              last_name: {
                enabled: true,
                required: false,
              },
              password: {
                enabled: true,
                required: true,
              },
              username: {
                enabled: true,
                required: false,
              },
            },
          } as UserSettingsJSON),
        },
        {
          emailAddress: {
            enabled: false,
            required: false,
            showAsDisabled: false,
          },
          phoneNumber: {
            enabled: false,
            required: false,
          },
          firstName: {
            enabled: true,
            required: false,
          },
          lastName: {
            enabled: true,
            required: false,
          },
          password: {
            enabled: true,
            required: true,
          },
          username: {
            enabled: true,
            required: false,
          },
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
                used_for_first_factor: false,
              },
              email_address: {
                enabled: false,
                required: false,
                used_for_first_factor: false,
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
                required: false,
              },
            },
          } as UserSettingsJSON),
        },
        {
          emailAddress: {
            enabled: false,
            required: false,
            showAsDisabled: false,
          },
          phoneNumber: {
            enabled: false,
            required: false,
          },
          firstName: {
            enabled: false,
            required: false,
          },
          lastName: {
            enabled: false,
            required: false,
          },
          password: {
            enabled: false,
            required: false,
          },
          username: {
            enabled: false,
            required: false,
          },
        },
      ],
    ];

    it.each(scenaria)('%s', (___, environment, result) => {
      const resultClone = JSON.parse(JSON.stringify(result));

      const expected = { ...resultClone, ticket: { enabled: false, required: false } };

      expect(
        determineActiveFields({
          environment: environment as EnvironmentResource,
          activeCommIdentifierType: getInitialActiveIdentifier(environment.userSettings.attributes),
        }),
      ).toEqual(expected);
    });

    it.each(scenaria)('with ticket, %s', (___, environment, result) => {
      // Email address or phone number cannot be required when there's a
      // ticket token present. Instead, we'll require the ticket parameter.

      const resultClone = JSON.parse(JSON.stringify(result));

      const expected = { ...resultClone, ticket: { enabled: true, required: true } };

      expected.emailAddress.enabled = false;
      expected.emailAddress.required = false;
      expected.phoneNumber.enabled = false;
      expected.phoneNumber.required = false;

      const res = determineActiveFields({
        environment: environment as EnvironmentResource,
        hasTicket: true,
        activeCommIdentifierType: getInitialActiveIdentifier(environment.userSettings.attributes),
      });

      expect(res).toMatchObject(expected);
    });

    it('email is shown but disabled if it has a value in the token case', () => {
      const [___, environment, result] = scenaria[0];

      const resultClone = JSON.parse(JSON.stringify(result));

      const expected = { ...resultClone, ticket: { enabled: true, required: true } };

      expected.emailAddress.showAsDisabled = true;
      expected.phoneNumber.enabled = false;
      expected.phoneNumber.required = false;

      const res = determineActiveFields({
        environment: environment as EnvironmentResource,
        hasTicket: true,
        hasEmail: true,
        activeCommIdentifierType: getInitialActiveIdentifier(environment.userSettings.attributes),
      });

      expect(res).toMatchObject(expected);
    });
  });
});
