import { snakeToCamel } from '@clerk/shared/utils';
import type { Attributes, EnvironmentResource } from '@clerk/types';

type FieldKeys =
  | 'emailOrPhone'
  | 'emailAddress'
  | 'phoneNumber'
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'password'
  | 'invitationToken';

// TODO: Refactor SignUp component and remove
// this leftover type
type Fields = {
  [key in FieldKeys]?: 'on' | 'off' | 'required';
};

function isEmailOrPhone(attributes: Attributes) {
  return attributes.email_address.used_for_first_factor && attributes.phone_number.used_for_first_factor;
}

export function determineFirstPartyFields(environment: EnvironmentResource, hasInvitation?: boolean): Fields {
  const {attributes} = environment.userSettings;
  const fields: Fields = {};

  Object.entries(attributes)
    .filter(([key]) => ['username', 'first_name', 'last_name'].includes(key))
    .filter(([, desc]) => desc.enabled)
    .forEach(([key, desc]) => (fields[snakeToCamel(key) as keyof Fields] = desc.required ? 'required' : 'on'));

  if (hasInvitation) {
    fields.invitationToken = 'required';
  } else if (isEmailOrPhone(attributes)) {
    fields.emailOrPhone = 'required';
  } else if (attributes.email_address.used_for_first_factor) {
    fields.emailAddress = 'required';
  } else if (attributes.phone_number.used_for_first_factor) {
    fields.phoneNumber = 'required';
  }

  if (attributes.password.required) {
    fields.password = 'required';
  }

  return fields;
}
