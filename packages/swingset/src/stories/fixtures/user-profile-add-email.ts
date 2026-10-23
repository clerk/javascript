import type {
  UserProfileEmailVerification,
  UserProfileEmailVerifier,
} from '@clerk/mosaic/features/user-profile/user-profile-contact.types';
import type { ReadyEmailSectionModel } from '@clerk/mosaic/features/user-profile/user-profile-email-section/user-profile-email-section.types';

interface FixtureOptions {
  method?: UserProfileEmailVerification['method'];
  fail?: 'create' | 'verify';
  onCreated?: (id: string, emailAddress: string) => void;
  onVerified?: (id: string) => void;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function createUserProfileAddEmailFixture({
  method = 'code',
  fail,
  onCreated,
  onVerified,
}: FixtureOptions = {}): Pick<ReadyEmailSectionModel, 'onCreateEmail' | 'getEmailVerifier'> {
  const startLink = (id: string): Extract<UserProfileEmailVerification, { method: 'link' }> => {
    let cancelled = false;
    const verified = delay(fail === 'verify' ? 2000 : 4000).then(() => {
      if (fail === 'verify') {
        throw new Error('This link has expired. Send a new one.');
      }
      if (!cancelled) {
        onVerified?.(id);
      }
    });
    return { method: 'link', verified, cancel: () => (cancelled = true) };
  };

  const startSso = (id: string): UserProfileEmailVerification => ({
    method: 'sso',
    connect: async () => {
      await delay(1200);
      if (fail === 'verify') {
        throw new Error('Unable to connect. Try again.');
      }
      onVerified?.(id);
    },
  });

  const verifier = (id: string): UserProfileEmailVerifier => {
    let cancelLink: (() => void) | undefined;
    return {
      prepare: async () => {
        cancelLink?.();
        if (method === 'link') {
          const verification = startLink(id);
          cancelLink = verification.cancel;
          return verification;
        }
        if (method === 'sso') {
          return startSso(id);
        }
        await delay(700);
        return { method: 'code' };
      },
      cancel: () => cancelLink?.(),
      verifyCode: async code => {
        await delay(700);
        if (fail === 'verify' || code === '000000') {
          throw new Error('That code is incorrect. Try again.');
        }
        onVerified?.(id);
      },
    };
  };

  return {
    onCreateEmail: async emailAddress => {
      await delay(700);
      if (fail === 'create') {
        throw new Error('We couldn’t add this email. Try again.');
      }
      const id = `email_${Date.now()}`;
      onCreated?.(id, emailAddress);
      return verifier(id);
    },
    getEmailVerifier: verifier,
  };
}
