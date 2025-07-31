import { useClerk, useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { withCoreSessionSwitchGuard } from '@/ui/contexts';
import { descriptors, Flex, Flow, localizationKeys, Spinner } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { useRouter } from '@/ui/router';
import { getIdentifier } from '@/utils/user';

import { useOrganizationListInView } from '../../../OrganizationList/OrganizationListPage';
import { withTaskGuard } from '../withTaskGuard';
import { CreateOrganizationScreen } from './CreateOrganizationScreen';
import { SelectOrganizationScreen } from './SelectOrganizationScreen';

const TaskSelectOrganizationInternal = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();
  const { navigate } = useRouter();

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasExistingResources = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  const navigateAfterSignOut = () => navigate(clerk.buildAfterSignOutUrl());

  const handleSignOut = () => {
    void clerk.signOut(navigateAfterSignOut);
  };

  return (
    <Flow.Root flow='taskSelectOrganization'>
      <Card.Root>
        {!isLoading && user ? (
          <>
            <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}`, gap: t.space.$6 })}>
              <Header.Root
                showLogo
                sx={t => ({ padding: `${t.space.$none} ${t.space.$8}` })}
              >
                <Header.Title localizationKey={localizationKeys('taskSelectOrganization.title')} />
                <Header.Subtitle localizationKey={localizationKeys('taskSelectOrganization.subtitle')} />
              </Header.Root>

              <TaskSelectOrganizationFlows initialFlow={hasExistingResources ? 'select' : 'create'} />
            </Card.Content>

            <Card.Footer>
              <Card.Action elementId='signOut'>
                <Card.ActionText
                  localizationKey={localizationKeys('taskSelectOrganization.signOut.actionText', {
                    // TODO -> Change this key name to identifier
                    // TODO -> what happens if the user does not email address? only username or phonenumber
                    // Signed in as +55482323232
                    emailAddress: user.primaryEmailAddress?.emailAddress || getIdentifier(user),
                  })}
                />
                <Card.ActionLink
                  onClick={handleSignOut}
                  localizationKey={localizationKeys('taskSelectOrganization.signOut.actionLink')}
                />
              </Card.Action>
            </Card.Footer>
          </>
        ) : (
          // TODO -> Improve loading UI to keep consistent height with SignIn/SignUp
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
        )}
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
