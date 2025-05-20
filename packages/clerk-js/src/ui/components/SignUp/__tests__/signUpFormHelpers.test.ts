import { determineActiveFields, getInitialActiveIdentifier } from '../signUpFormHelpers';

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
  });
});

describe('getInitialActiveIdentifier()', () => {
  describe('prioritizes initialValues', () => {
    it('returns phoneNumber when phoneNumber is provided in initialValues', () => {
      const attributes = {
        email_address: { enabled: true, required: true },
        phone_number: { enabled: true, required: true },
      };
      const initialValues = { phoneNumber: '+1234567890' };

      expect(getInitialActiveIdentifier(attributes, false, initialValues)).toBe('phoneNumber');
    });

    it('returns emailAddress when emailAddress is provided in initialValues', () => {
      const attributes = {
        email_address: { enabled: true, required: true },
        phone_number: { enabled: true, required: true },
      };
      const initialValues = { emailAddress: 'test@example.com' };

      expect(getInitialActiveIdentifier(attributes, false, initialValues)).toBe('emailAddress');
    });

    it('prioritizes phoneNumber over emailAddress when both are provided in initialValues', () => {
      const attributes = {
        email_address: { enabled: true, required: true },
        phone_number: { enabled: true, required: true },
      };
      const initialValues = {
        phoneNumber: '+1234567890',
        emailAddress: 'test@example.com',
      };

      expect(getInitialActiveIdentifier(attributes, false, initialValues)).toBe('phoneNumber');
    });
  });

  describe('handles emailOrPhone scenario', () => {
    it('returns emailAddress when both email and phone are optional in progressive signup', () => {
      const attributes = {
        email_address: { enabled: true, required: false },
        phone_number: { enabled: true, required: false },
      };

      expect(getInitialActiveIdentifier(attributes, true)).toBe('emailAddress');
    });

    it('returns emailAddress when both email and phone are used for first factor', () => {
      const attributes = {
        email_address: { enabled: true, used_for_first_factor: true },
        phone_number: { enabled: true, used_for_first_factor: true },
      };

      expect(getInitialActiveIdentifier(attributes, false)).toBe('emailAddress');
    });
  });

  describe('handles single identifier scenarios', () => {
    it('returns emailAddress when only email is enabled and required in progressive signup', () => {
      const attributes = {
        email_address: { enabled: true, required: true },
        phone_number: { enabled: false },
      };

      expect(getInitialActiveIdentifier(attributes, true)).toBe('emailAddress');
    });

    it('returns phoneNumber when only phone is enabled and required in progressive signup', () => {
      const attributes = {
        email_address: { enabled: false },
        phone_number: { enabled: true, required: true },
      };

      expect(getInitialActiveIdentifier(attributes, true)).toBe('phoneNumber');
    });

    it('returns emailAddress when email is used for first factor', () => {
      const attributes = {
        email_address: { enabled: true, used_for_first_factor: true },
        phone_number: { enabled: false },
      };

      expect(getInitialActiveIdentifier(attributes, false)).toBe('emailAddress');
    });

    it('returns phoneNumber when phone is used for first factor', () => {
      const attributes = {
        email_address: { enabled: false },
        phone_number: { enabled: true, used_for_first_factor: true },
      };

      expect(getInitialActiveIdentifier(attributes, false)).toBe('phoneNumber');
    });
  });

  describe('handles edge cases', () => {
    it('returns null when no identifiers are enabled', () => {
      const attributes = {
        email_address: { enabled: false },
        phone_number: { enabled: false },
      };

      expect(getInitialActiveIdentifier(attributes, false)).toBe(null);
    });

    it('returns null when no identifiers are used for first factor', () => {
      const attributes = {
        email_address: { enabled: true, used_for_first_factor: false },
        phone_number: { enabled: true, used_for_first_factor: false },
      };

      expect(getInitialActiveIdentifier(attributes, false)).toBe(null);
    });
  });
});
