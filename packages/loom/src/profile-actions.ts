import { buildURL } from '@clerk/shared/internal/clerk-js/url';

import type { ClerkSessionsHost } from './clerk';
import type { LoomClient } from './client';
import type { ProfileActionOptions, ProfileActions, ProfileEmailVerifier } from './profile-actions-types';
import { unavailableProfileActions } from './profile-actions-unavailable';
import { connectedAccountActions } from './profile-connected-actions';
import { enterpriseActions } from './profile-enterprise-actions';
import { mfaActions } from './profile-mfa-actions';
import { passkeyActions } from './profile-passkey-actions';
import { passwordActions } from './profile-password-actions';
import { phoneActions } from './profile-phone-actions';
import { walletActions } from './profile-wallet-actions';

export function createProfileActions(
  host: ClerkSessionsHost,
  owner: LoomClient,
  assertCurrent: () => void,
  options: ProfileActionOptions,
  canCompleteDeletion: () => boolean,
): ProfileActions {
  const current = () => {
    assertCurrent();
    if (!host.user) {
      throw new Error('User unavailable.');
    }
    return host.user;
  };
  const environment = () => {
    current();
    const value = host.__internal_environment;
    if (!value) {
      throw new Error('Profile policy unavailable.');
    }
    return value;
  };
  const navigate = async (url: string) => {
    current();
    if (options.navigate) {
      await options.navigate(url);
    } else if (host.navigate) {
      await host.navigate(url);
    } else {
      window.location.assign(url);
    }
    current();
  };
  const canAdd = () =>
    !environment().userSettings.enterpriseSSO.enabled ||
    !current().enterpriseAccounts?.some(
      account => account.active && account.enterpriseConnection?.disableAdditionalIdentifications,
    );
  const emailAccess = () => {
    const attribute = environment().userSettings.attributes.email_address;
    const show = Boolean(attribute?.enabled || attribute?.used_for_first_factor || attribute?.used_for_second_factor);
    return { show, mutable: show && !attribute?.immutable };
  };
  const email = (id: string) => {
    if (!emailAccess().show) {
      throw new Error('Email unavailable.');
    }
    const target = current().emailAddresses?.find(item => item.id === id);
    if (!target) {
      throw new Error('Email unavailable.');
    }
    return target;
  };
  const verifier = (id: string): ProfileEmailVerifier => ({
    start: () => {
      const target = email(id);
      if (target.matchesSsoConnection) {
        return {
          method: 'sso',
          connect: async () => {
            await owner.mutateProfile(async () => {
              const target = email(id);
              if (!target.prepareVerification) {
                throw new Error('Email verification unavailable.');
              }
              const result = await target.prepareVerification({
                strategy: 'enterprise_sso',
                redirectUrl: window.location.href,
              });
              email(id);
              const url = result.verification.externalVerificationRedirectURL;
              if (!url) {
                throw new Error('Enterprise SSO verification did not return a redirect URL');
              }
              await navigate(url.href);
            });
          },
        };
      }
      if (!environment().userSettings.attributes.email_address?.verifications.includes('email_link')) {
        return {
          method: 'code',
          sent: owner.mutateProfile(async () => {
            const target = email(id);
            if (!target.prepareVerification) {
              throw new Error('Email verification unavailable.');
            }
            await target.prepareVerification({ strategy: 'email_code' });
            email(id);
          }),
        };
      }
      if (!target.createEmailLinkFlow) {
        throw new Error('Email verification unavailable.');
      }
      const flow = target.createEmailLinkFlow();
      let cancelled = false;
      const cancel = () => {
        if (!cancelled) {
          cancelled = true;
          flow.cancelEmailLinkFlow();
        }
      };
      const unregister = owner.onDispose(cancel);
      const redirectUrl = buildURL(
        { base: environment().displayConfig.userProfileUrl, hashPath: '/verify' },
        { stringify: true },
      );
      return {
        method: 'link',
        cancel: () => {
          cancel();
          unregister();
        },
        verified: (async () => {
          try {
            email(id);
            const pending = flow.startEmailLinkFlow({ redirectUrl });
            void owner.invalidateUser().catch(() => {});
            await pending;
            email(id);
            await owner.invalidateUser();
            email(id);
          } finally {
            unregister();
          }
        })(),
      };
    },
    verifyCode: code =>
      owner.mutateProfile(async () => {
        const target = email(id);
        if (!target.attemptVerification) {
          throw new Error('Email verification unavailable.');
        }
        await target.attemptVerification({ code });
        email(id);
      }),
  });
  const user = current();
  const policy = host.__internal_environment;
  const canUsername = () => {
    const attribute = environment().userSettings.attributes.username;
    return Boolean(
      (attribute?.enabled || attribute?.used_for_first_factor || attribute?.used_for_second_factor) &&
      !attribute.immutable,
    );
  };
  const mutate = (operation: () => Promise<unknown>) =>
    owner.mutateProfile(async () => {
      current();
      await operation();
      current();
    });
  const details: ProfileActions['details'] = {
    usernameLength: policy
      ? { min: policy.userSettings.usernameSettings.min_length, max: policy.userSettings.usernameSettings.max_length }
      : undefined,
    updateName:
      user.update && !user.enterpriseAccounts?.some(account => account.active)
        ? async input => {
            current();
            await owner.updateName(input);
            current();
          }
        : undefined,
    updateUsername:
      user.update && policy && canUsername()
        ? username =>
            mutate(async () => {
              if (!canUsername()) {
                throw new Error('Username unavailable.');
              }
              const target = current();
              if (!target.update) {
                throw new Error('Username unavailable.');
              }
              await target.update({ username });
            })
        : undefined,
    setProfileImage: user.setProfileImage
      ? file =>
          mutate(async () => {
            const target = current();
            if (!target.setProfileImage) {
              throw new Error('Profile image unavailable.');
            }
            await target.setProfileImage({ file });
          })
      : undefined,
    removeProfileImage:
      user.setProfileImage && user.hasImage
        ? () =>
            mutate(async () => {
              const target = current();
              if (!target.hasImage || !target.setProfileImage) {
                throw new Error('Profile image unavailable.');
              }
              await target.setProfileImage({ file: null });
            })
        : undefined,
  };
  const access = policy ? emailAccess() : { show: false, mutable: false };
  return {
    details,
    email: {
      available: access.show,
      canManageEmail: id => {
        const target = user.emailAddresses?.find(item => item.id === id);
        if (!access.show || !user.update || !target) {
          return false;
        }
        if (target.verification?.status === 'verified') {
          return true;
        }
        if (target.matchesSsoConnection) {
          return Boolean(target.prepareVerification);
        }
        if (policy?.userSettings.attributes.email_address?.verifications.includes('email_link')) {
          return Boolean(target.createEmailLinkFlow);
        }
        return Boolean(target.prepareVerification && target.attemptVerification);
      },
      verifier,
      create: access.mutable && canAdd() && user.createEmailAddress ? address => ownerCreateEmail(address) : undefined,
      setPrimary:
        access.show && user.update
          ? id =>
              mutate(async () => {
                const target = email(id);
                const user = current();
                if (!user.update) {
                  throw new Error('Email unavailable.');
                }
                await user.update({ primaryEmailAddressId: target.id });
              })
          : undefined,
      remove:
        access.mutable && user.emailAddresses?.some(item => item.destroy)
          ? id =>
              mutate(async () => {
                if (!emailAccess().mutable) {
                  throw new Error('Email unavailable.');
                }
                const target = email(id);
                if (!target.destroy) {
                  throw new Error('Email unavailable.');
                }
                await target.destroy();
              })
          : undefined,
    },
    phone: policy
      ? phoneActions(owner, current, environment, canAdd, host.__internal_country)
      : unavailableProfileActions.phone,
    passkey: policy ? passkeyActions(host, owner, current, environment, canAdd) : unavailableProfileActions.passkey,
    wallet: policy ? walletActions(host, owner, current, environment, canAdd) : unavailableProfileActions.wallet,
    enterprise: policy
      ? enterpriseActions(owner, current, environment, navigate, options)
      : unavailableProfileActions.enterprise,
    mfa: policy ? mfaActions(owner, current, environment) : unavailableProfileActions.mfa,
    connectedAccounts: connectedAccountActions(host, owner, current, environment, navigate, options),
    password: passwordActions(host, owner, current, environment),
    danger: {
      delete:
        user.deleteSelfEnabled &&
        user.delete &&
        host.setActive &&
        host.buildAfterSignOutUrl &&
        host.buildAfterMultiSessionSingleSignOutUrl &&
        host.client
          ? async () => {
              const user = current();
              if (!user.deleteSelfEnabled || !user.delete) {
                throw new Error('Account deletion unavailable.');
              }
              await user.delete();
              if (!canCompleteDeletion()) {
                return;
              }
              if (
                !host.setActive ||
                !host.buildAfterSignOutUrl ||
                !host.buildAfterMultiSessionSingleSignOutUrl ||
                !host.client
              ) {
                return;
              }
              const hasOthers = host.client.signedInSessions.some(session => session.user?.id !== user.id);
              await host.setActive({
                session: null,
                redirectUrl: hasOthers ? host.buildAfterMultiSessionSingleSignOutUrl() : host.buildAfterSignOutUrl(),
              });
            }
          : undefined,
    },
  };
  async function ownerCreateEmail(address: string) {
    let id: string | undefined;
    await mutate(async () => {
      if (!emailAccess().mutable || !canAdd()) {
        throw new Error('Email creation unavailable.');
      }
      const user = current();
      if (!user.createEmailAddress) {
        throw new Error('Email creation unavailable.');
      }
      const created = await user.createEmailAddress({ email: address });
      current();
      id = created.id;
    });
    if (!id) {
      throw new Error('Email creation unavailable.');
    }
    return verifier(id);
  }
}
