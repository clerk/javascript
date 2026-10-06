import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { parsePublishableKey } from '@clerk/shared/keys';

import { LiveOverview } from './live-overview';

function deploymentFromKey(publishableKey: string): { label: string; dashboardUrl: string | null } {
  switch (apiUrlFromPublishableKey(publishableKey)) {
    case 'https://api.clerkstage.dev':
      return { label: 'staging', dashboardUrl: 'https://dashboard.clerkstage.dev' };
    case 'https://api.lclclerk.com':
      return { label: 'local', dashboardUrl: null };
    default:
      return { label: 'production', dashboardUrl: 'https://dashboard.clerk.com' };
  }
}

export default function LivePage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const key = parsePublishableKey(publishableKey);

  return (
    <LiveOverview
      frontendApi={key?.frontendApi ?? null}
      instanceType={key?.instanceType ?? null}
      hasSecretKey={Boolean(process.env.CLERK_SECRET_KEY)}
      dashboardUrl={process.env.SWINGSET_DASHBOARD_URL ?? null}
      deployment={key && publishableKey ? deploymentFromKey(publishableKey) : null}
    />
  );
}
