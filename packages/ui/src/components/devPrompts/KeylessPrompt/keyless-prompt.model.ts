import { useUser } from '@clerk/shared/react';
import { useMemo } from 'react';

import { handleDashboardUrlParsing } from '../shared';
import { useRevalidateEnvironment } from './use-revalidate-environment';

export type KeylessPromptProps = {
  claimUrl: string;
  copyKeysUrl: string;
  onDismiss: (() => Promise<unknown>) | undefined | null;
};

export const dismissKeylessPrompt = (onDismiss: KeylessPromptProps['onDismiss']) => {
  void onDismiss?.().then(() => {
    window.location.reload();
  });
};

/**
 * If we cannot reconstruct the url properly, then simply fallback to Clerk Dashboard
 */
function withLastActiveFallback(callback: () => string): string {
  try {
    return callback();
  } catch {
    return 'https://dashboard.clerk.com/~';
  }
}

export const useKeylessPromptModel = (props: KeylessPromptProps) => {
  const environment = useRevalidateEnvironment();
  const { isSignedIn } = useUser();
  const claimed = Boolean(environment.authConfig.claimedAt);
  const appName = environment.displayConfig.applicationName;

  const claimUrlToDashboard = useMemo(() => {
    if (claimed) {
      return props.copyKeysUrl;
    }
    const url = new URL(props.claimUrl);
    url.searchParams.append('return_url', window.location.href);
    return url.href;
  }, [claimed, props.copyKeysUrl, props.claimUrl]);

  const instanceUrlToDashboard = useMemo(() => {
    return withLastActiveFallback(() => {
      const redirectUrlParts = handleDashboardUrlParsing(props.copyKeysUrl);
      const url = new URL(
        `${redirectUrlParts.baseDomain}/apps/${redirectUrlParts.appId}/instances/${redirectUrlParts.instanceId}/user-authentication/email-phone-username`,
      );
      return url.href;
    });
  }, [props.copyKeysUrl]);

  return {
    claimed,
    isSignedIn: Boolean(isSignedIn),
    appName,
    claimUrlToDashboard,
    instanceUrlToDashboard,
    onDismiss: props.onDismiss,
  };
};
