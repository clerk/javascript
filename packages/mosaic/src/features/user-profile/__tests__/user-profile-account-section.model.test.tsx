import { ClerkAPIResponseError, ClerkRuntimeError } from '@clerk/shared/error';
import type * as SharedReact from '@clerk/shared/react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FormError } from '../../../utils/form-error';
import { SaveError } from '../../../utils/form-error';
import { useUserProfileAccountSectionModel } from '../user-profile-account-section/user-profile-account-section.model';

interface FakeAttribute {
  enabled: boolean;
  required: boolean;
  immutable?: boolean;
  used_for_first_factor: boolean;
  used_for_second_factor: boolean;
}

let isUserLoaded: boolean;
let user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string;
  hasImage: boolean;
  enterpriseAccounts: {
    active: boolean;
    provider: string;
    enterpriseConnection: { name: string; logoPublicUrl: string | null } | null;
  }[];
  primaryEmailAddressId: string | null;
  primaryPhoneNumberId: string | null;
  emailAddresses: { id: string; emailAddress: string; verification: { status: string | null } }[];
  phoneNumbers: { id: string; phoneNumber: string; verification: { status: string | null } }[];
  setProfileImage: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
} | null;
let attributes: Record<'first_name' | 'last_name' | 'username' | 'email_address' | 'phone_number', FakeAttribute>;
let usernameSettings: { min_length: number; max_length: number };
let environmentHydrated: boolean;

function attribute(overrides: Partial<FakeAttribute> = {}): FakeAttribute {
  return { enabled: true, required: false, used_for_first_factor: false, used_for_second_factor: false, ...overrides };
}

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({ isLoaded: isUserLoaded, user }),
    useClerk: () => ({
      __internal_environment: environmentHydrated ? { userSettings: { attributes, usernameSettings } } : null,
    }),
  };
});

function renderModel() {
  return renderHook(() => useUserProfileAccountSectionModel()).result.current;
}

async function rejection(save: Promise<void> | undefined): Promise<FormError | undefined> {
  try {
    await save;
    return undefined;
  } catch (cause) {
    return cause instanceof SaveError ? cause.formError : undefined;
  }
}

function ready() {
  const model = renderModel();
  if (model.status !== 'ready') {
    throw new Error(`expected ready, got ${model.status}`);
  }
  return model;
}

function apiError(paramName?: string) {
  return new ClerkAPIResponseError('failed', {
    data: [
      {
        code: 'form_param_invalid',
        message: 'Is invalid',
        long_message: 'That value is invalid.',
        meta: paramName ? { param_name: paramName } : undefined,
      },
    ],
    status: 422,
  });
}

beforeEach(() => {
  isUserLoaded = true;
  environmentHydrated = true;
  usernameSettings = { min_length: 4, max_length: 64 };
  attributes = {
    first_name: attribute(),
    last_name: attribute(),
    username: attribute(),
    email_address: attribute(),
    phone_number: attribute(),
  };
  user = {
    firstName: 'Preston',
    lastName: 'Booth',
    username: 'prestonxyz',
    imageUrl: 'https://img.clerk.com/preston.png',
    hasImage: true,
    enterpriseAccounts: [],
    primaryEmailAddressId: 'email_1',
    primaryPhoneNumberId: null,
    emailAddresses: [
      { id: 'email_2', emailAddress: 'other@clerk.dev', verification: { status: null } },
      { id: 'email_1', emailAddress: 'preston@clerk.dev', verification: { status: 'verified' } },
    ],
    phoneNumbers: [{ id: 'phone_1', phoneNumber: '+18018888181', verification: { status: 'verified' } }],
    setProfileImage: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve(user)),
  };
});

