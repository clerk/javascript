import type { TaskSetupMfaReadyModel } from '@clerk/mosaic/features/task-setup-mfa/task-setup-mfa.controller';
import { useTaskSetupMfaController } from '@clerk/mosaic/features/task-setup-mfa/task-setup-mfa.controller';
import type { TaskSetupMfaMethod } from '@clerk/mosaic/features/task-setup-mfa/task-setup-mfa.types';
import { TaskSetupMfaView } from '@clerk/mosaic/features/task-setup-mfa/task-setup-mfa.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { idleReverification } from './fixtures/reverification';

export { default as __source } from './task-setup-mfa.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'TaskSetupMFA',
  label: 'Task: set up MFA',
  status: 'wip',
  source: 'packages/mosaic/src/features/task-setup-mfa/task-setup-mfa.tsx',
};

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const backupCodes = [
  'k7f2m9qd',
  'p3x8w1zn',
  'h6c4v0tb',
  'r9j5y2la',
  'e1u7s3gk',
  'w8n2b6xq',
  'd4t9f1mz',
  'q5l3h7cv',
  'a2y6p8rj',
  'm0g4k5ws',
];

const phones = [
  { id: 'phone_1', phoneNumber: '+15555550101', verified: true },
  { id: 'phone_2', phoneNumber: '+447400123456', verified: false },
];

interface HarnessProps {
  methods?: readonly TaskSetupMfaMethod[];
  withPhones?: boolean;
}

function fakeModel({ methods = ['sms', 'authenticator'], withPhones = true }: HarnessProps, onComplete: () => void) {
  const knownPhones = withPhones ? phones : [];
  const model: TaskSetupMfaReadyModel = {
    status: 'ready',
    userId: 'user_1',
    sessionId: 'sess_1',
    isOnTask: true,
    onLeave: () => {},
    renderBranding: true,
    applicationName: 'Acme',
    identifier: 'alice@example.com',
    methods,
    phones: knownPhones,
    enrollPhoneNumber: async phoneNumber => {
      await settleAfter(800);
      return { status: 'needsVerification', phone: { id: 'phone_new', phoneNumber, verified: false } };
    },
    enrollSms: async (phoneId, code) => {
      await settleAfter(800);
      const phone = knownPhones.find(item => item.id === phoneId) ?? { id: phoneId, phoneNumber: '', verified: false };
      if (!phone.verified && !code) {
        return { status: 'needsVerification', phone };
      }
      return { status: 'complete', backupCodes };
    },
    resendSms: () => settleAfter(500),
    createAuthenticator: async () => {
      await settleAfter(600);
      return {
        secret: 'JBSWY3DPEHPK3PXP',
        uri: 'otpauth://totp/Acme:alice%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Acme',
      };
    },
    verifyAuthenticator: async () => {
      await settleAfter(800);
      return { backupCodes };
    },
    onComplete: async () => {
      await settleAfter(1000);
      onComplete();
    },
    onSignOut: () => settleAfter(500),
    createPhoneReverification: idleReverification,
    enrollSmsReverification: idleReverification,
    authenticatorReverification: idleReverification,
  };
  return model;
}

function TaskSetupMfaHarness(props: HarnessProps & { onRestart: () => void }) {
  const [model] = useState(() => fakeModel(props, props.onRestart));
  const controller = useTaskSetupMfaController(model);
  return <TaskSetupMfaView {...controller} />;
}

function RestartableHarness(props: HarnessProps) {
  const [round, setRound] = useState(0);

  return (
    <TaskSetupMfaHarness
      key={round}
      {...props}
      onRestart={() => setRound(current => current + 1)}
    />
  );
}

export function Default(_args: Record<string, unknown>) {
  return <RestartableHarness />;
}

export function SmsOnly(_args: Record<string, unknown>) {
  return <RestartableHarness methods={['sms']} />;
}

export function AuthenticatorOnly(_args: Record<string, unknown>) {
  return <RestartableHarness methods={['authenticator']} />;
}

export function NewPhone(_args: Record<string, unknown>) {
  return (
    <RestartableHarness
      methods={['sms']}
      withPhones={false}
    />
  );
}
