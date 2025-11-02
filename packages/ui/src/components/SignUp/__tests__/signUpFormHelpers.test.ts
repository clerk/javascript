import type { Attribute } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { determineActiveFields, determineRequiredIdentifier, getInitialActiveIdentifier } from '../signUpFormHelpers';

const createAttributeData = (name: Attribute, enabled: boolean, required: boolean, usedForFirstFactor: boolean) => ({
  name,
  enabled,
  required,
  verifications: [],
  used_for_first_factor: usedForFirstFactor,
  first_factors: [],
  used_for_second_factor: false,
  second_factors: [],
  verify_at_sign_up: false,
});

describe('determineActiveFields()', () => {
  // For specs refer to https://www.notion.so/clerkdev/Vocabulary-8f775765258643978f5811c88b140b2d
  // and the current Instance User settings options
  describe('returns first party field based on auth config', () => {
    type Scenario = [string, any, any];
    const isProgressiveSignUp = false;

    const scenaria: Scenario[] = [
      [
        'email only option',
        {
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
        {
          emailAddress: {
            required: true,
            disabled: false,
          },
          firstName: {
            required: true,
          },
          lastName: {
            required: true,
          },
          password: {
            required: true,
          },
          username: {
            required: false,
          },
        },
      ],
      [
        'phone only option',
        {
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
        {
          phoneNumber: {
            required: true,
          },
          firstName: {
            required: true,
          },
          lastName: {
            required: true,
          },
          password: {
            required: true,
          },
          username: {
            required: true,
          },
        },
      ],
      [
        'email or phone option',
        {
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
        {
          emailAddress: {
            required: true, // email will be toggled on initially
            disabled: false,
          },
          firstName: {
            required: true,
          },
          lastName: {
            required: true,
          },
          password: {
            required: true,
          },
          username: {
            required: false,
          },
        },
      ],
      [
        'optional first and last name',
        {
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
        {
          firstName: {
            required: false,
          },
          lastName: {
            required: false,
          },
          password: {
            required: true,
          },
          username: {
            required: false,
          },
        },
      ],
      [
        'no fields enabled',
        {
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
            enabled: true,
            required: false,
          },
          username: {
            enabled: false,
            required: false,
          },
        },
        {},
      ],
    ];

    it.each(scenaria)('%s', (___, attributes, result) => {
      expect(
        determineActiveFields({
          attributes: attributes,
          activeCommIdentifierType: getInitialActiveIdentifier(attributes, isProgressiveSignUp),
          isProgressiveSignUp,
        }),
      ).toEqual(result);
    });

    it.each(scenaria)('with ticket, %s', (___, attributes, result) => {
      // Email address or phone number cannot be required when there's a
      // ticket token present. Instead, we'll require the ticket parameter.

      const resultClone = JSON.parse(JSON.stringify(result));

      const expected = { ...resultClone, ticket: { required: true } };

      delete expected.emailAddress;
      delete expected.phoneNumber;

      const res = determineActiveFields({
        attributes: attributes,
        hasTicket: true,
        activeCommIdentifierType: getInitialActiveIdentifier(attributes, isProgressiveSignUp),
        isProgressiveSignUp,
      });

      expect(res).toMatchObject(expected);
    });

    it('email is shown but disabled if it has a value in the token case', () => {
      const [___, attributes, result] = scenaria[0];

      const resultClone = JSON.parse(JSON.stringify(result));

      const expected = { ...resultClone, ticket: { required: true } };

      expected.emailAddress.disabled = true;

      delete expected.phoneNumber;

      const res = determineActiveFields({
        attributes: attributes,
        hasTicket: true,
        hasEmail: true,
        activeCommIdentifierType: getInitialActiveIdentifier(attributes, isProgressiveSignUp),
        isProgressiveSignUp,
      });

      expect(res).toMatchObject(expected);
    });
  });

  describe('calculates active fields based on user settings for Progressive Sign up', () => {
    type Scenario = [string, any, any];
    const isProgressiveSignUp = true;

    const mockDefaultAttributesProgressive = {
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
    };

    const scenarios: Scenario[] = [
      [
        'email required',
        {
          ...mockDefaultAttributesProgressive,
          email_address: {
            enabled: true,
            required: true,
            used_for_first_factor: false,
          },
          phone_number: {
            enabled: false,
            required: false,
            used_for_first_factor: true,
          },
        },
        {
          emailAddress: {
            required: true,
            disabled: false,
          },
        },
      ],
      [
        'phone required',
        {
          ...mockDefaultAttributesProgressive,
          email_address: {
            enabled: false,
            required: false,
            used_for_first_factor: true,
          },
          phone_number: {
            enabled: true,
            required: true,
            used_for_first_factor: false,
          },
        },
        {
          phoneNumber: {
            required: true,
          },
        },
      ],
      [
        'email & phone required',
        {
          ...mockDefaultAttributesProgressive,
          phone_number: {
            enabled: true,
            required: true,
            used_for_first_factor: false,
          },
          email_address: {
            enabled: true,
            required: true,
            used_for_first_factor: false,
          },
        },
        {
          emailAddress: {
            required: true,
            disabled: false,
          },
          phoneNumber: {
            required: true,
          },
        },
      ],
      [
        'email OR phone',
        {
          ...mockDefaultAttributesProgressive,
          phone_number: {
            enabled: true,
            required: false,
            used_for_first_factor: true,
          },
          email_address: {
            enabled: true,
            required: false,
            used_for_first_factor: true,
          },
        },
        {
          emailAddress: {
            required: false, // email will be toggled on initially
            disabled: false,
          },
        },
      ],
      [
        'email required, phone optional',
        {
          ...mockDefaultAttributesProgressive,
          phone_number: {
            enabled: true,
            required: false,
            used_for_first_factor: true,
          },
          email_address: {
            enabled: true,
            required: true,
            used_for_first_factor: true,
          },
        },
        {
          emailAddress: {
            required: true,
            disabled: false,
          },
          phoneNumber: {
            required: false,
          },
        },
      ],
      [
        'phone required, email optional',
        {
          ...mockDefaultAttributesProgressive,
          phone_number: {
            enabled: true,
            required: true,
            used_for_first_factor: true,
          },
          email_address: {
            enabled: true,
            required: false,
            used_for_first_factor: true,
          },
        },
        {
          emailAddress: {
            required: false,
            disabled: false,
          },
          phoneNumber: {
            required: true,
          },
        },
      ],
    ];

    it.each(scenarios)('%s', (___, attributes, result) => {
      expect(
        determineActiveFields({
          attributes: attributes,
          activeCommIdentifierType: getInitialActiveIdentifier(attributes, isProgressiveSignUp),
          isProgressiveSignUp,
        }),
      ).toEqual(result);
    });

    it('phone is shown if enabled in the token case', () => {
      const [___, attributes, result] = [
        'email only option',
        {
          email_address: {
            enabled: true,
            required: true,
          },
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
            enabled: false,
            required: false,
          },
          username: {
            enabled: false,
            required: false,
          },
        },
        {
          emailAddress: {
            required: true,
            disabled: true,
          },
          phoneNumber: {
            required: true,
          },
          ticket: {
            required: true,
          },
          firstName: {
            required: true,
          },
          lastName: {
            required: true,
          },
        },
      ] as Scenario;

      const res = determineActiveFields({
        attributes: attributes,
        hasTicket: true,
        hasEmail: true,
        activeCommIdentifierType: getInitialActiveIdentifier(attributes, isProgressiveSignUp),
        isProgressiveSignUp,
      });

      expect(res).toEqual(result);
    });

    describe('email or phone requirements with password', () => {
      type Scenario = [string, any, any];
      const scenaria: Scenario[] = [
        [
          'email optional, phone primary required with password',
          {
            ...mockDefaultAttributesProgressive,
            email_address: {
              enabled: true,
              required: false,
              used_for_first_factor: true,
            },
            phone_number: {
              enabled: true,
              required: true,
              used_for_first_factor: true,
            },
            password: {
              enabled: true,
              required: true,
            },
          },
          {
            emailAddress: {
              required: false,
              disabled: false,
            },
            phoneNumber: {
              required: true,
            },
            password: {
              required: true,
            },
          },
        ],
        [
          'phone optional, email required with password',
          {
            ...mockDefaultAttributesProgressive,
            email_address: {
              enabled: true,
              required: true,
              used_for_first_factor: true,
            },
            phone_number: {
              enabled: true,
              required: false,
              used_for_first_factor: true,
            },
            password: {
              enabled: true,
              required: true,
            },
          },
          {
            emailAddress: {
              required: true,
              disabled: false,
            },
            phoneNumber: {
              required: false,
            },
            password: {
              required: true,
            },
          },
        ],
        [
          'email and phone required with password',
          {
            ...mockDefaultAttributesProgressive,
            email_address: {
              enabled: true,
              required: true,
              used_for_first_factor: true,
            },
            phone_number: {
              enabled: true,
              required: true,
              used_for_first_factor: true,
            },
            password: {
              enabled: true,
              required: true,
            },
          },
          {
            emailAddress: {
              required: true,
              disabled: false,
            },
            phoneNumber: {
              required: true,
            },
            password: {
              required: true,
            },
          },
        ],
      ];

      it.each(scenaria)('%s', (___, attributes, result) => {
        const actualResult = determineActiveFields({
          attributes: attributes,
          activeCommIdentifierType: getInitialActiveIdentifier(attributes, isProgressiveSignUp),
          isProgressiveSignUp,
        });

        expect(actualResult).toEqual(result);
      });
    });

    describe('password security: requires communication method', () => {
      // When password is required but no communication method is explicitly required,
      // we should automatically require one for password recovery
      type Scenario = [string, any, any];
      const scenaria: Scenario[] = [
        [
          'password required, both email and phone optional and neither primary - email takes precedence',
          {
            ...mockDefaultAttributesProgressive,
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
            password: {
              enabled: true,
              required: true,
            },
          },
          {
            emailAddress: {
              required: true,
              disabled: false,
            },
            password: {
              required: true,
            },
          },
        ],
        [
          'password required, only email available - email becomes required',
          {
            ...mockDefaultAttributesProgressive,
            email_address: {
              enabled: true,
              required: false,
              used_for_first_factor: false,
            },
            phone_number: {
              enabled: false,
              required: false,
              used_for_first_factor: false,
            },
            password: {
              enabled: true,
              required: true,
            },
          },
          {
            emailAddress: {
              required: true,
              disabled: false,
            },
            password: {
              required: true,
            },
          },
        ],
        [
          'password required, only phone available - phone becomes required',
          {
            ...mockDefaultAttributesProgressive,
            email_address: {
              enabled: false,
              required: false,
              used_for_first_factor: false,
            },
            phone_number: {
              enabled: true,
              required: false,
              used_for_first_factor: false,
            },
            password: {
              enabled: true,
              required: true,
            },
          },
          {
            phoneNumber: {
              required: true,
            },
            password: {
              required: true,
            },
          },
        ],
      ];

      it.each(scenaria)('%s', (___, attributes, result) => {
        const actualResult = determineActiveFields({
          attributes: attributes,
          activeCommIdentifierType: getInitialActiveIdentifier(attributes, isProgressiveSignUp),
          isProgressiveSignUp,
        });

        expect(actualResult).toEqual(result);
      });
    });

    describe('password security: requirement follows active field in email OR phone scenarios', () => {
      // When both email and phone are optional but password is required,
      // the currently active field should become required
      it('email required when active in email OR phone scenario with password', () => {
        const attributes = {
          email_address: createAttributeData('email_address', true, false, true),
          phone_number: createAttributeData('phone_number', true, false, true),
          password: createAttributeData('password', true, true, false),
          first_name: createAttributeData('first_name', false, false, false),
          last_name: createAttributeData('last_name', false, false, false),
          username: createAttributeData('username', false, false, false),
        };

        const result = determineActiveFields({
          attributes: attributes,
          activeCommIdentifierType: 'emailAddress', // Email is currently active
          isProgressiveSignUp,
        });

        expect(result).toEqual({
          emailAddress: {
            required: true,
            disabled: false,
          },
          password: {
            required: true,
          },
        });
      });

      it('phone required when active in email OR phone scenario with password', () => {
        const attributes = {
          email_address: createAttributeData('email_address', true, false, true),
          phone_number: createAttributeData('phone_number', true, false, true),
          password: createAttributeData('password', true, true, false),
          first_name: createAttributeData('first_name', false, false, false),
          last_name: createAttributeData('last_name', false, false, false),
          username: createAttributeData('username', false, false, false),
        };

        const result = determineActiveFields({
          attributes: attributes,
          activeCommIdentifierType: 'phoneNumber', // Phone is currently active
          isProgressiveSignUp,
        });

        expect(result).toEqual({
          phoneNumber: {
            required: true,
          },
          password: {
            required: true,
          },
        });
      });
    });
  });
});

describe('determineRequiredIdentifier', () => {
  const createMinimalAttributes = (overrides: any = {}) => ({
    email_address: createAttributeData('email_address', false, false, false),
    phone_number: createAttributeData('phone_number', false, false, false),
    username: createAttributeData('username', false, false, false),
    password: createAttributeData('password', false, false, false),
    ...overrides,
  });

  describe('when password is NOT required', () => {
    it('mirrors server settings for all fields', () => {
      const attributes = createMinimalAttributes({
        password: createAttributeData('password', true, false, false), // password not required
        email_address: createAttributeData('email_address', true, true, true),
        phone_number: createAttributeData('phone_number', true, false, false),
        username: createAttributeData('username', true, true, false),
      });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: true,
        phoneShouldBeRequired: false,
        usernameShouldBeRequired: true,
      });
    });
  });

  describe('when password IS required', () => {
    const requiredPassword = { password: createAttributeData('password', true, true, false) };

    it('mirrors server settings if a communication method is already required', () => {
      const attributes = createMinimalAttributes({
        ...requiredPassword,
        email_address: createAttributeData('email_address', true, true, true),
      });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: true,
        phoneShouldBeRequired: false,
        usernameShouldBeRequired: false,
      });
    });

    it('requires nothing if no communication methods are enabled', () => {
      const attributes = createMinimalAttributes({ ...requiredPassword });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: false,
        phoneShouldBeRequired: false,
        usernameShouldBeRequired: false,
      });
    });

    it('requires email if it is the only enabled communication method', () => {
      const attributes = createMinimalAttributes({
        ...requiredPassword,
        email_address: createAttributeData('email_address', true, false, false),
      });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: true,
        phoneShouldBeRequired: false,
        usernameShouldBeRequired: false,
      });
    });

    it('requires phone if it is the only enabled communication method', () => {
      const attributes = createMinimalAttributes({
        ...requiredPassword,
        phone_number: createAttributeData('phone_number', true, false, false),
      });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: false,
        phoneShouldBeRequired: true,
        usernameShouldBeRequired: false,
      });
    });

    it('requires username if it is the only enabled communication method and a first factor', () => {
      const attributes = createMinimalAttributes({
        ...requiredPassword,
        username: createAttributeData('username', true, false, true),
      });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: false,
        phoneShouldBeRequired: false,
        usernameShouldBeRequired: true,
      });
    });

    it('defaults to requiring both email and phone if both email and phone are enabled but not required', () => {
      const attributes = createMinimalAttributes({
        ...requiredPassword,
        email_address: createAttributeData('email_address', true, false, false),
        phone_number: createAttributeData('phone_number', true, false, false),
      });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: true,
        phoneShouldBeRequired: true,
        usernameShouldBeRequired: false,
      });
    });

    it('requires email by default if no other communication methods are required by instance settings', () => {
      const attributes = createMinimalAttributes({
        ...requiredPassword,
        username: createAttributeData('username', true, false, false),
      });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: true,
        phoneShouldBeRequired: false,
        usernameShouldBeRequired: false,
      });
    });

    it('requires email when username is a non-required first factor', () => {
      const attributes = createMinimalAttributes({
        ...requiredPassword,
        email_address: createAttributeData('email_address', true, false, false),
        username: createAttributeData('username', true, false, true),
      });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: true,
        phoneShouldBeRequired: false,
        usernameShouldBeRequired: false,
      });
    });

    it('requires phone when username is a non-required first factor and email is disabled', () => {
      const attributes = createMinimalAttributes({
        ...requiredPassword,
        phone_number: createAttributeData('phone_number', true, false, false),
        username: createAttributeData('username', true, false, true),
      });
      const result = determineRequiredIdentifier(attributes);
      expect(result).toEqual({
        emailShouldBeRequired: false,
        phoneShouldBeRequired: true,
        usernameShouldBeRequired: false,
      });
    });
  });
});

