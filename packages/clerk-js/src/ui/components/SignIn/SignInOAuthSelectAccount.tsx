import { Action, Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { UserPreview } from '@/ui/elements/UserPreview';
import { useEnvironment, useSignInContext } from '../../contexts';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { SwitchArrowRight } from '../../icons';
import { useMultisessionActions } from '../UserButton/useMultisessionActions';
import { buildURL } from '@/utils';
import { SignedInSessionResource } from '@clerk/types';

const OAuthSelectAccountHasSessions = (props: {
  signedInSessions: SignedInSessionResource[];
  onSessionClick: (s: SignedInSessionResource) => () => void;
  onAddAccountClick: () => void;
  cardError: React.ReactNode;
}) => {
  const titleLocalization = localizationKeys('signIn.oauthSelectAccount.title');
  const subtitleLocalization = localizationKeys('signIn.oauthSelectAccount.subtitle');
  const actionLabelLocalization = localizationKeys('signIn.oauthSelectAccount.action__useAnotherAccount');

  return (
    <Flow.Part part='oauthSelectAccount'>
      <Card.Root>
        <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}` })}>
          <Header.Root>
            <Header.Title localizationKey={titleLocalization} />
            <Header.Subtitle localizationKey={subtitleLocalization} />
          </Header.Root>
          <Card.Alert>{props.cardError}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={8}
            sx={t => ({
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
            })}
          >
            <Actions role='menu'>
              {props.signedInSessions.map(s => (
                <PreviewButton
                  key={s.id}
                  onClick={props.onSessionClick(s)}
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
                onClick={props.onAddAccountClick}
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

const OAuthSelectAccountEmptyState = (props: { onAddAccountClick: () => void; cardError: React.ReactNode }) => {
  const titleLocalization = localizationKeys('signIn.oauthSelectAccount.title__emptyState');
  const subtitleLocalization = localizationKeys('signIn.oauthSelectAccount.subtitle__emptyState');
  const actionLabelLocalization = localizationKeys('signIn.start.title');

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={titleLocalization} />
          <Header.Subtitle localizationKey={subtitleLocalization} />
        </Header.Root>
        <Card.Alert>{props.cardError}</Card.Alert>
        <Col
          elementDescriptor={descriptors.main}
          gap={6}
        >
          <Actions role='menu'>
            <Action
              elementDescriptor={descriptors.accountSwitcherActionButton}
              elementId={descriptors.accountSwitcherActionButton.setId('addAccount')}
              iconBoxElementDescriptor={descriptors.accountSwitcherActionButtonIconBox}
              iconBoxElementId={descriptors.accountSwitcherActionButtonIconBox.setId('addAccount')}
              iconElementDescriptor={descriptors.accountSwitcherActionButtonIcon}
              iconElementId={descriptors.accountSwitcherActionButtonIcon.setId('addAccount')}
              icon={SwitchArrowRight}
              label={actionLabelLocalization}
              sx={t => ({
                borderRadius: t.radii.$lg,
              })}
              onClick={props.onAddAccountClick}
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
  );
};

/**
 * OAuth Account Select:
 * - Lists existing signed-in sessions for quick switch → redirect to afterSignInUrl
 * - Provides an action to use another account → redirect to Sign In page
 */
const SignInOAuthSelectAccountInternal = () => {
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
    userProfileMode: 'navigation',
    appearance: undefined,
    userProfileProps: undefined,
  });

  const hasSessions = signedInSessions.length > 0;
  return (
    <Flow.Part part='oauthSelectAccount'>
      {hasSessions ? (
        <OAuthSelectAccountHasSessions
          signedInSessions={signedInSessions}
          onSessionClick={handleSessionClicked}
          onAddAccountClick={handleAddAccountClicked}
          cardError={card.error}
        />
      ) : (
        <OAuthSelectAccountEmptyState
          onAddAccountClick={handleAddAccountClicked}
          cardError={card.error}
        />
      )}
    </Flow.Part>
  );
};

export const SignInOAuthSelectAccount = withCardStateProvider(SignInOAuthSelectAccountInternal);
