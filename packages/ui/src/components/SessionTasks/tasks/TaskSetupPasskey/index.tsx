import { useClerk, useReverification, useSession, useUser } from '@clerk/shared/react';
import {
  isWebAuthnPlatformAuthenticatorSupported as isWebAuthnPlatformAuthenticatorSupportedOnWindow,
  isWebAuthnSupported as isWebAuthnSupportedOnWindow,
} from '@clerk/shared/webauthn';
import { useCallback, useEffect, useState } from 'react';

import { useEnvironment, useSignOutContext, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { useSessionTasksContext, useTaskSetupPasskeyContext } from '@/ui/contexts/components/SessionTasks';
import { Button, Col, descriptors, Flow, localizationKeys, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';
import { handleError } from '@/ui/utils/errorHandler';

import { withTaskGuardOnlyOnMount } from '../shared';

const TASK_KEY = 'setup-passkey';

/**
 * `checking` runs the WebAuthn capability probe, `offer` is the regular card, `declineOnly` is the
 * fallback for an optional task whose automatic skip failed, and `unsupported` is the dead end for
 * a required task on a device that cannot create a passkey.
 */
type Screen = 'checking' | 'offer' | 'declineOnly' | 'unsupported';

const TaskSetupPasskeyInternal = () => {
  const clerk = useClerk();
  const card = useCardState();
  const { user } = useUser();
  const { session } = useSession();
  const { userSettings } = useEnvironment();
  const { redirectUrlComplete } = useTaskSetupPasskeyContext();
  const { navigateOnSetActive, redirectOnActiveSession } = useSessionTasksContext();
  const createPasskey = useReverification(() => user?.createPasskey());
  const [screen, setScreen] = useState<Screen>('checking');

  // The task payload carries only its key, so whether it can be declined comes from the instance
  // setting. Settings cached before the field existed leave it absent or empty; anything other than
  // an explicit `required` keeps the decline affordance, so stale settings cannot trap a user.
  const isRequired = (userSettings.passkeySettings.prompt_at_sign_up || 'off') === 'required';

  // Navigation is driven from here instead of by the parent, so resolving this task lands on the
  // next pending task rather than short-circuiting straight to `redirectUrlComplete`.
  useEffect(() => {
    if (redirectOnActiveSession) {
      redirectOnActiveSession.current = false;
    }
  }, [redirectOnActiveSession]);

  const continueToNextTask = useCallback(async () => {
    await clerk.setActive({
      session: session?.id,
      navigate: async ({ session, decorateUrl }) => {
        await navigateOnSetActive?.({ session, redirectUrlComplete, decorateUrl });
      },
    });
  }, [clerk, session?.id, navigateOnSetActive, redirectUrlComplete]);

  const declineTask = useCallback(async () => {
    await clerk.session?.skipTask(TASK_KEY);
    await continueToNextTask();
  }, [clerk, continueToNextTask]);

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      // Native hosts (Expo, Electron) swap in their own implementations.
      const isWebAuthnSupported =
        // @ts-expect-error - This is not a public API
        (clerk.__internal_isWebAuthnSupported as (() => boolean) | undefined) ?? isWebAuthnSupportedOnWindow;
      const isPlatformAuthenticatorSupported =
        // @ts-expect-error - This is not a public API
        (clerk.__internal_isWebAuthnPlatformAuthenticatorSupported as (() => Promise<boolean>) | undefined) ??
        isWebAuthnPlatformAuthenticatorSupportedOnWindow;

      const canRegisterPasskey = isWebAuthnSupported() && (await isPlatformAuthenticatorSupported());

      if (isCancelled) {
        return;
      }

      if (canRegisterPasskey) {
        setScreen('offer');
        return;
      }

      // A required task cannot be satisfied on this device and cannot be declined either — skipping
      // would only earn a `session_task_not_skippable` 400. Say so instead of spinning or auto-skipping.
      if (isRequired) {
        setScreen('unsupported');
        return;
      }

      // An optional task on a device without a platform authenticator is declined on the user's
      // behalf, so the offer never renders.
      try {
        await declineTask();
      } catch (err) {
        if (isCancelled) {
          return;
        }
        // Surfacing the failure beats stranding the user on a spinner. The device still cannot
        // register a passkey, so only the decline action is offered as a retry. The screen is
        // switched first because `handleError` rethrows errors it does not recognise.
        setScreen('declineOnly');
        handleError(err as Error, [], card.setError);
      }
    })();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegisterPasskey = () =>
    card.runAsync(async () => {
      if (!user) {
        return;
      }

      try {
        await createPasskey();
        // The Frontend API clears the task once the attempt succeeds, so refreshing the session
        // is enough to pick up the next task.
        await continueToNextTask();
      } catch (err) {
        // Dismissing the OS dialog rejects here. Stay on the card so the user can retry or decline.
        handleError(err as Error, [], card.setError);
      }
    });

  const handleSkipTask = () =>
    card.runAsync(async () => {
      try {
        await declineTask();
      } catch (err) {
        handleError(err as Error, [], card.setError);
      }
    });

  if (screen === 'checking') {
    return (
      <Flow.Root flow='taskSetupPasskey'>
        <Flow.Part part='setupPasskey'>
          <Card.Root>
            <Card.Content>
              <LoadingCardContainer />
            </Card.Content>
            <Card.Footer />
          </Card.Root>
        </Flow.Part>
      </Flow.Root>
    );
  }

  if (screen === 'unsupported') {
    return (
      <Flow.Root flow='taskSetupPasskey'>
        <Flow.Part part='setupPasskey'>
          <Card.Root>
            <Card.Content>
              <Header.Root showLogo>
                <Header.Title localizationKey={localizationKeys('taskSetupPasskey.unsupportedDevice.title')} />
                <Header.Subtitle localizationKey={localizationKeys('taskSetupPasskey.unsupportedDevice.subtitle')} />
              </Header.Root>
              <Card.Alert>{card.error}</Card.Alert>
            </Card.Content>

            <Card.Footer>
              <TaskSetupPasskeyFooterActionForSignOut />
            </Card.Footer>
          </Card.Root>
        </Flow.Part>
      </Flow.Root>
    );
  }

  return (
    <Flow.Root flow='taskSetupPasskey'>
      <Flow.Part part='setupPasskey'>
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title localizationKey={localizationKeys('taskSetupPasskey.title')} />
              {/* A required task is a gate, not an offer, so it must not be framed as one. */}
              <Header.Subtitle
                localizationKey={localizationKeys(
                  isRequired ? 'taskSetupPasskey.subtitle__required' : 'taskSetupPasskey.subtitle',
                )}
              />
            </Header.Root>
            <Card.Alert>{card.error}</Card.Alert>
            <Col
              elementDescriptor={descriptors.main}
              gap={6}
            >
              <Text
                colorScheme='secondary'
                localizationKey={localizationKeys('taskSetupPasskey.infoText')}
              />
              <Col gap={3}>
                {screen === 'offer' && (
                  <Button
                    block
                    textVariant='buttonLarge'
                    elementDescriptor={descriptors.formButtonPrimary}
                    isLoading={card.isLoading}
                    localizationKey={localizationKeys('taskSetupPasskey.formButtonPrimary')}
                    onClick={() => void handleRegisterPasskey()}
                  />
                )}
                {!isRequired && (
                  <Button
                    block
                    variant='ghost'
                    textVariant='buttonLarge'
                    elementDescriptor={descriptors.formButtonReset}
                    isDisabled={card.isLoading}
                    localizationKey={localizationKeys('taskSetupPasskey.formButtonSkip')}
                    onClick={() => void handleSkipTask()}
                  />
                )}
              </Col>
            </Col>
          </Card.Content>

          <Card.Footer>
            <TaskSetupPasskeyFooterActionForSignOut />
          </Card.Footer>
        </Card.Root>
      </Flow.Part>
    </Flow.Root>
  );
};

function TaskSetupPasskeyFooterActionForSignOut() {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { otherSessions } = useMultipleSessions({ user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();

  const handleSignOut = () => {
    if (otherSessions.length === 0) {
      return clerk.signOut(navigateAfterSignOut);
    }
    return clerk.signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: session?.id });
  };

  const identifier = user?.primaryEmailAddress?.emailAddress ?? user?.username;

  return (
    <Card.Action
      elementId='signOut'
      gap={2}
      justify='center'
      sx={() => ({ width: '100%' })}
    >
      {identifier && (
        <Card.ActionText
          truncate
          localizationKey={localizationKeys('taskSetupPasskey.signOut.actionText', {
            identifier,
          })}
        />
      )}
      <Card.ActionLink
        sx={() => ({ flexShrink: 0 })}
        onClick={() => void handleSignOut()}
        localizationKey={localizationKeys('taskSetupPasskey.signOut.actionLink')}
      />
    </Card.Action>
  );
}

export const TaskSetupPasskey = withCoreSessionSwitchGuard(
  withTaskGuardOnlyOnMount(withCardStateProvider(TaskSetupPasskeyInternal), TASK_KEY),
);
