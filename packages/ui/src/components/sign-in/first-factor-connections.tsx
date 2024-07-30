import { useSignIn } from '@clerk/clerk-react';

import { Connections } from '~/common/connections';
import { useLocalizations } from '~/hooks/use-localizations';
import { Separator } from '~/primitives/separator';

export function FirstFactorConnections({
  isGlobalLoading,
  hasConnection,
}: {
  isGlobalLoading: boolean;
  hasConnection: boolean;
}) {
  const { t } = useLocalizations();
  const { signIn } = useSignIn();
  const isFirstFactor = signIn?.status === 'needs_first_factor';

  if (isFirstFactor) {
    return (
      <>
        <Connections disabled={isGlobalLoading} />
        {hasConnection ? <Separator>{t('dividerText')}</Separator> : null}
      </>
    );
  }
  return null;
}
