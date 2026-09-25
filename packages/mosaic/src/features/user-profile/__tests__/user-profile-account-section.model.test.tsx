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

interface FakeVerification {
  status: string | null;
  expireAt?: Date | null;
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
    enterpriseConnection: {
      name: string;
      logoPublicUrl: string | null;
      disableAdditionalIdentifications?: boolean;
    } | null;
  }[];
  primaryEmailAddressId: string | null;
  primaryPhoneNumberId: string | null;
  emailAddresses: {
    id: string;
    emailAddress: string;
    verification: FakeVerification;
    destroy?: ReturnType<typeof vi.fn>;
    prepareVerification?: ReturnType<typeof vi.fn>;
    attemptVerification?: ReturnType<typeof vi.fn>;
  }[];
  phoneNumbers: { id: string; phoneNumber: string; verification: FakeVerification }[];
  setProfileImage: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  createEmailAddress: ReturnType<typeof vi.fn>;
} | null;
let attributes: Record<'first_name' | 'last_name' | 'username' | 'email_address' | 'phone_number', FakeAttribute>;
let usernameSettings: { min_length: number; max_length: number };
let environmentHydrated: boolean;
let enterpriseSSOEnabled: boolean;

function attribute(overrides: Partial<FakeAttribute> = {}): FakeAttribute {
  return { enabled: true, required: false, used_for_first_factor: false, used_for_second_factor: false, ...overrides };
}

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({ isLoaded: isUserLoaded, user }),
    useClerk: () => ({
      __internal_environment: environmentHydrated
        ? { userSettings: { attributes, usernameSettings, enterpriseSSO: { enabled: enterpriseSSOEnabled } } }
        : null,
    }),
  };
});

function renderModel() {
  return renderHook(() => useUserProfileAccountSectionModel()).result.current;
}

