import { deepSnakeToCamel } from '@clerk/shared/underscore';
import type {
  SessionResource,
  SessionVerificationFirstFactor,
  SessionVerificationJSON,
  SessionVerificationLevel,
  SessionVerificationResource,
  SessionVerificationSecondFactor,
  SessionVerificationStatus,
  VerificationResource,
} from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';
import { Session } from './Session';
import { Verification } from './Verification';

export class SessionVerification extends BaseResource implements SessionVerificationResource {
  status!: SessionVerificationStatus;
  level!: SessionVerificationLevel;
  session!: SessionResource;
  supportedFirstFactors: SessionVerificationFirstFactor[] | null = [];
  supportedSecondFactors: SessionVerificationSecondFactor[] | null = [];
  firstFactorVerification: VerificationResource = new Verification(null);
  secondFactorVerification: VerificationResource = new Verification(null);

  constructor(data: SessionVerificationJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: SessionVerificationJSON | null): this {
    if (!data) {
      return this;
    }

    Object.assign(
      this,
      parseJSON<SessionVerificationResource>(data, {
        nestedFields: {
          session: Session,
          firstFactorVerification: Verification,
          secondFactorVerification: Verification,
        },
        customTransforms: {
          supportedFirstFactors: value => deepSnakeToCamel(value) as SessionVerificationFirstFactor[] | null,
          supportedSecondFactors: value => deepSnakeToCamel(value) as SessionVerificationSecondFactor[] | null,
        },
      }),
    );
    return this;
  }
}
