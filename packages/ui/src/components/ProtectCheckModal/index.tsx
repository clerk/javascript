import type { __internal_ProtectCheckModalProps, SignInResource, SignUpResource } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';

import { Flow } from '../../customizables';
import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { Route, Switch } from '../../router';
import { ProtectCheckCard } from '../ProtectCheck/ProtectCheckCard';

const flowOf = (resource: SignInResource | SignUpResource) =>
  resource.pathRoot.endsWith('sign_ups') ? 'signUp' : 'signIn';

const ProtectCheckModalCard = withCardStateProvider(
  ({ resource, onResolved, onFailed }: __internal_ProtectCheckModalProps) => {
    const runner = useProtectCheckRunner<SignInResource | SignUpResource>({
      getProtectCheck: () => resource.protectCheck,
      getResource: () => resource,
      reload: () => resource.reload(),
      submitProtectCheck: params => resource.submitProtectCheck(params),
      onResolved: (updated, isCanceled) => {
        if (!isCanceled() && !updated.protectCheck) {
          onResolved();
        }
        return Promise.resolve();
      },
      onError: onFailed,
    });

    return (
      <ProtectCheckCard
        flow={flowOf(resource)}
        runner={runner}
      />
    );
  },
);

function ProtectCheckModal(props: __internal_ProtectCheckModalProps): JSX.Element | null {
  const { resource, onResolved } = props;
  const isClearOnMount = useRef(!resource.protectCheck).current;
  const didReportClearRef = useRef(false);

  useEffect(() => {
    if (isClearOnMount && !didReportClearRef.current) {
      didReportClearRef.current = true;
      onResolved();
    }
  }, [isClearOnMount, onResolved]);

  if (isClearOnMount) {
    return null;
  }

  return (
    <Route path='protect-check'>
      <div>
        <Flow.Root flow='protectCheck'>
          <Switch>
            <Route index>
              <ProtectCheckModalCard {...props} />
            </Route>
          </Switch>
        </Flow.Root>
      </div>
    </Route>
  );
}

ProtectCheckModal.displayName = 'ProtectCheckModal';

export { ProtectCheckModal };
