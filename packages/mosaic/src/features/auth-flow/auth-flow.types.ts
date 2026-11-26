export interface AuthFlowValues {
  identifier: string;
  emailAddress: string;
  phoneNumber: string;
  password: string;
  code: string;
  backupCode: string;
  firstName: string;
  lastName: string;
  username: string;
  newPassword: string;
  confirmPassword: string;
  signOutOfOtherSessions: boolean;
  legalAccepted: boolean;
}

export interface AuthFlowSubmitEvent {
  preventDefault: () => void;
}

export type AuthSessionPhase<TaskKey extends string = string> =
  | { type: 'none' }
  | { type: 'activating' }
  | { type: 'task'; key: TaskKey }
  | { type: 'active' };

export type AuthFinishPhase = 'idle' | 'finishing' | 'failed' | 'finalized';

export type AuthFlowOutcome<TaskKey extends string = string> =
  | { type: 'resource' }
  | { type: 'hold' }
  | { type: 'task'; key: TaskKey }
  | { type: 'leave' }
  | { type: 'done' };

export interface AuthFlowFacts<TaskKey extends string = string> {
  session: AuthSessionPhase<TaskKey>;
  entry: AuthSessionPhase['type'];
  finish: AuthFinishPhase;
  singleSession: boolean;
  isTaskReady: boolean;
}
