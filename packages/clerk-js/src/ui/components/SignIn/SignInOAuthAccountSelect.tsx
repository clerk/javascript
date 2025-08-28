import { Action, Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { UserPreview } from '@/ui/elements/UserPreview';

// import { withRedirectToAfterSignIn } from '../../common';
import { useEnvironment, useSignInContext } from '../../contexts';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { SwitchArrowRight } from '../../icons';
import { useMultisessionActions } from '../UserButton/useMultisessionActions';
import { buildURL } from '@/utils';

/**
 * OAuth Account Select:
 * - Lists existing signed-in sessions for quick switch → redirect to afterSignInUrl
 * - Provides an action to use another account → redirect to Sign In page
 */
const SignInOAuthAccountSelectInternal = () => {
  const card = useCardState();
  const { userProfileUrl } = useEnvironment().displayConfig;
  const { afterSignInUrl, signInUrl, path: signInPath, taskUrl } = useSignInContext();

  const signInUrlWithRedirect = buildURL(
    {
      base: signInPath ?? signInUrl,
      searchParams: new URLSearchParams({ redirectUrl: afterSignInUrl }),
    },
    {
      stringify: true,
    },
  );

  const { handleSessionClicked, signedInSessions, handleAddAccountClicked } = useMultisessionActions({
    taskUrl,
    navigateAfterSignOut: undefined,
    afterSwitchSessionUrl: afterSignInUrl,
    userProfileUrl,
    signInUrl: signInUrlWithRedirect,
    user: undefined,
  });

  const hasSessions = signedInSessions.length > 0;
  const titleLocalization = hasSessions
    ? localizationKeys('signIn.oauthAccountSelect.title')
    : localizationKeys('signIn.start.title');
  const subtitleLocalization = hasSessions
    ? localizationKeys('signIn.oauthAccountSelect.subtitle')
    : localizationKeys('signIn.oauthAccountSelect.subtitle__emptyState');
  const actionLabelLocalization = hasSessions
    ? localizationKeys('signIn.oauthAccountSelect.action__useAnotherAccount')
    : localizationKeys('signIn.start.title');

  return (
    <Flow.Part part='oauthAccountSelect'>
      <Card.Root>
        <Card.Content sx={t => ({ padding: `${t.space.$6} ${t.space.$none} ${t.space.$none}` })}>
          <Header.Root showLogo>
            <Header.Title localizationKey={titleLocalization} />
            {subtitleLocalization && <Header.Subtitle localizationKey={subtitleLocalization} />}
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={4}
            sx={t =>
              hasSessions
                ? {
                    borderTopWidth: t.borderWidths.$normal,
                    borderTopStyle: t.borderStyles.$solid,
                    borderTopColor: t.colors.$borderAlpha100,
                  }
                : {}
            }
          >
            <Actions role='menu'>
              {signedInSessions.map(s => (
                <PreviewButton
                  key={s.id}
                  onClick={handleSessionClicked(s)}
                  sx={theme => ({
                    height: theme.sizes.$16,
                    justifyContent: 'flex-start',
                    borderRadius: 0,
                  })}
                  icon={SwitchArrowRight}
                >
                  <UserPreview
                    user={s.user}
                    sx={{
                      width: '100%',
                    }}
                  />
                </PreviewButton>
              ))}

              <Action
                elementDescriptor={descriptors.accountSwitcherActionButton}
                elementId={descriptors.accountSwitcherActionButton.setId('addAccount')}
                iconBoxElementDescriptor={descriptors.accountSwitcherActionButtonIconBox}
                iconBoxElementId={descriptors.accountSwitcherActionButtonIconBox.setId('addAccount')}
                iconElementDescriptor={descriptors.accountSwitcherActionButtonIcon}
                iconElementId={descriptors.accountSwitcherActionButtonIcon.setId('addAccount')}
                icon={SwitchArrowRight}
                label={actionLabelLocalization}
                onClick={handleAddAccountClicked}
                iconSx={t => ({
                  width: t.sizes.$9,
                  height: t.sizes.$6,
                })}
                iconBoxSx={t => ({
                  minHeight: t.sizes.$9,
                  minWidth: t.sizes.$6,
                  alignItems: 'center',
                })}
                spinnerSize='md'
              />
            </Actions>
          </Col>
        </Card.Content>
      </Card.Root>
    </Flow.Part>
  );
};

export const SignInOAuthAccountSelect = withCardStateProvider(SignInOAuthAccountSelectInternal);