describe('getInitialActiveIdentifier()', () => {
  describe('prioritizes initialValues', () => {
    it('returns phoneNumber when phoneNumber is provided in initialValues', () => {
      const attributes = {
        email_address: createAttributeData('email_address', true, true, true),
        phone_number: createAttributeData('phone_number', true, true, true),
      };
      const initialValues = { phoneNumber: '+1234567890' };

      expect(getInitialActiveIdentifier(attributes, false, initialValues)).toBe('phoneNumber');
    });

    it('returns emailAddress when emailAddress is provided in initialValues', () => {
      const attributes = {
        email_address: createAttributeData('email_address', true, true, true),
        phone_number: createAttributeData('phone_number', true, true, true),
      };
      const initialValues = { emailAddress: 'test@example.com' };

      expect(getInitialActiveIdentifier(attributes, false, initialValues)).toBe('emailAddress');
    });

    it('prioritizes emailAddress over phoneNumber when both are provided in initialValues', () => {
      const attributes = {
        email_address: createAttributeData('email_address', true, true, true),
        phone_number: createAttributeData('phone_number', true, true, true),
      };
      const initialValues = {
        phoneNumber: '+1234567890',
        emailAddress: 'test@example.com',
      };

      expect(getInitialActiveIdentifier(attributes, false, initialValues)).toBe('emailAddress');
    });

    it('handles null values in initialValues gracefully', () => {
      const attributes = {
        email_address: createAttributeData('email_address', true, true, true),
        phone_number: createAttributeData('phone_number', true, true, true),
      };
      const initialValues = {
        phoneNumber: null,
        emailAddress: null,
      };

      expect(getInitialActiveIdentifier(attributes, false, initialValues)).toBe('emailAddress');
    });
  });

  describe('falls back to attribute-based logic when no initialValues', () => {
    it('returns emailAddress when both email and phone are optional in progressive signup', () => {
      const attributes = {
        email_address: createAttributeData('email_address', true, false, true),
        phone_number: createAttributeData('phone_number', true, false, true),
      };

      expect(getInitialActiveIdentifier(attributes, true)).toBe('emailAddress');
    });

    it('returns emailAddress when email is required in progressive signup', () => {
      const attributes = {
        email_address: createAttributeData('email_address', true, true, true),
        phone_number: createAttributeData('phone_number', false, false, false),
      };

      expect(getInitialActiveIdentifier(attributes, true)).toBe('emailAddress');
    });

    it('returns phoneNumber when phone is required in progressive signup', () => {
      const attributes = {
        email_address: createAttributeData('email_address', false, false, false),
        phone_number: createAttributeData('phone_number', true, true, true),
      };

      expect(getInitialActiveIdentifier(attributes, true)).toBe('phoneNumber');
    });

    it('returns null when no identifiers are enabled', () => {
      const attributes = {
        email_address: createAttributeData('email_address', false, false, false),
        phone_number: createAttributeData('phone_number', false, false, false),
      };

      expect(getInitialActiveIdentifier(attributes, false)).toBe(null);
    });
  });
});
