import { stringToFormattedPhoneString } from '@clerk/shared/phone';

import type { AuthFlowFacts, AuthFlowOutcome } from './auth-flow.types';

export function formatPhoneIdentifier(identifier: string): string {
  if (!identifier || identifier.includes('*')) {
    return identifier;
  }
  return stringToFormattedPhoneString(identifier);
}

export function flowOutcome<TaskKey extends string>({
  session,
  entry,
  finish,
  singleSession,
  isTaskReady,
}: AuthFlowFacts<TaskKey>): AuthFlowOutcome<TaskKey> {
  if (finish === 'finishing') {
    return { type: 'hold' };
  }
  switch (session.type) {
    case 'none':
      return { type: 'resource' };
    case 'activating':
      return { type: 'hold' };
    case 'task':
      return finish === 'finalized' && !isTaskReady ? { type: 'hold' } : session;
    case 'active':
      if (finish === 'finalized' || entry === 'task') {
        return { type: 'done' };
      }
      return entry === 'active' && singleSession ? { type: 'leave' } : { type: 'resource' };
  }
}
