import { useClerk, useSession } from '@clerk/shared/react';
import type { VerificationStrategy } from '@clerk/shared/types';

import { MfaForm } from '@/components/UserProfile/MfaForm';
import { useSessionTasksContext, useTaskSetupMfaContext } from '@/contexts/components/SessionTasks';
import { Action } from '@/elements/Action';
import { useRouter } from '@/router';
import { Card } from '@/ui/elements/Card';

import { SharedFooterActionForSignOut } from './shared';

export function MfaFormForSessionTasks(props: { verificationStrategy: VerificationStrategy }) {
  const clerk = useClerk();
  const { session } = useSession();
  const { navigate } = useRouter();
  const { redirectUrlComplete } = useTaskSetupMfaContext();
  const { navigateOnSetActive } = useSessionTasksContext();

  return (
    <Card.Root>
      <Card.Content>
        <Action.Root>
          <MfaForm
            selectedStrategy={props.verificationStrategy}
            onSuccess={() => {
              void clerk.setActive({
                session: session?.id,
                navigate: async ({ session }) => {
                  await navigateOnSetActive?.({ session, redirectUrlComplete });
                },
              });
            }}
            onReset={() => {
              void navigate(`../`);
            }}
          />
        </Action.Root>
      </Card.Content>
      <Card.Footer>
        <SharedFooterActionForSignOut />
      </Card.Footer>
    </Card.Root>
  );
}
