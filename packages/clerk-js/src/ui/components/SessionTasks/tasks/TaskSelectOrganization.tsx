import { useUser } from '@clerk/shared/react';

import { withCoreSessionSwitchGuard } from '@/ui/contexts';
import { Flow, localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';
import { Header } from '@/ui/elements/Header';
import { getIdentifier } from '@/utils/user';

import { withTaskGuard } from './withTaskGuard';

const TaskSelectOrganizationInternal = () => {
  const { user } = useUser();

  // TODO -> Improve loading UI to keep consistent height with SignIn/SignUp
  const isLoading = false;

  return (
    <Flow.Root flow='taskSelectOrganization'>
      <Card.Root>
        {isLoading ? (
          <FullHeightLoader />
        ) : (
          <>
            <Card.Content>
              <Header.Root showLogo>
                <Header.Title localizationKey={localizationKeys('taskSelectOrganization.title')} />
                <Header.Subtitle localizationKey={localizationKeys('taskSelectOrganization.subtitle')} />
              </Header.Root>
            </Card.Content>
            <Card.Footer>
              <Card.Action elementId='signOut'>
                <Card.ActionText
                  localizationKey={localizationKeys('taskSelectOrganization.signOut.actionText', {
                    // TODO -> Change this key name to identifier
                    // TODO -> what happens if the user does not email address? only username or phonenumber
                    // Signed in as +55482323232
                    emailAddress: user.primaryEmailAddress.emailAddress || getIdentifier(user),
                  })}
                />
                <Card.ActionLink localizationKey={localizationKeys('taskSelectOrganization.signOut.actionLink')} />
              </Card.Action>
            </Card.Footer>
          </>
        )}
      </Card.Root>
    </Flow.Root>
  );
};

export const TaskSelectOrganization = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskSelectOrganizationInternal)),
);