async function rejection(save: void | Promise<unknown> | undefined): Promise<FormError | undefined> {
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
  enterpriseSSOEnabled = true;
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
      {
        id: 'email_2',
        emailAddress: 'other@clerk.dev',
        verification: { status: null },
        destroy: vi.fn(() => Promise.resolve()),
        prepareVerification: vi.fn(() => Promise.resolve()),
        attemptVerification: vi.fn(() => Promise.resolve()),
      },
      {
        id: 'email_1',
        emailAddress: 'preston@clerk.dev',
        verification: { status: 'verified' },
        destroy: vi.fn(() => Promise.resolve()),
      },
    ],
    phoneNumbers: [{ id: 'phone_1', phoneNumber: '+18018888181', verification: { status: 'verified' } }],
    setProfileImage: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve(user)),
    createEmailAddress: vi.fn(() => Promise.resolve({ id: 'email_new' })),
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

  it('orders contacts primary first, then verified, then pending by expiry, then never started', () => {
    if (!user) {
      throw new Error('expected a user');
    }
    user.primaryEmailAddressId = 'email_primary';
    user.primaryPhoneNumberId = 'phone_primary';
    user.emailAddresses = [
      { id: 'email_unstarted', emailAddress: 'd@clerk.dev', verification: { status: null } },
      {
        id: 'email_late',
        emailAddress: 'e@clerk.dev',
        verification: { status: 'unverified', expireAt: new Date(2000) },
      },
      { id: 'email_verified_b', emailAddress: 'b@clerk.dev', verification: { status: 'verified' } },
      {
        id: 'email_primary',
        emailAddress: 'a@clerk.dev',
        verification: { status: 'unverified', expireAt: new Date(3000) },
      },
      {
        id: 'email_early',
        emailAddress: 'f@clerk.dev',
        verification: { status: 'unverified', expireAt: new Date(1000) },
      },
      { id: 'email_verified_a', emailAddress: 'c@clerk.dev', verification: { status: 'verified' } },
    ];
    user.phoneNumbers = [
      { id: 'phone_unstarted', phoneNumber: '+18018888183', verification: { status: null } },
      { id: 'phone_verified', phoneNumber: '+18018888182', verification: { status: 'verified' } },
      { id: 'phone_primary', phoneNumber: '+18018888181', verification: { status: 'verified' } },
    ];
    const model = ready();

    expect(model.emails?.map(email => email.id)).toEqual([
      'email_primary',
      'email_verified_a',
      'email_verified_b',
      'email_early',
      'email_late',
      'email_unstarted',
    ]);
    expect(model.phones?.map(phone => phone.id)).toEqual(['phone_primary', 'phone_verified', 'phone_unstarted']);
  });

  it('leaves out the contacts the instance does not collect', () => {
    attributes.email_address = attribute({ enabled: false });
    attributes.phone_number = attribute({ enabled: false });
    const model = ready();

    expect(model.emails).toBeUndefined();
    expect(model.phones).toBeUndefined();
  });

  describe('emails', () => {
    it('sets the chosen email as primary', async () => {
      await ready().onSetPrimaryEmail?.('email_2');
      expect(user?.update).toHaveBeenCalledWith({ primaryEmailAddressId: 'email_2' });
    });

    it('returns the API message when setting the primary fails', async () => {
      user?.update.mockRejectedValue(apiError());
      await expect(rejection(ready().onSetPrimaryEmail?.('email_2'))).resolves.toEqual({
        global: { code: 'form_param_invalid', message: 'That value is invalid.' },
      });
    });

    it('removes the chosen email', async () => {
      await ready().onRemoveEmail?.('email_2');
      expect(user?.emailAddresses[0]?.destroy).toHaveBeenCalled();
      expect(user?.emailAddresses[1]?.destroy).not.toHaveBeenCalled();
    });

    it('returns the API message when removing fails', async () => {
      user?.emailAddresses[0]?.destroy?.mockRejectedValue(apiError());
      await expect(rejection(ready().onRemoveEmail?.('email_2'))).resolves.toEqual({
        global: { code: 'form_param_invalid', message: 'That value is invalid.' },
      });
    });

    it('maps a create error onto the email field', async () => {
      user?.createEmailAddress.mockRejectedValue(apiError('email_address'));
      await expect(rejection(ready().onCreateEmail?.('taken@clerk.dev'))).resolves.toEqual({
        fields: {
          emailAddress: {
            code: 'form_param_invalid',
            paramName: 'email_address',
            message: 'That value is invalid.',
          },
        },
      });
    });

    it('sends a code to the chosen email', async () => {
      const verification = ready().getEmailVerifier?.('email_2').start();
      if (verification?.method !== 'code') {
        throw new Error('expected a code verification');
      }
      await expect(verification.sent).resolves.toBeUndefined();
      expect(user?.emailAddresses[0]?.prepareVerification).toHaveBeenCalledWith({ strategy: 'email_code' });
    });

    it('creates an email and verifies the created address before the user reloads', async () => {
      const prepareVerification = vi.fn(() => Promise.resolve());
      user?.createEmailAddress.mockResolvedValue({ id: 'email_new', prepareVerification });
      const email = await ready().onCreateEmail?.('new@clerk.dev');
      expect(user?.createEmailAddress).toHaveBeenCalledWith({ email: 'new@clerk.dev' });
      email?.start();
      expect(prepareVerification).toHaveBeenCalledWith({ strategy: 'email_code' });
    });

    it('verifies the code for the chosen email', async () => {
      await ready().getEmailVerifier?.('email_2').verifyCode('123456');
      expect(user?.emailAddresses[0]?.attemptVerification).toHaveBeenCalledWith({ code: '123456' });
    });

    it('maps a wrong code onto the code field', async () => {
      user?.emailAddresses[0]?.attemptVerification?.mockRejectedValue(apiError('code'));
      await expect(rejection(ready().getEmailVerifier?.('email_2').verifyCode('000000'))).resolves.toEqual({
        fields: { code: { code: 'form_param_invalid', paramName: 'code', message: 'That value is invalid.' } },
      });
    });

    it('offers no new email when the email address is immutable', () => {
      attributes.email_address = attribute({ immutable: true });
      expect(ready().onCreateEmail).toBeUndefined();
    });

    it('offers no new email when the active enterprise connection forbids more identifications', () => {
      user?.enterpriseAccounts.push({
        active: true,
        provider: 'saml_okta',
        enterpriseConnection: { name: 'Okta', logoPublicUrl: null, disableAdditionalIdentifications: true },
      });
      expect(ready().onCreateEmail).toBeUndefined();
    });

    it('ignores the enterprise restriction when the instance has enterprise SSO off', () => {
      enterpriseSSOEnabled = false;
      user?.enterpriseAccounts.push({
        active: true,
        provider: 'saml_okta',
        enterpriseConnection: { name: 'Okta', logoPublicUrl: null, disableAdditionalIdentifications: true },
      });
      expect(ready().onCreateEmail).toBeDefined();
    });

    it('still offers a new primary but no removal when the email address is immutable', () => {
      attributes.email_address = attribute({ immutable: true });
      const model = ready();
      expect(model.onSetPrimaryEmail).toBeDefined();
      expect(model.onRemoveEmail).toBeUndefined();
    });
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
