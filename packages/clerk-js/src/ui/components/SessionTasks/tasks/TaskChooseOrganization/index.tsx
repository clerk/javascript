import { useClerk, useSession, useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { useSignOutContext, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { descriptors, Flex, Flow, localizationKeys, Spinner } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';
import { useOrganizationListInView } from '@/ui/hooks/useOrganizationListInView';

import { ChooseOrganizationScreen } from './ChooseOrganizationScreen';
import { CreateOrganizationScreen } from './CreateOrganizationScreen';
import { withTaskGuard } from './withTaskGuard';

const TaskChooseOrganizationInternal = () => {
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
    <Flow.Root flow='taskChooseOrganization'>
      <Flow.Part part='chooseOrganization'>
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
              <TaskChooseOrganizationFlows initialFlow={hasExistingResources ? 'choose' : 'create'} />
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
                  localizationKey={localizationKeys('taskChooseOrganization.signOut.actionText', {
                    identifier,
                  })}
                />
              )}
              <Card.ActionLink
                sx={() => ({ flexShrink: 0 })}
                onClick={handleSignOut}
                localizationKey={localizationKeys('taskChooseOrganization.signOut.actionLink')}
              />
            </Card.Action>
          </Card.Footer>
        </Card.Root>
      </Flow.Part>
    </Flow.Root>
  );
};

type TaskChooseOrganizationFlowsProps = {
  initialFlow: 'create' | 'choose';
};

const TaskChooseOrganizationFlows = withCardStateProvider((props: TaskChooseOrganizationFlowsProps) => {
  const [currentFlow, setCurrentFlow] = useState(props.initialFlow);

  if (currentFlow === 'create') {
    return (
      <CreateOrganizationScreen
        onCancel={props.initialFlow === 'choose' ? () => setCurrentFlow('choose') : undefined}
      />
    );
  }

  return <ChooseOrganizationScreen onCreateOrganizationClick={() => setCurrentFlow('create')} />;
});

export const TaskChooseOrganization = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskChooseOrganizationInternal)),
);
