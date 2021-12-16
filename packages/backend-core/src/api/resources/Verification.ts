import type { VerificationJSON } from './JSON';
import type { VerificationProps } from './Props';

interface VerificationPayload extends VerificationProps {}

export interface Verification extends VerificationPayload {}

export class Verification {
  static attributes = [
    'status',
    'strategy',
    'externalVerificationRedirectURL',
    'attempts',
    'expireAt',
  ];

  static defaults = {};

  constructor(data: Partial<VerificationPayload> = {}) {
    Object.assign(this, Verification.defaults, data);
  }

  static fromJSON(data: VerificationJSON | null): Verification {
    const obj: Record<string, any> = {};

    if (data) {
      obj.status = data.status;
      obj.strategy = data.strategy;

      if (data.external_verification_redirect_url) {
        obj.externalVerificationRedirectURL = new URL(
          data.external_verification_redirect_url
        );
      } else {
        obj.externalVerificationRedirectURL = null;
      }
      obj.attempts = data.attempts;
      obj.expireAt = data.expire_at;
    } else {
      obj.status = null;
      obj.strategy = null;
      obj.externalVerificationRedirectURL = null;
      obj.attempts = null;
      obj.expireAt = null;
    }

    return new Verification(obj as VerificationPayload);
  }
}
