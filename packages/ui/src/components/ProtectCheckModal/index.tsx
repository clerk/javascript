import { isClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { __internal_ProtectCheckModalProps, SignInResource, SignUpResource } from '@clerk/shared/types';

import { withCardStateProvider } from '@/ui/elements/contexts';

import { ProtectCheckCard } from '../../common';
import { Flow } from '../../customizables';
import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { Route, Switch } from '../../router';

const flowOf = (resource: SignInResource | SignUpResource) =>
  resource.pathRoot.endsWith('sign_ups') ? 'signUp' : 'signIn';

const ProtectCheckModalCard = withCardStateProvider(
  ({ resource, onResolved, onFailed }: __internal_ProtectCheckModalProps) => {
    const runner = useProtectCheckRunner<SignInResource | SignUpResource>({
      getProtectCheck: () => resource.protectCheck,
      getResource: () => resource,
      reload: () => resource.reload(),
      submitProtectCheck: params =>
        resource.submitProtectCheck(params).catch((error: unknown) => {
          if (isClerkAPIResponseError(error) && error.errors[0]?.code === ERROR_CODES.FRAUD_ACTION_BLOCKED) {
            onFailed(error);
          }
          throw error;
        }),
      onResolved: (updated, isCancelled) => {
        if (!isCancelled() && !updated.protectCheck) {
          onResolved();
        }
        return Promise.resolve();
      },
    });

    return (
      <ProtectCheckCard
        flow={flowOf(resource)}
        runner={runner}
      />
    );
  },
);

function ProtectCheckModal(props: __internal_ProtectCheckModalProps): JSX.Element {
  return (
    <Route path='protect-check'>
      <Flow.Root flow='protectCheck'>
        <Switch>
          <Route index>
            <ProtectCheckModalCard {...props} />
          </Route>
        </Switch>
      </Flow.Root>
    </Route>
  );
}

ProtectCheckModal.displayName = 'ProtectCheckModal';

export { ProtectCheckModal };
