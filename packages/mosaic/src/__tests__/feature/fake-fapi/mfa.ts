import type { ClientJSON, PhoneNumberJSON, UserJSON } from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';

import { type FapiEnvironment, fapiPhoneNumber, fapiVerification } from '../fapi';
import { envelope, missing, requestUser, updateUser, VERIFICATION_CODE } from './shared';

export interface FakeMfaState {
  totpCreations: number;
  totpAttempts: string[];
  totpRemovals: number;
  backupCodeCreations: number;
  phoneCreations: string[];
  phonePreparations: string[];
  phoneAttempts: { id: string; code: string }[];
  phoneUpdates: { id: string; reserved?: boolean; default?: boolean }[];
  codes: string[];
}

export function createMfaState(): FakeMfaState {
  return {
    totpCreations: 0,
    totpAttempts: [],
    totpRemovals: 0,
    backupCodeCreations: 0,
    phoneCreations: [],
    phonePreparations: [],
    phoneAttempts: [],
    phoneUpdates: [],
    codes: Array.from({ length: 10 }, (_, index) => `CODE00${String(index + 1).padStart(2, '0')}`),
  };
}

export function mfaHandlers(
  state: { client: ClientJSON; environment: FapiEnvironment; mfa: FakeMfaState },
  fapiUrl: (path: string) => string,
) {
  const backupEnabled = () =>
    state.environment.user_settings.attributes.backup_code.enabled &&
    state.environment.user_settings.attributes.backup_code.used_for_second_factor;
  const usableFactors = (user: UserJSON) =>
    Number(user.totp_enabled) +
    user.phone_numbers.filter(phone => phone.reserved_for_second_factor && phone.verification?.status === 'verified')
      .length;
  const error = (code: string, message: string, status = 400) =>
    HttpResponse.json({ errors: [{ code, message, long_message: message }] }, { status });
  const updatePhone = (user: UserJSON, id: string, transform: (phone: PhoneNumberJSON) => PhoneNumberJSON) => {
    const phone = user.phone_numbers.find(phone => phone.id === id);
    if (!phone) {
      return undefined;
    }
    const updated = transform(phone);
    updateUser(state, {
      ...user,
      phone_numbers: user.phone_numbers.map(phone => (phone.id === id ? updated : phone)),
    });
    return updated;
  };

  return [
    http.post(fapiUrl('/v1/me/totp'), ({ request }) => {
      const currentUser = requestUser(state, request);
      if (!currentUser) {
        return missing();
      }
      if (new URL(request.url).searchParams.get('_method') === 'DELETE') {
        if (
          !currentUser.totp_enabled ||
          (state.environment.user_settings.sign_up.mfa?.required && usableFactors(currentUser) <= 1)
        ) {
          return error('second_factor_deletion_not_allowed', 'This method cannot be removed.');
        }
        state.mfa.totpRemovals += 1;
        updateUser(state, {
          ...currentUser,
          totp_enabled: false,
          two_factor_enabled: currentUser.phone_numbers.some(phone => phone.reserved_for_second_factor),
          backup_code_enabled:
            currentUser.phone_numbers.some(phone => phone.reserved_for_second_factor) &&
            currentUser.backup_code_enabled,
        });
        return envelope({ object: 'deleted', id: 'totp_1' }, state.client);
      }
      if (
        currentUser.totp_enabled ||
        !state.environment.user_settings.attributes.authenticator_app.used_for_second_factor
      ) {
        return error('form_param_value_invalid', 'Authenticator is unavailable.', 422);
      }
      state.mfa.totpCreations += 1;
      return envelope(
        {
          object: 'totp',
          id: 'totp_1',
          secret: `SECRET${state.mfa.totpCreations}`,
          uri: `otpauth://totp/Acme:user?secret=SECRET${state.mfa.totpCreations}`,
          verified: false,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
        state.client,
      );
    }),
    http.post(fapiUrl('/v1/me/totp/attempt_verification'), async ({ request }) => {
      const currentUser = requestUser(state, request);
      if (!currentUser) {
        return missing();
      }
      if (state.mfa.totpCreations === 0 || currentUser.totp_enabled) {
        return error('form_param_value_invalid', 'No authenticator setup is pending.', 422);
      }
      const code = new URLSearchParams(await request.text()).get('code') ?? '';
      state.mfa.totpAttempts.push(code);
      if (code !== '123456') {
        return HttpResponse.json(
          { errors: [{ code: 'form_code_incorrect', message: 'Incorrect code', long_message: 'Incorrect code' }] },
          { status: 422 },
        );
      }
      const newCodes = backupEnabled() && !currentUser.backup_code_enabled;
      updateUser(state, {
        ...currentUser,
        totp_enabled: true,
        two_factor_enabled: true,
        backup_code_enabled: currentUser.backup_code_enabled || newCodes,
      });
      return envelope(
        {
          object: 'totp',
          id: 'totp_1',
          verified: true,
          ...(newCodes ? { backup_codes: state.mfa.codes } : {}),
          created_at: Date.now(),
          updated_at: Date.now(),
        },
        state.client,
      );
    }),
    http.post(fapiUrl('/v1/me/backup_codes/'), ({ request }) => {
      const currentUser = requestUser(state, request);
      if (!currentUser || usableFactors(currentUser) === 0 || !backupEnabled()) {
        return error('form_param_value_invalid', 'Set up a verification method first.', 422);
      }
      state.mfa.backupCodeCreations += 1;
      state.mfa.codes = Array.from(
        { length: 10 },
        (_, index) => `CODE${String(state.mfa.backupCodeCreations).padStart(2, '0')}${String(index).padStart(2, '0')}`,
      );
      updateUser(state, { ...currentUser, backup_code_enabled: true });
      return envelope(
        {
          object: 'backup_code',
          id: 'backup_1',
          codes: state.mfa.codes,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
        state.client,
      );
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/'), async ({ request }) => {
      const currentUser = requestUser(state, request);
      if (!currentUser) {
        return missing();
      }
      const number = new URLSearchParams(await request.text()).get('phone_number') ?? '';
      state.mfa.phoneCreations.push(number);
      if (currentUser.phone_numbers.some(phone => phone.phone_number === number)) {
        return HttpResponse.json(
          {
            errors: [
              {
                code: 'form_identifier_exists',
                message: 'This phone number already exists.',
                long_message: 'This phone number already exists.',
                meta: { param_name: 'phone_number' },
              },
            ],
          },
          { status: 422 },
        );
      }
      const existingIds = new Set(currentUser.phone_numbers.map(phone => phone.id));
      let nextPhoneNumber = state.mfa.phoneCreations.length;
      while (existingIds.has(`phone_${nextPhoneNumber}`)) {
        nextPhoneNumber += 1;
      }
      const phone = fapiPhoneNumber({
        id: `phone_${nextPhoneNumber}`,
        phone_number: number,
        verification: fapiVerification('phone_code'),
      });
      updateUser(state, { ...currentUser, phone_numbers: [...currentUser.phone_numbers, phone] });
      return envelope(phone, state.client);
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/:id/prepare_verification'), ({ params, request }) => {
      const currentUser = requestUser(state, request);
      if (!currentUser) {
        return missing();
      }
      const id = String(params.id);
      state.mfa.phonePreparations.push(id);
      const phone = updatePhone(currentUser, id, current => ({
        ...current,
        verification: fapiVerification('phone_code'),
      }));
      return phone ? envelope(phone, state.client) : missing();
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/:id/attempt_verification'), async ({ params, request }) => {
      const currentUser = requestUser(state, request);
      if (!currentUser) {
        return missing();
      }
      const id = String(params.id);
      const code = new URLSearchParams(await request.text()).get('code') ?? '';
      state.mfa.phoneAttempts.push({ id, code });
      if (code !== VERIFICATION_CODE) {
        return error('form_code_incorrect', 'Incorrect code');
      }
      const phone = updatePhone(currentUser, id, current => ({
        ...current,
        verification: fapiVerification('phone_code', { status: 'verified' }),
      }));
      return phone ? envelope(phone, state.client) : missing();
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/:id'), async ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'PATCH') {
        return undefined;
      }
      const id = String(params.id);
      const body = new URLSearchParams(await request.text());
      const reserved = body.has('reserved_for_second_factor')
        ? body.get('reserved_for_second_factor') === 'true'
        : undefined;
      const isDefault = body.has('default_second_factor') ? body.get('default_second_factor') === 'true' : undefined;
      state.mfa.phoneUpdates.push({ id, reserved, default: isDefault });
      const user = requestUser(state, request);
      const existingPhone = user?.phone_numbers.find(phone => phone.id === id);
      if (!user || !existingPhone) {
        return missing();
      }
      if (reserved === true && existingPhone.verification?.status !== 'verified') {
        return error(
          'identification_update_second_factor_unverified',
          'Cannot update second factor attributes for unverified identification',
        );
      }
      if (reserved === false && state.environment.user_settings.sign_up.mfa?.required && usableFactors(user) <= 1) {
        return error('second_factor_deletion_not_allowed', 'This method cannot be removed.');
      }
      const firstReservedPhone = !user.phone_numbers.some(item => item.reserved_for_second_factor);
      const newCodes = reserved && backupEnabled() && !user.backup_code_enabled;
      const phone = {
        ...existingPhone,
        reserved_for_second_factor: reserved ?? existingPhone.reserved_for_second_factor,
        default_second_factor:
          isDefault ??
          (reserved && firstReservedPhone ? true : reserved === false ? false : existingPhone.default_second_factor),
        backup_codes: newCodes ? state.mfa.codes : undefined,
      };
      let phones = user.phone_numbers.map(item => {
        if (item.id === id) {
          return phone;
        }
        return isDefault ? { ...item, default_second_factor: false } : item;
      });
      if (reserved === false && existingPhone.default_second_factor) {
        const next = phones.find(item => item.reserved_for_second_factor);
        phones = phones.map(item => (item.id === next?.id ? { ...item, default_second_factor: true } : item));
      }
      const hasFactor = user.totp_enabled || phones.some(item => item.reserved_for_second_factor);
      updateUser(state, {
        ...user,
        phone_numbers: phones,
        two_factor_enabled: reserved === undefined ? user.two_factor_enabled : hasFactor,
        backup_code_enabled:
          reserved === undefined
            ? user.backup_code_enabled
            : hasFactor && (user.backup_code_enabled || Boolean(newCodes)),
      });
      return envelope(phone, state.client);
    }),
  ];
}
