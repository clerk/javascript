import { getClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';

import { EmailLinkStatusCard } from '../../common';
import type { EmailLinkUIStatus } from '../../common/EmailLinkStatusCard';
import { localizationKeys } from '../../customizables';
import { withCardStateProvider } from '../../elements/contexts';

const supportedStatuses = new Set<EmailLinkUIStatus>(['verified', 'expired', 'failed', 'client_mismatch']);

const texts = {
  verified: {
    title: localizationKeys('reverification.emailLink.verified.title'),
    subtitle: localizationKeys('reverification.emailLink.verified.subtitle'),
  },
  expired: {
    title: localizationKeys('reverification.emailLink.expired.title'),
    subtitle: localizationKeys('reverification.emailLink.expired.subtitle'),
  },
  failed: {
    title: localizationKeys('reverification.emailLink.failed.title'),
    subtitle: localizationKeys('reverification.emailLink.failed.subtitle'),
  },
  client_mismatch: {
    title: localizationKeys('reverification.emailLink.clientMismatch.title'),
    subtitle: localizationKeys('reverification.emailLink.clientMismatch.subtitle'),
  },
} as const;

export const UserVerificationEmailLinkVerify = withCardStateProvider(() => {
  const queryStatus = getClerkQueryParam('__clerk_status') as EmailLinkUIStatus | null;
  const status = queryStatus && supportedStatuses.has(queryStatus) ? queryStatus : 'failed';
  const text = texts[status as keyof typeof texts];

  return (
    <EmailLinkStatusCard
      title={text.title}
      subtitle={text.subtitle}
      status={status}
    />
  );
});
