import { snakeToCamel } from '@clerk/shared/utils';
import type { EnvironmentResource, ToggleTypeWithRequire } from '@clerk/types';

type FieldKeys =
  | 'emailOrPhone'
  | 'emailAddress'
  | 'phoneNumber'
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'password'
  | 'invitationToken';

type Fields = {
  [key in FieldKeys]?: ToggleTypeWithRequire;
};

export function determineFirstPartyFields(
  environment: EnvironmentResource,
  hasInvitation?: boolean,
): Fields {
  const { attributes } = environment.userSettings;

  const fields = Object.entries(attributes)
    .filter(([, desc]) => desc.enabled)
    .reduce((acc, [name, desc]) => {
      const key = snakeToCamel(name) as keyof Fields;
      acc[key] = desc.required ? 'required' : 'on';
      return acc;
    }, {} as Fields);

  if (fields.emailAddress && fields.phoneNumber) {
    fields.emailOrPhone = 'required';
    delete fields.emailAddress;
    delete fields.phoneNumber;
  }

  if (hasInvitation) {
    fields.invitationToken = 'required';
  }

  return fields;
}
