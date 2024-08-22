import { deepSnakeToCamel } from '@clerk/shared';
import type {
  SessionResource,
  SessionVerificationJSON,
  SessionVerificationResource,
  SessionVerificationStatus,
  SignInFirstFactor,
  SignInSecondFactor,
  VerificationResource,
} from '@clerk/types';

import { BaseResource, Session, Verification } from './internal';

export class SessionVerification extends BaseResource implements SessionVerificationResource {
  status!: SessionVerificationStatus;
  level!: 'L1.firstFactor' | 'L2.secondFactor' | 'L3.multiFactor';
  session!: SessionResource;
  supportedFirstFactors: SignInFirstFactor[] = [];
  supportedSecondFactors: SignInSecondFactor[] = [];
  firstFactorVerification: VerificationResource = new Verification(null);
  secondFactorVerification: VerificationResource = new Verification(null);

  constructor(data: SessionVerificationJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: SessionVerificationJSON | null): this {
    if (data) {
      this.id = data.id;
      this.status = data.status;
      this.session = new Session(data.session);
      this.level = data.level;
      this.supportedFirstFactors = deepSnakeToCamel(data.supported_first_factors) as SignInFirstFactor[];
      this.supportedSecondFactors = deepSnakeToCamel(data.supported_second_factors) as SignInSecondFactor[];
      this.firstFactorVerification = new Verification(data.first_factor_verification);
      this.secondFactorVerification = new Verification(data.second_factor_verification);
    }
    return this;
  }
}