describe('useUserProfileAccountSectionModel', () => {
  it('waits for the user and the environment', () => {
    isUserLoaded = false;
    expect(renderModel()).toEqual({ status: 'loading' });

    isUserLoaded = true;
    environmentHydrated = false;
    expect(renderModel()).toEqual({ status: 'loading' });
  });

  it('is hidden when nobody is signed in', () => {
    user = null;
    expect(renderModel()).toEqual({ status: 'hidden' });
  });

  it('maps the user to plain row data', () => {
    const model = ready();

    expect(model).toMatchObject({
      name: 'Preston Booth',
      firstName: 'Preston',
      lastName: 'Booth',
      username: 'prestonxyz',
      imageUrl: 'https://img.clerk.com/preston.png',
      hasImage: true,
      firstNameAttribute: { enabled: true, required: false },
      lastNameAttribute: { enabled: true, required: false },
      emails: [
        { id: 'email_1', value: 'preston@clerk.dev', isDefault: true, isVerified: true },
        { id: 'email_2', value: 'other@clerk.dev', isDefault: false, isVerified: false },
      ],
      phones: [{ id: 'phone_1', value: '+18018888181', isDefault: false, isVerified: true }],
    });
  });

  it('leaves out the contacts the instance does not collect', () => {
    attributes.email_address = attribute({ enabled: false });
    attributes.phone_number = attribute({ enabled: false });
    const model = ready();

    expect(model.emails).toBeUndefined();
    expect(model.phones).toBeUndefined();
  });

  describe('profile picture', () => {
    it('uploads the picked file', async () => {
      const file = new File(['x'], 'me.png', { type: 'image/png' });
      await ready().onProfilePictureChange?.(file);
      expect(user?.setProfileImage).toHaveBeenCalledWith({ file });
    });

    it('removes an uploaded picture', async () => {
      await ready().onRemoveProfilePicture?.();
      expect(user?.setProfileImage).toHaveBeenCalledWith({ file: null });
    });

    it('offers no remove while the avatar is the generated default', () => {
      if (user) {
        user.hasImage = false;
      }
      expect(ready().onRemoveProfilePicture).toBeUndefined();
    });

    it('returns the API message when the upload fails', async () => {
      user?.setProfileImage.mockRejectedValue(apiError());
      const file = new File(['x'], 'me.png', { type: 'image/png' });
      await expect(rejection(ready().onProfilePictureChange?.(file))).resolves.toEqual({
        global: { code: 'form_param_invalid', message: 'That value is invalid.' },
      });
    });
  });

  describe('name', () => {
    it('saves both halves of the name', async () => {
      await ready().onSubmitName?.({ firstName: 'Pres', lastName: 'B' });
      expect(user?.update).toHaveBeenCalledWith({ firstName: 'Pres', lastName: 'B' });
    });

    it('maps a field error onto the control that caused it', async () => {
      user?.update.mockRejectedValue(apiError('first_name'));
      await expect(rejection(ready().onSubmitName?.({ firstName: '', lastName: 'B' }))).resolves.toEqual({
        fields: {
          firstName: { code: 'form_param_invalid', paramName: 'first_name', message: 'That value is invalid.' },
        },
      });
    });

    it('names the connection managing the name instead of offering to edit it', () => {
      user?.enterpriseAccounts.push({
        active: true,
        provider: 'saml_okta',
        enterpriseConnection: { name: 'Okta', logoPublicUrl: 'https://img.clerk.com/okta.svg' },
      });
      expect(ready()).toMatchObject({
        nameManagedBy: { name: 'Okta', iconUrl: 'https://img.clerk.com/okta.svg' },
        onSubmitName: undefined,
      });
    });

    it('falls back to the provider when the active account carries no connection', () => {
      user?.enterpriseAccounts.push({ active: true, provider: 'saml_okta', enterpriseConnection: null });
      expect(ready().nameManagedBy).toEqual({ name: 'okta', iconUrl: undefined });
    });

    it('passes the instance name attributes through for the row to hide itself', () => {
      attributes.first_name = attribute({ enabled: false });
      attributes.last_name = attribute({ required: true });
      expect(ready()).toMatchObject({
        firstNameAttribute: { enabled: false, required: false },
        lastNameAttribute: { enabled: true, required: true },
      });
    });
  });

  it('returns a Clerk runtime failure by its code, without the developer message', async () => {
    user?.update.mockRejectedValue(new ClerkRuntimeError('Network down.', { code: 'network_error' }));
    await expect(rejection(ready().onSubmitName?.({ firstName: 'Pres', lastName: 'B' }))).resolves.toEqual({
      global: { code: 'network_error' },
    });
  });

  it('rethrows a failure that is not from Clerk', async () => {
    user?.update.mockRejectedValue(new TypeError('boom'));
    await expect(ready().onSubmitName?.({ firstName: 'Pres', lastName: 'B' })).rejects.toThrow('boom');
  });

  describe('username', () => {
    it('saves the username', async () => {
      await ready().onSubmitUsername?.('preston');
      expect(user?.update).toHaveBeenCalledWith({ username: 'preston' });
    });

    it('maps a username error onto the field, with the configured length bounds to fill its message', async () => {
      user?.update.mockRejectedValue(apiError('username'));
      await expect(rejection(ready().onSubmitUsername?.('x'))).resolves.toEqual({
        fields: {
          username: {
            code: 'form_param_invalid',
            paramName: 'username',
            message: 'That value is invalid.',
            params: { min_length: 4, max_length: 64 },
          },
        },
      });
    });

    it('is hidden when the instance does not use usernames', () => {
      attributes.username = attribute({ enabled: false });
      expect(ready().username).toBeUndefined();
    });

    it('stays available when usernames only sign in', () => {
      attributes.username = attribute({ enabled: false, used_for_first_factor: true });
      expect(ready().username).toBe('prestonxyz');
    });

    it('shows an immutable username without offering to edit it', () => {
      attributes.username = attribute({ immutable: true });
      const model = ready();
      expect(model.username).toBe('prestonxyz');
      expect(model.onSubmitUsername).toBeUndefined();
    });

    it('is hidden when immutable and never set', () => {
      attributes.username = attribute({ immutable: true });
      if (user) {
        user.username = null;
      }
      expect(ready().username).toBeUndefined();
    });
  });
});
