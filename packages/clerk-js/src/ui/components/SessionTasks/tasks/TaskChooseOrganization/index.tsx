import {
  useClerk,
  useOrganizationCreationDefaults,
  useOrganizationList,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type { OrganizationCreationDefaultsResource } from '@clerk/shared/types';
import { useEffect, useRef, useState } from 'react';

import { useSignOutContext, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { useSessionTasksContext, useTaskChooseOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import { descriptors, Flex, Flow, localizationKeys, Spinner } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';
import { useOrganizationListInView } from '@/ui/hooks/useOrganizationListInView';
import { handleError } from '@/ui/utils/errorHandler';

import { withTaskGuard } from '../shared';
import { ChooseOrganizationScreen } from './ChooseOrganizationScreen';
import { CreateOrganizationScreen } from './CreateOrganizationScreen';

const LoadingCardContent = () => (
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
);

const TaskChooseOrganizationInternal = () => {
  const card = useCardState();
  const { user } = useUser();
  const { userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const organizationCreationDefaults = useOrganizationCreationDefaults();
  const { isLoaded: isOrganizationListLoaded, setActive } = useOrganizationList();
  const { navigateOnSetActive } = useSessionTasksContext();
  const { redirectUrlComplete } = useTaskChooseOrganizationContext();

  const exclusiveOrganization = user?.organizationMemberships?.find(
    membership => membership.organization.exclusiveMembership === true,
  )?.organization;

  const hasAutoActivated = useRef(false);
  const [autoActivateFailed, setAutoActivateFailed] = useState(false);
  const shouldAutoActivate = !!exclusiveOrganization && !autoActivateFailed;

  // Exclusive members belong to a single org — skip the picker and activate it once the org list is ready.
  // On failure, surface the error and fall back to the normal choose/create flows.
  useEffect(() => {
    if (!exclusiveOrganization || autoActivateFailed || !isOrganizationListLoaded || hasAutoActivated.current) {
      return;
    }

    hasAutoActivated.current = true;

    void (async () => {
      try {
        await setActive({
          organization: exclusiveOrganization,
          navigate: async ({ session }) => {
            await navigateOnSetActive?.({ session, redirectUrlComplete });
          },
        });
      } catch (err: any) {
        handleError(err, [], card.setError);
        setAutoActivateFailed(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exclusiveOrganization, autoActivateFailed, isOrganizationListLoaded]);

  const isLoading =
    userMemberships?.isLoading ||
    userInvitations?.isLoading ||
    userSuggestions?.isLoading ||
    organizationCreationDefaults?.isLoading;
  const hasExistingResources = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);
  const isOrganizationCreationDisabled =
    !isLoading &&
    !user?.createOrganizationEnabled &&
    user?.organizationMemberships?.length === 0 &&
    !hasExistingResources;

  if (isOrganizationCreationDisabled && !shouldAutoActivate) {
    return <OrganizationCreationDisabledScreen />;
  }

  return (
    <Flow.Root flow='taskChooseOrganization'>
      <Flow.Part part='chooseOrganization'>
        <Card.Root>
          <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}`, gap: t.space.$7 })}>
            {shouldAutoActivate || isLoading ? (
              <LoadingCardContent />
            ) : (
              <TaskChooseOrganizationFlows
                initialFlow={hasExistingResources ? 'choose' : 'create'}
                organizationCreationDefaults={organizationCreationDefaults.data}
              />
            )}
          </Card.Content>

          <TaskChooseOrganizationCardFooter />
        </Card.Root>
      </Flow.Part>
    </Flow.Root>
  );
};

const TaskChooseOrganizationCardFooter = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();

  const handleSignOut = () => {
    if (otherSessions.length === 0) {
      return signOut(navigateAfterSignOut);
    }

    return signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session?.id });
  };

  const identifier = user?.primaryEmailAddress?.emailAddress ?? user?.username;

  return (
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
  );
};

type TaskChooseOrganizationFlowsProps = {
  initialFlow: 'create' | 'choose';
  organizationCreationDefaults?: OrganizationCreationDefaultsResource | null;
};

const TaskChooseOrganizationFlows = withCardStateProvider((props: TaskChooseOrganizationFlowsProps) => {
  const [currentFlow, setCurrentFlow] = useState(props.initialFlow);

  if (currentFlow === 'create') {
    return (
      <CreateOrganizationScreen
        onCancel={props.initialFlow === 'choose' ? () => setCurrentFlow('choose') : undefined}
        organizationCreationDefaults={props.organizationCreationDefaults}
      />
    );
  }

  return <ChooseOrganizationScreen onCreateOrganizationClick={() => setCurrentFlow('create')} />;
});

function OrganizationCreationDisabledScreen() {
  return (
    <Flow.Root flow='taskChooseOrganization'>
      <Flow.Part part='organizationCreationDisabled'>
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title
                localizationKey={localizationKeys('taskChooseOrganization.organizationCreationDisabled.title')}
              />
              <Header.Subtitle
                localizationKey={localizationKeys('taskChooseOrganization.organizationCreationDisabled.subtitle')}
              />
            </Header.Root>
          </Card.Content>

          <TaskChooseOrganizationCardFooter />
        </Card.Root>
      </Flow.Part>
    </Flow.Root>
  );
}

export const TaskChooseOrganization = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskChooseOrganizationInternal), 'choose-organization'),
);
