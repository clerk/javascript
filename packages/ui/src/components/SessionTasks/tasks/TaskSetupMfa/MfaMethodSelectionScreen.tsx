import { useClerk, useSession, useUser } from '@clerk/shared/react';

import { useSignOutContext } from '@/ui/contexts';
import { Button, Col, Flow, localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';

type MfaMethodSelectionScreenProps = {
  availableMethods: string[];
  onMethodSelect: (method: string) => void;
};

export const MfaMethodSelectionScreen = (props: MfaMethodSelectionScreenProps) => {
  const { availableMethods, onMethodSelect } = props;
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

  const getMethodLabel = (method: string) => {
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
      <Flow.Part part='methodSelection'>
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title localizationKey={localizationKeys('taskSetupMfa.title')} />
              <Header.Subtitle localizationKey={localizationKeys('taskSetupMfa.subtitle')} />
            </Header.Root>
            <Col
              gap={3}
              sx={t => ({ marginTop: t.space.$4 })}
            >
              {availableMethods.map(method => (
                <Button
                  key={method}
                  variant='outline'
                  colorScheme='neutral'
                  onClick={() => onMethodSelect(method)}
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
                onClick={handleSignOut}
                localizationKey={localizationKeys('taskSetupMfa.signOut.actionLink')}
              />
            </Card.Action>
          </Card.Footer>
        </Card.Root>
      </Flow.Part>
    </Flow.Root>
  );
};
