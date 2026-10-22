import { isRecord } from './hydration';
import type { UserSnapshot, UserVerification } from './types';

function nullableString(value: unknown): string | null {
  if (value === null || typeof value === 'string') {
    return value;
  }
  throw new Error('Invalid Loom user field.');
}

function verificationSnapshot(value: unknown): UserVerification | null {
  if (value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid Loom user verification.');
  }
  const expireAt = value.expireAt ?? null;
  if (expireAt !== null && (typeof expireAt !== 'number' || !Number.isFinite(expireAt) || expireAt < 0)) {
    throw new Error('Invalid Loom verification expiry.');
  }
  const error = value.error ?? null;
  let parsedError: UserVerification['error'] = null;
  if (error !== null) {
    if (!isRecord(error) || typeof error.code !== 'string' || typeof error.longMessage !== 'string') {
      throw new Error('Invalid Loom verification error.');
    }
    parsedError = { code: error.code, longMessage: error.longMessage };
  }
  return {
    status: nullableString(value.status),
    strategy: nullableString(value.strategy ?? null),
    expireAt,
    error: parsedError,
  };
}

function enterpriseSnapshot(value: unknown): UserSnapshot['enterpriseAccounts'] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid Loom enterprise accounts.');
  }
  return value.map((account: unknown) => {
    if (!isRecord(account) || typeof account.active !== 'boolean' || typeof account.provider !== 'string') {
      throw new Error('Invalid Loom enterprise account.');
    }
    const connection = account.enterpriseConnection;
    let enterpriseConnection: UserSnapshot['enterpriseAccounts'][number]['enterpriseConnection'] = null;
    if (connection !== null) {
      if (
        !isRecord(connection) ||
        typeof connection.name !== 'string' ||
        typeof connection.disableAdditionalIdentifications !== 'boolean'
      ) {
        throw new Error('Invalid Loom enterprise connection.');
      }
      enterpriseConnection = {
        name: connection.name,
        disableAdditionalIdentifications: connection.disableAdditionalIdentifications,
      };
    }
    return { active: account.active, provider: account.provider, enterpriseConnection };
  });
}

export function userSnapshot(value: unknown, userId: string): UserSnapshot {
  if (!isRecord(value) || value.id !== userId) {
    throw new Error('Loom user does not match the authenticated request.');
  }
  if (
    typeof value.imageUrl !== 'string' ||
    typeof value.hasImage !== 'boolean' ||
    !Array.isArray(value.emailAddresses) ||
    typeof value.passwordEnabled !== 'boolean' ||
    typeof value.deleteSelfEnabled !== 'boolean' ||
    !Array.isArray(value.externalAccounts)
  ) {
    throw new Error('Invalid Loom user field.');
  }
  const emailAddresses = value.emailAddresses.map((email: unknown) => {
    if (
      !isRecord(email) ||
      typeof email.id !== 'string' ||
      !email.id ||
      typeof email.emailAddress !== 'string' ||
      !email.emailAddress
    ) {
      throw new Error('Invalid Loom user email address.');
    }
    return { id: email.id, emailAddress: email.emailAddress, verification: verificationSnapshot(email.verification) };
  });
  const externalAccounts = value.externalAccounts.map((account: unknown) => {
    if (
      !isRecord(account) ||
      typeof account.id !== 'string' ||
      !account.id ||
      typeof account.provider !== 'string' ||
      !account.provider ||
      typeof account.emailAddress !== 'string' ||
      typeof account.approvedScopes !== 'string'
    ) {
      throw new Error('Invalid Loom user external account.');
    }
    return {
      id: account.id,
      provider: account.provider,
      username: nullableString(account.username),
      emailAddress: account.emailAddress,
      approvedScopes: account.approvedScopes,
      verification: verificationSnapshot(account.verification),
    };
  });
  if (
    new Set(emailAddresses.map(email => email.id)).size !== emailAddresses.length ||
    new Set(externalAccounts.map(account => account.id)).size !== externalAccounts.length
  ) {
    throw new Error('Duplicate Loom user identification.');
  }
  return {
    id: userId,
    firstName: nullableString(value.firstName),
    lastName: nullableString(value.lastName),
    username: nullableString(value.username),
    imageUrl: value.imageUrl,
    hasImage: value.hasImage,
    primaryEmailAddressId: nullableString(value.primaryEmailAddressId),
    emailAddresses,
    enterpriseAccounts: enterpriseSnapshot(value.enterpriseAccounts),
    passwordEnabled: value.passwordEnabled,
    deleteSelfEnabled: value.deleteSelfEnabled,
    externalAccounts,
  };
}

