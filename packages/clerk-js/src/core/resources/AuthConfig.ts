import type {
  AuthConfigJSON,
  AuthConfigResource,
  EmailAddressVerificationStrategy,
  IdentificationStrategy,
  SignInStrategyName,
  ToggleType,
  ToggleTypeWithRequire,
} from '@clerk/types';

import { BaseResource } from './internal';

export class AuthConfig extends BaseResource implements AuthConfigResource {
  id!: string;
  firstName!: ToggleTypeWithRequire;
  lastName!: ToggleTypeWithRequire;
  emailAddress!: ToggleType;
  phoneNumber!: ToggleType;
  username!: ToggleType;
  password!: string;
  identificationStrategies!: IdentificationStrategy[];
  identificationRequirements!: IdentificationStrategy[][];
  passwordConditions!: any;
  firstFactors!: SignInStrategyName[];
  secondFactors!: SignInStrategyName[];
  emailAddressVerificationStrategies!: EmailAddressVerificationStrategy[];
  singleSessionMode!: boolean;

  public constructor(data: AuthConfigJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: AuthConfigJSON): this {
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.emailAddress = data.email_address;
    this.phoneNumber = data.phone_number;
    this.username = data.username;
    this.password = data.password;
    this.identificationStrategies = data.identification_strategies;
    this.identificationRequirements = data.identification_requirements;
    this.passwordConditions = data.password_conditions;
    this.firstFactors = data.first_factors;
    this.secondFactors = data.second_factors;
    this.emailAddressVerificationStrategies =
      data.email_address_verification_strategies;
    this.singleSessionMode = data.single_session_mode;

    return this;
  }
}
