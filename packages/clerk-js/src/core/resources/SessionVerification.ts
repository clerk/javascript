import type {
  SessionResource,
  SessionVerificationFirstFactor,
  SessionVerificationJSON,
  SessionVerificationLevel,
  SessionVerificationResource,
  SessionVerificationSecondFactor,
  SessionVerificationStatus,
  VerificationResource,
} from '@clerk/shared/types';
import { deepSnakeToCamel } from '@clerk/shared/underscore';

import { filterSecondFactorsForLoadedUI } from '../../utils/uiCapabilities';
import { BaseResource, Session, Verification } from './internal';

export class SessionVerification extends BaseResource implements SessionVerificationResource {
  status!: SessionVerificationStatus;
  level!: SessionVerificationLevel;
  session!: SessionResource;
  supportedFirstFactors: SessionVerificationFirstFactor[] | null = [];
  private _supportedSecondFactors: SessionVerificationSecondFactor[] | null = [];
  firstFactorVerification: VerificationResource = new Verification(null);
  secondFactorVerification: VerificationResource = new Verification(null);

  get supportedSecondFactors(): SessionVerificationSecondFactor[] | null {
    return filterSecondFactorsForLoadedUI(SessionVerification.clerk, this._supportedSecondFactors);
  }

  set supportedSecondFactors(value: SessionVerificationSecondFactor[] | null) {
    this._supportedSecondFactors = value;
  }

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
      this.supportedFirstFactors = deepSnakeToCamel(data.supported_first_factors) as
        | SessionVerificationFirstFactor[]
        | null;
      this.supportedSecondFactors = deepSnakeToCamel(data.supported_second_factors) as
        | SessionVerificationSecondFactor[]
        | null;
      this.firstFactorVerification = new Verification(data.first_factor_verification);
      this.secondFactorVerification = new Verification(data.second_factor_verification);
    }
    return this;
  }
}
