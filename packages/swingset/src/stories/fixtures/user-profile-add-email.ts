import type {
  UserProfileEmailVerification,
  UserProfileEmailVerifier,
} from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.types';
import type { UserProfileAccountSectionViewProps } from '@clerk/mosaic/features/user-profile/user-profile-account-section/user-profile-account-section.view';

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
}: FixtureOptions = {}): Pick<UserProfileAccountSectionViewProps, 'onCreateEmail' | 'getEmailVerifier'> {
  const startLink = (id: string): UserProfileEmailVerification => {
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

  const startSso = (id: string): UserProfileEmailVerification => {
    let connect = () => undefined;
    const verified = new Promise<void>((resolve, reject) => {
      connect = () => {
        void delay(1200).then(() => {
          if (fail === 'verify') {
            reject(new Error('Unable to connect. Try again.'));
            return;
          }
          onVerified?.(id);
          resolve();
        });
      };
    });
    return { method: 'sso', verified, cancel: () => undefined, connect: () => connect() };
  };

  const verifier = (id: string): UserProfileEmailVerifier => ({
    start: () => {
      if (method === 'link') {
        return startLink(id);
      }
      if (method === 'sso') {
        return startSso(id);
      }
      return { method: 'code', sent: delay(700).then(() => undefined) };
    },
    verifyCode: async code => {
      await delay(700);
      if (fail === 'verify' || code === '000000') {
        throw new Error('That code is incorrect. Try again.');
      }
      onVerified?.(id);
    },
  });

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
