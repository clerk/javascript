import type {
  EnvironmentResource,
  IdentificationStrategy,
  SignInStrategyName,
  ToggleTypeWithRequire,
} from '@clerk/types';

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
  const idRequirements = environment.authConfig.identificationRequirements.flat();
  const fields: Fields = {};

  const idByEmail = idRequirements.includes('email_address');
  const idByPhone = idRequirements.includes('phone_number');
  const idByEmailOrPhone = idByEmail && idByPhone;
  const idByUsername =
    idRequirements.includes('username') ||
    environment.authConfig.username === 'on';
  if (hasInvitation) {
    fields.invitationToken = 'required';
  } else if (idByEmailOrPhone) {
    fields.emailOrPhone = 'required';
  } else if (idByEmail) {
    fields.emailAddress = 'required';
  } else if (idByPhone) {
    fields.phoneNumber = 'required';
  }

  if (idByEmailOrPhone || idByEmail || idByPhone) {
    if (idByUsername) {
      fields.username = environment.authConfig.username;
    }

    if (environment.authConfig.password === 'required') {
      fields.password = environment.authConfig.password;
    }

    if (['on', 'required'].includes(environment.authConfig.firstName)) {
      fields.firstName = environment.authConfig.firstName;
    }
    if (['on', 'required'].includes(environment.authConfig.lastName)) {
      fields.lastName = environment.authConfig.lastName;
    }
  }

  return fields;
}

export function determineOauthOptions(
  environment: EnvironmentResource,
): IdentificationStrategy[] {
  const idRequirements = [
    ...new Set(environment.authConfig.identificationRequirements.flat()),
  ];
  return idRequirements.filter(fac => fac.startsWith('oauth')).sort();
}

export function determineWeb3Options(
  environment: EnvironmentResource,
): SignInStrategyName[] {
  const idRequirements = [...new Set(environment.authConfig.firstFactors)];
  return idRequirements.filter(fac => fac.startsWith('web3')).sort();
}
