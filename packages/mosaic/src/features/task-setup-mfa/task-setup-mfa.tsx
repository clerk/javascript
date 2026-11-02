'use client';

import type { ReactElement, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import type { TaskSetupMfaReadyModel } from './task-setup-mfa.controller';
import { useTaskSetupMfaController } from './task-setup-mfa.controller';
import type { TaskSetupMfaModelOptions } from './task-setup-mfa.model';
import { useTaskSetupMfaModel } from './task-setup-mfa.model';
import { TaskSetupMfaView } from './task-setup-mfa.view';

export interface TaskSetupMFAProps extends TaskSetupMfaModelOptions {
  /** Rendered while Clerk loads. */
  fallback?: ReactNode;
}

/**
 * A card that resolves the `setup-mfa` session task: the user adds an authenticator app or an SMS
 * code as a second factor, saves the backup codes, and continues to `redirectUrlComplete`. It
 * renders `fallback` until Clerk answers.
 *
 * Mounted when the session has no `setup-mfa` task, it renders nothing and navigates to
 * `redirectUrlComplete`, or to sign-in when nobody is signed in.
 *
 * @example
 * ```tsx
 * <TaskSetupMFA redirectUrlComplete='/dashboard' />
 * ```
 */
export function TaskSetupMFA({ fallback, ...options }: TaskSetupMFAProps = {}): ReactElement | null {
  const model = useTaskSetupMfaModel(options);

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  if (model.status === 'unavailable') {
    return <Leave onLeave={model.onLeave} />;
  }

  return (
    <StartedTaskSetupMfa
      key={`${model.userId}:${model.sessionId}`}
      model={model}
    />
  );
}

function StartedTaskSetupMfa({ model }: { model: TaskSetupMfaReadyModel }) {
  const [startedOnTask] = useState(model.isOnTask);

  if (!startedOnTask) {
    return <Leave onLeave={model.onLeave} />;
  }

  return <ReadyTaskSetupMfa model={model} />;
}

function ReadyTaskSetupMfa({ model }: { model: TaskSetupMfaReadyModel }) {
  const controller = useTaskSetupMfaController(model);
  return <TaskSetupMfaView {...controller} />;
}

function Leave({ onLeave }: { onLeave: () => void }) {
  const [leave] = useState(() => onLeave);
  useEffect(() => leave(), [leave]);
  return null;
}
