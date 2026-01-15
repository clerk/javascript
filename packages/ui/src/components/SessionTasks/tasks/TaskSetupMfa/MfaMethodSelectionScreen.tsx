import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { VerificationStrategy } from '@clerk/shared/types';
import { useEffect } from 'react';

import { MfaForm } from '@/components/UserProfile/MfaForm';
import { useSessionTasksContext, useTaskSetupMfaContext } from '@/contexts/components/SessionTasks';
import { Action } from '@/elements/Action';
import { Route, Switch, useRouter } from '@/router';
import { useSignOutContext } from '@/ui/contexts';
import { Button, Col, Flow, localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';

type MfaMethodSelectionScreenProps = {
  availableMethods: string[];
};

const methods: VerificationStrategy[] = ['totp', 'phone_code', 'backup_code'];

export const MfaMethodSelectionScreen = (props: MfaMethodSelectionScreenProps) => {
  const { availableMethods } = props;
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();
  const { navigate } = useRouter();

  useEffect(() => {
    const autoSelectedMethod = availableMethods.length === 1;
    if (autoSelectedMethod) {
      void navigate(`./${availableMethods[0]}`);
    }
  }, []);

  const handleSignOut = () => {
    if (otherSessions.length === 0) {
      return clerk.signOut(navigateAfterSignOut);
    }
    return clerk.signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session?.id });
  };

  const getMethodLabel = (method: VerificationStrategy) => {
    switch (method) {
      case 'totp':
        return localizationKeys('taskSetupMfa.methodSelection.totpButton');
      case 'phone_code':
        return localizationKeys('taskSetupMfa.methodSelection.phoneCodeButton');
      case 'backup_code':
        return localizationKeys('taskSetupMfa.methodSelection.backupCodeButton');
      default:
        return method;
    }
  };

  const identifier = user?.primaryEmailAddress?.emailAddress ?? user?.username;

  return (
    <Flow.Root flow='taskSetupMfa'>
      <Switch>
        <Route index>
          <Flow.Part part='methodSelection'>
            <Card.Root>
              <Card.Content>
                <Header.Root showLogo>
                  <Header.Title localizationKey={localizationKeys('taskSetupMfa.title')} />
                  <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.subtitle')} />
                </Header.Root>
                <Col gap={4}>
                  {availableMethods.map(method => (
                    <Button
                      key={method}
                      variant='outline'
                      colorScheme='neutral'
                      onClick={() => {
                        void navigate(`./${method}`);
                        return;
                      }}
                      localizationKey={getMethodLabel(method)}
                    />
                  ))}
                </Col>
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
                      localizationKey={localizationKeys('taskSetupMfa.signOut.actionText', {
                        identifier,
                      })}
                    />
                  )}
                  <Card.ActionLink
                    sx={() => ({ flexShrink: 0 })}
                    onClick={() => void handleSignOut()}
                    localizationKey={localizationKeys('taskSetupMfa.signOut.actionLink')}
                  />
                </Card.Action>
              </Card.Footer>
            </Card.Root>
          </Flow.Part>
        </Route>

        {/* We will create a route for each method */}
        {methods.map(method => (
          <Route
            key={method}
            path={method}
          >
            <Flow.Part part='setupMfa'>
              <MfaFormForSessionTasks verificationStrategy={method} />
            </Flow.Part>
          </Route>
        ))}
      </Switch>
    </Flow.Root>
  );
};

export function MfaFormForSessionTasks(props: { verificationStrategy: VerificationStrategy }) {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();
  const { navigate } = useRouter();
  const { redirectUrlComplete } = useTaskSetupMfaContext();
  const { navigateOnSetActive } = useSessionTasksContext();

  const handleSignOut = () => {
    if (otherSessions.length === 0) {
      return clerk.signOut(navigateAfterSignOut);
    }
    return clerk.signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session?.id });
  };

  const identifier = user?.primaryEmailAddress?.emailAddress ?? user?.username;

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('taskSetupMfa.title')} />
          <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.subtitle')} />
        </Header.Root>
        <Action.Root>
          <MfaForm
            selectedStrategy={props.verificationStrategy}
            onSuccess={() => {
              void clerk.setActive({
                session: session?.id,
                navigate: async ({ session }) => {
                  await navigateOnSetActive?.({ session, redirectUrlComplete });
                },
              });
            }}
            onReset={() => {
              void navigate(`../`);
            }}
          />
        </Action.Root>
      </Card.Content>
      <Card.Footer>
        <Card.Action
          elementId='signOut'
          gap={4}
          justify='center'
          sx={() => ({ width: '100%' })}
        >
          {identifier && (
            <Card.ActionText
              truncate
              localizationKey={localizationKeys('taskSetupMfa.signOut.actionText', {
                identifier,
              })}
            />
          )}
          <Card.ActionLink
            sx={() => ({ flexShrink: 0 })}
            onClick={() => void handleSignOut()}
            localizationKey={localizationKeys('taskSetupMfa.signOut.actionLink')}
          />
        </Card.Action>
      </Card.Footer>
    </Card.Root>
  );
}
