import { deepSnakeToCamel } from '@clerk/shared/underscore';
import type {
  __experimental_SessionVerificationFirstFactor,
  __experimental_SessionVerificationJSON,
  __experimental_SessionVerificationLevel,
  __experimental_SessionVerificationResource,
  __experimental_SessionVerificationSecondFactor,
  __experimental_SessionVerificationStatus,
  SessionResource,
  VerificationResource,
} from '@clerk/types';

import { BaseResource, Session, Verification } from './internal';

export class SessionVerification extends BaseResource implements __experimental_SessionVerificationResource {
  status!: __experimental_SessionVerificationStatus;
  level!: __experimental_SessionVerificationLevel;
  session!: SessionResource;
  supportedFirstFactors: __experimental_SessionVerificationFirstFactor[] | null = [];
  supportedSecondFactors: __experimental_SessionVerificationSecondFactor[] | null = [];
  firstFactorVerification: VerificationResource = new Verification(null);
  secondFactorVerification: VerificationResource = new Verification(null);

  constructor(data: __experimental_SessionVerificationJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: __experimental_SessionVerificationJSON | null): this {
    if (data) {
      this.id = data.id;
      this.status = data.status;
      this.session = new Session(data.session);
      this.level = data.level;
      this.supportedFirstFactors = deepSnakeToCamel(data.supported_first_factors) as
        | __experimental_SessionVerificationFirstFactor[]
        | null;
      this.supportedSecondFactors = deepSnakeToCamel(data.supported_second_factors) as
        | __experimental_SessionVerificationSecondFactor[]
        | null;
      this.firstFactorVerification = new Verification(data.first_factor_verification);
      this.secondFactorVerification = new Verification(data.second_factor_verification);
    }
    return this;
  }
}
