import { determineActiveFields, getInitialActiveIdentifier } from './signUpFormHelpers';

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
            show: true,
          },
          phoneNumber: {
            required: true,
            show: false,
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
          emailAddress: {
            required: true,
            disabled: false,
            show: false,
          },
          phoneNumber: {
            required: true,
            show: true,
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
            show: true,
          },
          phoneNumber: {
            required: true,
            show: false,
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
          emailAddress: {
            required: true,
            disabled: false,
            show: false,
          },
          phoneNumber: {
            required: true,
            show: false,
          },
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
        {
          emailAddress: {
            required: true,
            disabled: false,
            show: false,
          },
          phoneNumber: {
            required: true,
            show: false,
          },
        },
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
            show: true,
          },
          phoneNumber: {
            required: false,
            show: false,
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
          emailAddress: {
            required: false,
            disabled: false,
            show: false,
          },
          phoneNumber: {
            required: true,
            show: true,
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
            show: true,
          },
          phoneNumber: {
            required: true,
            show: true,
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
            show: true,
          },
          phoneNumber: {
            required: false,
            show: false,
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
            show: true,
          },
          phoneNumber: {
            required: false,
            show: true,
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
            show: true,
          },
          phoneNumber: {
            required: true,
            show: true,
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
  });
});