function wireVerification(value: unknown) {
  if (!isRecord(value)) {
    return value;
  }
  const error = value.error;
  return {
    status: value.status,
    strategy: value.strategy ?? null,
    expireAt: value.expire_at ?? null,
    error: isRecord(error)
      ? { code: error.code, longMessage: error.long_message ?? error.message ?? '' }
      : (error ?? null),
  };
}

export function parseUser(payload: unknown, userId: string): UserSnapshot {
  if (!isRecord(payload) || !isRecord(payload.response)) {
    throw new Error('Invalid Loom user response.');
  }
  const value = payload.response;
  return userSnapshot(
    {
      id: value.id,
      firstName: value.first_name,
      lastName: value.last_name,
      username: value.username,
      imageUrl: value.image_url,
      hasImage: value.has_image,
      primaryEmailAddressId: value.primary_email_address_id,
      emailAddresses: Array.isArray(value.email_addresses)
        ? value.email_addresses.map((email: unknown) =>
            isRecord(email)
              ? {
                  id: email.id,
                  emailAddress: email.email_address,
                  verification: wireVerification(email.verification),
                }
              : email,
          )
        : value.email_addresses,
      passwordEnabled: value.password_enabled,
      deleteSelfEnabled: value.delete_self_enabled,
      externalAccounts: Array.isArray(value.external_accounts)
        ? value.external_accounts.map((account: unknown) => {
            if (!isRecord(account)) {
              return account;
            }
            if (
              account.external_account_id !== undefined &&
              account.external_account_id !== null &&
              (typeof account.external_account_id !== 'string' ||
                !account.external_account_id ||
                (typeof account.id === 'string' &&
                  account.id.startsWith('eac_') &&
                  account.id !== account.external_account_id))
            ) {
              throw new Error('Invalid Loom canonical external account ID.');
            }
            return {
              id: account.external_account_id ?? account.id,
              provider: account.provider,
              username: account.username,
              emailAddress: account.email_address,
              approvedScopes: account.approved_scopes ?? '',
              verification: wireVerification(account.verification),
            };
          })
        : value.external_accounts,
      enterpriseAccounts: Array.isArray(value.enterprise_accounts)
        ? value.enterprise_accounts.map((account: unknown) => {
            if (!isRecord(account)) {
              return account;
            }
            const connection = account.enterprise_connection;
            return {
              active: account.active,
              provider: account.provider,
              enterpriseConnection: isRecord(connection)
                ? {
                    name: connection.name,
                    disableAdditionalIdentifications: connection.disable_additional_identifications,
                  }
                : connection,
            };
          })
        : value.enterprise_accounts,
    },
    userId,
  );
}

export function backendUserSnapshot(value: unknown, userId: string): UserSnapshot {
  if (!isRecord(value) || !isRecord(value.raw)) {
    throw new Error('Loom profile requires the backend raw user.');
  }
  return parseUser({ response: value.raw }, userId);
}

export function resourceUserSnapshot(value: unknown, userId: string): UserSnapshot {
  if (!isRecord(value)) {
    throw new Error('Invalid Loom user resource.');
  }
  const verification = (input: unknown) => {
    if (!isRecord(input)) {
      return input;
    }
    return {
      status: input.status,
      strategy: input.strategy ?? null,
      expireAt: input.expireAt instanceof Date ? input.expireAt.getTime() : (input.expireAt ?? null),
      error: isRecord(input.error)
        ? { code: input.error.code, longMessage: input.error.longMessage ?? input.error.message ?? '' }
        : (input.error ?? null),
    };
  };
  return userSnapshot(
    {
      ...value,
      enterpriseAccounts: value.enterpriseAccounts ?? [],
      emailAddresses: Array.isArray(value.emailAddresses)
        ? value.emailAddresses.map((email: unknown) =>
            isRecord(email)
              ? {
                  id: email.id,
                  emailAddress: email.emailAddress,
                  verification: verification(email.verification),
                }
              : email,
          )
        : value.emailAddresses,
      externalAccounts: Array.isArray(value.externalAccounts)
        ? value.externalAccounts.map((account: unknown) =>
            isRecord(account)
              ? {
                  id: account.id,
                  provider: account.provider,
                  username: account.username ?? null,
                  emailAddress: account.emailAddress,
                  approvedScopes: account.approvedScopes ?? '',
                  verification: verification(account.verification),
                }
              : account,
          )
        : value.externalAccounts,
    },
    userId,
  );
}
