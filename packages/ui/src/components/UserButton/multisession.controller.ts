import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';

import type { MultisessionActionsData, MultisessionControllerOptions, MultisessionModel } from './multisession.types';

export const useMultisessionController = (
  model: MultisessionModel,
  opts: MultisessionControllerOptions,
): MultisessionActionsData => {
  const card = useCardState();
  const pendingAction = useRef<Promise<unknown> | null>(null);
  const releaseSelection = useRef<() => void>();
  const timers = useRef(new Map<ReturnType<typeof setTimeout>, (active: boolean) => void>());
  const mounted = useRef(true);
  const current = useRef({ scopeKey: model.scopeKey, version: 0 });
  const version = current.current.version + (current.current.scopeKey === model.scopeKey ? 0 : 1);
  current.current = { scopeKey: model.scopeKey, version };
  const isCurrent = () => mounted.current && current.current.version === version && model.canRun();
  const cardRef = useRef(card);
  cardRef.current = card;

  useEffect(() => {
    const pendingTimers = timers.current;
    mounted.current = true;
    pendingAction.current = null;
    return () => {
      mounted.current = false;
      pendingAction.current = null;
      releaseSelection.current?.();
      releaseSelection.current = undefined;
      for (const [timer, resolve] of pendingTimers) {
        clearTimeout(timer);
        resolve(false);
      }
      pendingTimers.clear();
    };
  }, [model.scopeKey]);

  const delay = (milliseconds: number) =>
    new Promise<boolean>(resolve => {
      if (!isCurrent()) {
        resolve(false);
        return;
      }
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        resolve(isCurrent());
      }, milliseconds);
      timers.current.set(timer, resolve);
    });

  const runAction = (effect: () => unknown): Promise<unknown> => {
    if (!isCurrent()) {
      return Promise.resolve(false);
    }
    if (pendingAction.current) {
      return pendingAction.current;
    }
    const action = Promise.resolve()
      .then(() => (isCurrent() ? effect() : false))
      .finally(() => {
        if (pendingAction.current === action) {
          pendingAction.current = null;
          releaseSelection.current?.();
          releaseSelection.current = undefined;
        }
      });
    pendingAction.current = action;
    return action;
  };

  const completeProfileAction = (startPath?: string) => {
    if (opts.userProfileMode === 'navigation') {
      return model.navigateToUserProfile().then(completed => {
        if (completed) {
          void delay(300).then(active => {
            if (active) {
              opts.actionCompleteCallback?.();
            }
          });
        }
        return completed;
      });
    }
    const completed = model.openUserProfile(startPath);
    if (completed && isCurrent()) {
      opts.actionCompleteCallback?.();
    }
    return completed;
  };

  return {
    handleSignOutSessionClicked: sessionId => () => runAction(() => model.signOutSession(sessionId)),
    handleManageAccountClicked: () => runAction(() => completeProfileAction()),
    handleUserProfileActionClicked: startPath => runAction(() => completeProfileAction(startPath)),
    handleSignOutAllClicked: () => runAction(model.signOutAll),
    handleSessionClicked: sessionId => () => {
      if (!isCurrent()) {
        return Promise.resolve(false);
      }
      if (pendingAction.current) {
        return pendingAction.current;
      }
      const release = cardRef.current.beginRequest();
      if (!release) {
        return Promise.resolve(false);
      }
      releaseSelection.current = release;
      return runAction(async () => {
        const completed = await model.switchSession(sessionId);
        if (completed && isCurrent()) {
          opts.actionCompleteCallback?.();
        }
        return completed;
      });
    },
    handleAddAccountClicked: () => runAction(() => (model.addAccount() ? delay(2000) : false)),
    otherSessions: model.otherSessions,
    signedInSessions: model.signedInSessions,
  };
};
