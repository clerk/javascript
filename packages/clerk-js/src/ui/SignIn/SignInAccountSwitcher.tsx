import React from 'react';

import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useEnvironment, useSignInContext } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { Button, Col, descriptors, Flow, Icon } from '../customizables';
import { Card, CardAlert, Header, UserPreview, UserPreviewProps, withCardStateProvider } from '../elements';
import { ArrowBlockButton } from '../elements/ArrowBlockButton';
import { useCardState } from '../elements/contexts';
import { Plus, SignOutDouble } from '../icons';
import { PropsOfComponent } from '../styledSystem';
import { useMultisessionActions } from '../UserButton/useMultisessionActions';

const _SignInAccountSwitcher = () => {
  const card = useCardState();
  const { navigate } = useNavigate();
  const { applicationName, userProfileUrl, signInUrl, afterSignOutAllUrl } = useEnvironment().displayConfig;
  const { navigateAfterSignIn } = useSignInContext();
  const { handleSignOutAllClicked, handleSessionClicked, activeSessions, handleAddAccountClicked } =
    useMultisessionActions({
      navigateAfterSignOut: () => navigate(afterSignOutAllUrl),
      navigateAfterSwitchSession: navigateAfterSignIn,
      userProfileUrl,
      signInUrl,
    });

  return (
    <Flow.Part part='accountSwitcher'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title>Signed out</Header.Title>
          <Header.Subtitle>Select account to continue to {applicationName}</Header.Subtitle>
        </Header.Root>
        {/*TODO: extract main in its own component */}
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Col>
            {activeSessions.map(s => (
              <UserPreviewButton
                key={s.id}
                user={s.user}
                onClick={handleSessionClicked(s)}
              />
            ))}
          </Col>
          <Col gap={2}>
            <ArrowBlockButton
              isDisabled={card.isLoading}
              icon={
                <Icon
                  size={'sm'}
                  icon={Plus}
                  sx={theme => ({ color: theme.colors.$blackAlpha500 })}
                />
              }
              onClick={handleAddAccountClicked}
            >
              Add account
            </ArrowBlockButton>
            <ArrowBlockButton
              isDisabled={card.isLoading}
              icon={
                <Icon
                  icon={SignOutDouble}
                  sx={theme => ({ color: theme.colors.$blackAlpha500 })}
                />
              }
              onClick={handleSignOutAllClicked}
            >
              Sign out of all accounts
            </ArrowBlockButton>
          </Col>
        </Col>
      </Card>
    </Flow.Part>
  );
};
export const SignInAccountSwitcher = withRedirectToHome(withCardStateProvider(_SignInAccountSwitcher));

type UserPreviewButtonProps = PropsOfComponent<typeof Button> & UserPreviewProps;

const UserPreviewButton = (props: UserPreviewButtonProps) => {
  const card = useCardState();
  const { user, ...rest } = props;

  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      focusRing={false}
      isDisabled={card.isLoading}
      sx={theme => ({ height: theme.sizes.$14, justifyContent: 'flex-start' })}
      {...rest}
    >
      <UserPreview user={user} />
    </Button>
  );
};
