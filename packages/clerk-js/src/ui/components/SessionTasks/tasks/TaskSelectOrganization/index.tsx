import { useClerk, useSession, useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { useSignOutContext, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { descriptors, Flex, Flow, localizationKeys, Spinner } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';
import { useOrganizationListInView } from '@/ui/hooks/useOrganizationListInView';

import { withTaskGuard } from '../withTaskGuard';
import { CreateOrganizationScreen } from './CreateOrganizationScreen';
import { SelectOrganizationScreen } from './SelectOrganizationScreen';

const TaskSelectOrganizationInternal = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();

  const handleSignOut = () => {
    if (otherSessions.length === 0) {
      return signOut(navigateAfterSignOut);
    }

    return signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session?.id });
  };

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasExistingResources = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);
  const identifier = user?.primaryEmailAddress?.emailAddress ?? user?.username;

  return (
    <Flow.Root flow='taskSelectOrganization'>
      <Card.Root>
        <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}`, gap: t.space.$7 })}>
          {isLoading ? (
            <Flex
              direction={'row'}
              align={'center'}
              justify={'center'}
              sx={t => ({
                height: '100%',
                minHeight: t.sizes.$100,
              })}
            >
              <Spinner
                size={'lg'}
                colorScheme={'primary'}
                elementDescriptor={descriptors.spinner}
              />
            </Flex>
          ) : (
            <TaskSelectOrganizationFlows initialFlow={hasExistingResources ? 'select' : 'create'} />
          )}
        </Card.Content>

        <Card.Footer>
          <Card.Action
            elementId='signOut'
            gap={2}
            justify='center'
            sx={() => ({ width: '100%' })}
          >
            {identifier && (
              <Card.ActionText
                truncate
                localizationKey={localizationKeys('taskSelectOrganization.signOut.actionText', {
                  identifier,
                })}
              />
            )}
            <Card.ActionLink
              sx={() => ({ flexShrink: 0 })}
              onClick={handleSignOut}
              localizationKey={localizationKeys('taskSelectOrganization.signOut.actionLink')}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Root>
  );
};

type TaskSelectOrganizationFlowsProps = {
  initialFlow: 'create' | 'select';
};

const TaskSelectOrganizationFlows = withCardStateProvider((props: TaskSelectOrganizationFlowsProps) => {
  const [currentFlow, setCurrentFlow] = useState(props.initialFlow);

  if (currentFlow === 'create') {
    return (
      <CreateOrganizationScreen
        onCancel={props.initialFlow === 'select' ? () => setCurrentFlow('select') : undefined}
      />
    );
  }

  return <SelectOrganizationScreen onCreateOrganizationClick={() => setCurrentFlow('create')} />;
});

export const TaskSelectOrganization = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskSelectOrganizationInternal)),
);
