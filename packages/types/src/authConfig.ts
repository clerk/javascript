import { EmailAddressVerificationStrategy } from './emailAddress';
import { ClerkResource } from './resource';
import { IdentificationStrategy, SignInStrategyName } from './signIn';

/**
 * Authentication configuration attributes set.
 */

export interface AuthConfigResource extends ClerkResource {
  id: string;

  firstName: ToggleTypeWithRequire;

  lastName: ToggleTypeWithRequire;

  emailAddress: ToggleType;

  phoneNumber: ToggleType;

  username: ToggleType;

  password: string;

  /**
   * Types of identification strategies selected.
   */
  identificationStrategies: IdentificationStrategy[];

  /**
   * Combinations of strategies.
   */
  identificationRequirements: IdentificationStrategy[][];

  passwordConditions: any;

  /**
   * Type of first factor authentication used.
   */
  firstFactors: SignInStrategyName[];

  /**
   * Type of second factor authentication used.
   */
  secondFactors: SignInStrategyName[];

  /**
   * All the verification strategies that can be used in
   * this instance to verify an email address.
   */
  emailAddressVerificationStrategies: EmailAddressVerificationStrategy[];

  /**
   * Enabled single session configuration at the instance level.
   */
  singleSessionMode: boolean;
}

export type ToggleType = 'on' | 'off';

export type ToggleTypeWithRequire = ToggleType | 'required';
