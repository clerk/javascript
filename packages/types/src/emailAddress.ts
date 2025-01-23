import type { IdentificationLinkResource } from './identificationLink';
import type { ClerkResource } from './resource';
import type { EmailAddressJSONSnapshot } from './snapshots';
import type { EmailCodeStrategy, EmailLinkStrategy, EnterpriseSSOStrategy } from './strategies';
import type {
  CreateEmailLinkFlowReturn, CreateEnterpriseSsoFlowReturn,
  StartEmailLinkFlowParams, StartEnterpriseSsoLinkFlowParams,
  VerificationResource
} from './verification';


export type PrepareEmailAddressVerificationParams =
  | {
    strategy: EmailCodeStrategy;
  }
  | {
    strategy: EmailLinkStrategy;
    redirectUrl: string;
  }
  | {
    strategy: EnterpriseSSOStrategy;
    redirectUrl: string;
  };

export type AttemptEmailAddressVerificationParams = {
  code: string;
};

export interface EmailAddressResource extends ClerkResource {
  id: string;
  emailAddress: string;
  verification: VerificationResource;
  matchesEnterpriseConnection: boolean;
  linkedTo: IdentificationLinkResource[];
  toString: () => string;
  prepareVerification: (params: PrepareEmailAddressVerificationParams) => Promise<EmailAddressResource>;
  attemptVerification: (params: AttemptEmailAddressVerificationParams) => Promise<EmailAddressResource>;
  createEmailLinkFlow: () => CreateEmailLinkFlowReturn<StartEmailLinkFlowParams, EmailAddressResource>;
  createEnterpriseSsoLinkFlow: () => CreateEnterpriseSsoFlowReturn<
    StartEnterpriseSsoLinkFlowParams,
    EmailAddressResource
  >;
  destroy: () => Promise<void>;
  create: () => Promise<EmailAddressResource>;
  __internal_toSnapshot: () => EmailAddressJSONSnapshot;
}
