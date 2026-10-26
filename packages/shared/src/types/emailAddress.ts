import type { IdentificationLinkResource } from './identificationLink';
import type { ClerkResource } from './resource';
import type { EmailAddressJSONSnapshot } from './snapshots';
import type { EmailCodeStrategy, EmailLinkStrategy, EnterpriseSSOStrategy } from './strategies';
import type {
  CreateEmailLinkFlowReturn,
  CreateEnterpriseSSOLinkFlowReturn,
  StartEmailLinkFlowParams,
  StartEnterpriseSSOLinkFlowParams,
  VerificationResource,
} from './verification';

export type PrepareEmailAddressVerificationParams =
  | {
      strategy: EmailCodeStrategy;
    }
  | {
      strategy: EmailLinkStrategy | EnterpriseSSOStrategy;
      redirectUrl: string;
    };

export type AttemptEmailAddressVerificationParams = {
  code: string;
};

export interface EmailAddressResource extends ClerkResource {
  id: string;
  emailAddress: string;
  verification: VerificationResource;
  matchesSsoConnection: boolean;
  linkedTo: IdentificationLinkResource[];
  toString: () => string;
  prepareVerification: (params: PrepareEmailAddressVerificationParams) => Promise<EmailAddressResource>;
  attemptVerification: (params: AttemptEmailAddressVerificationParams) => Promise<EmailAddressResource>;
  createEmailLinkFlow: () => CreateEmailLinkFlowReturn<StartEmailLinkFlowParams, EmailAddressResource>;
  createEnterpriseSSOLinkFlow: () => CreateEnterpriseSSOLinkFlowReturn<
    StartEnterpriseSSOLinkFlowParams,
    EmailAddressResource
  >;
  destroy: () => Promise<void>;
  create: () => Promise<EmailAddressResource>;
  __internal_toSnapshot: () => EmailAddressJSONSnapshot;
}
