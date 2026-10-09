import { buildURL } from '@clerk/shared/internal/clerk-js/url';
import { useClerk } from '@clerk/shared/react';

import { Action, Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { UserPreview } from '@/ui/elements/UserPreview';
import { handleError } from '@/ui/utils/errorHandler';

import { withRedirectToAfterSignIn } from '../../common';
import { useEnvironment, useSignInContext, useSignOutContext } from '../../contexts';
import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { Add, ArrowRight } from '../../icons';
import { SignOutAllActions } from '../UserButton/SessionActions';
import { useMultisessionActions } from '../UserButton/useMultisessionActions';
import { SignInStart } from './SignInStart';
import { isChatGPTSIWCAccountMismatch } from './chatGPTSIWC';

const SignInAccountSwitcherInternal = () => {
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const { afterSignInUrl, path: signInPath, signInUrl, taskUrl, queryParams } = useSignInContext();
  const isChatGPTSIWCMismatch = isChatGPTSIWCAccountMismatch(queryParams);
  const accountSwitcherSignInUrl = isChatGPTSIWCMismatch
    ? buildURL(
        {
          // signInUrl already preserves the OAuth continuation parameters in
          // both path and virtual routing. Starting from signInPath drops them.
          base: signInUrl,
          hashSearchParams: {
            __clerk_siwc_account_mismatch: 'false',
            __clerk_siwc_account_choice_pending: 'true',
          },
        },
        { stringify: true },
      )
    : signInUrl;
  const { navigateAfterSignOut } = useSignOutContext();
  const { handleSignOutAllClicked, handleSessionClicked, signedInSessions, handleAddAccountClicked } =
    useMultisessionActions({
      taskUrl,
      navigateAfterSignOut,
      afterSwitchSessionUrl: afterSignInUrl,
      onBeforeSwitchSessionNavigate: isChatGPTSIWCMismatch
        ? async session => {
            try {
              if (!session.__internal_acknowledgeChatGPTAccountChoice) {
                throw new Error('This session cannot confirm the ChatGPT account choice.');
              }
              await session.__internal_acknowledgeChatGPTAccountChoice(afterSignInUrl);
              return true;
            } catch (error) {
              handleError(error as Error, [], card.setError);
              return false;
            }
          }
        : undefined,
      userProfileUrl: displayConfig.userProfileUrl,
      signInUrl: isChatGPTSIWCMismatch ? accountSwitcherSignInUrl : (signInPath ?? signInUrl),
      user: undefined,
    });

  return (
    <Flow.Part part='accountSwitcher'>
      <Card.Root>
        <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}` })}>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys('signIn.accountSwitcher.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.accountSwitcher.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={8}
            sx={t => ({
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$borderAlpha100,
            })}
          >
            <Actions>
              {signedInSessions.map(s => (
                <PreviewButton
                  key={s.id}
                  onClick={handleSessionClicked(s)}
                  sx={theme => ({
                    height: theme.sizes.$16,
                    justifyContent: 'flex-start',
                    borderRadius: 0,
                  })}
                  icon={ArrowRight}
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
                icon={Add}
                label={localizationKeys('signIn.accountSwitcher.action__addAccount')}
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
        <Card.Footer
          sx={t => ({
            '>:first-of-type': {
              padding: `${t.space.$1}`,
              width: '100%',
            },
          })}
        >
          <Card.Action
            sx={{
              width: '100%',
              '>:first-of-type': {
                width: '100%',
                borderBottomWidth: 0,
              },
            }}
          >
            <SignOutAllActions
              handleSignOutAllClicked={handleSignOutAllClicked}
              elementDescriptor={descriptors.accountSwitcherActionButton}
              elementId={descriptors.accountSwitcherActionButton.setId('signOutAll')}
              iconBoxElementDescriptor={descriptors.accountSwitcherActionButtonIconBox}
              iconBoxElementId={descriptors.accountSwitcherActionButtonIconBox.setId('signOutAll')}
              iconElementDescriptor={descriptors.accountSwitcherActionButtonIcon}
              iconElementId={descriptors.accountSwitcherActionButtonIcon.setId('signOutAll')}
              label={localizationKeys('signIn.accountSwitcher.action__signOutAll')}
              actionSx={t => ({
                padding: `${t.space.$2} ${t.space.$2}`,
              })}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Part>
  );
};
export const SignInAccountSwitcherForChatGPTSIWC = withCardStateProvider(() => {
  const clerk = useClerk();
  if (clerk.client.sessions.length === 0) {
    return <SignInStart />;
  }
  return <SignInAccountSwitcherInternal />;
});

export const SignInAccountSwitcher = withRedirectToAfterSignIn(withCardStateProvider(SignInAccountSwitcherInternal));
