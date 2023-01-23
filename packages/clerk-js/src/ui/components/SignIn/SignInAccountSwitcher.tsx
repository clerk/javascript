import { withRedirectToHome } from '../../common/withRedirectToHome';
import { useEnvironment, useSignInContext } from '../../contexts';
import { Col, descriptors, Flow, Icon } from '../../customizables';
import { Card, CardAlert, Header, PreviewButton, UserPreview, withCardStateProvider } from '../../elements';
import { ArrowBlockButton } from '../../elements/ArrowBlockButton';
import { useCardState } from '../../elements/contexts';
import { useNavigate } from '../../hooks';
import { Plus, SignOutDouble } from '../../icons';
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
      user: undefined,
    });

  return (
    <Flow.Part part='accountSwitcher'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title>Signed out</Header.Title>
          <Header.Subtitle>Select account to continue to {applicationName}</Header.Subtitle>
        </Header.Root>
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Col>
            {activeSessions.map(s => (
              <PreviewButton
                key={s.id}
                onClick={handleSessionClicked(s)}
                sx={theme => ({ height: theme.sizes.$14, justifyContent: 'flex-start' })}
              >
                <UserPreview user={s.user} />
              </PreviewButton>
            ))}
          </Col>
          <Col gap={2}>
            <ArrowBlockButton
              isDisabled={card.isLoading}
              icon={
                <Icon
                  size='sm'
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
export const SignInAccountSwitcher = withRedirectToHome(withCardStateProvider(_SignInAccountSwitcher), 'signIn');
