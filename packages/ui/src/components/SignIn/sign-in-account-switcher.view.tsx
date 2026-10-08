import { Action, Actions } from '@/ui/elements/Actions';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { PreviewButton } from '@/ui/elements/PreviewButton';
import { UserPreviewView } from '@/ui/elements/user-preview.view';

import { Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { Add, ArrowRight } from '../../icons';
import { SignOutAllActionsView } from '../UserButton/session-actions.view';
import type { useSignInAccountSwitcherController } from './sign-in-account-switcher.controller';

export const SignInAccountSwitcherView = ({
  error,
  sessions,
  onAddAccount,
  onSignOutAll,
}: ReturnType<typeof useSignInAccountSwitcherController>) => {
  return (
    <Flow.Part part='accountSwitcher'>
      <Card.Root>
        <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}` })}>
          <Header.Root>
            <Header.Title localizationKey={localizationKeys('signIn.accountSwitcher.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.accountSwitcher.subtitle')} />
          </Header.Root>
          <Card.Alert>{error}</Card.Alert>
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
              {sessions.map(session => (
                <PreviewButton
                  key={session.id}
                  onClick={() => {
                    void session.onClick();
                  }}
                  sx={theme => ({
                    height: theme.sizes.$16,
                    justifyContent: 'flex-start',
                    borderRadius: 0,
                  })}
                  icon={ArrowRight}
                >
                  <UserPreviewView
                    {...session.preview}
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
                onClick={onAddAccount}
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
            <SignOutAllActionsView
              handleSignOutAllClicked={onSignOutAll}
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
