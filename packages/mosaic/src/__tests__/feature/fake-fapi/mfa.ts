import type { ClientJSON, PhoneNumberJSON, UserJSON } from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';

import { type FapiEnvironment, fapiPhoneNumber, fapiVerification } from '../fapi';

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
  const active = () => state.client.sessions.find(session => session.id === state.client.last_active_session_id);
  const backupEnabled = () =>
    state.environment.user_settings.attributes.backup_code.enabled &&
    state.environment.user_settings.attributes.backup_code.used_for_second_factor;
  const usableFactors = (user: UserJSON) =>
    Number(user.totp_enabled) +
    user.phone_numbers.filter(phone => phone.reserved_for_second_factor && phone.verification.status === 'verified')
      .length;
  const error = (code: string, message: string, status = 400) =>
    HttpResponse.json({ errors: [{ code, message, long_message: message }] }, { status });
  const respond = (response: object) => HttpResponse.json({ response, client: state.client });
  const missing = () =>
    HttpResponse.json({ errors: [{ code: 'resource_not_found', message: 'not found' }] }, { status: 404 });
  const updateUser = (transform: (user: UserJSON) => UserJSON) => {
    const session = active();
    if (!session) {
      return undefined;
    }
    const user = transform(session.user);
    state.client = {
      ...state.client,
      sessions: state.client.sessions.map(item => (item.id === session.id ? { ...item, user } : item)),
    };
    return user;
  };
  const updatePhone = (id: string, transform: (phone: PhoneNumberJSON) => PhoneNumberJSON) => {
    let updated: PhoneNumberJSON | undefined;
    updateUser(user => ({
      ...user,
      phone_numbers: user.phone_numbers.map(phone => {
        if (phone.id !== id) {
          return phone;
        }
        updated = transform(phone);
        return updated;
      }),
    }));
    return updated;
  };

  return [
    http.get(fapiUrl('/v1/me'), () => {
      const session = active();
      return session ? respond(session.user) : missing();
    }),
    http.post(fapiUrl('/v1/me/totp'), ({ request }) => {
      if (!active()) {
        return missing();
      }
      if (new URL(request.url).searchParams.get('_method') === 'DELETE') {
        const currentUser = active()?.user;
        if (
          !currentUser?.totp_enabled ||
          (state.environment.user_settings.sign_up.mfa?.required && usableFactors(currentUser) <= 1)
        ) {
          return error('second_factor_deletion_not_allowed', 'This method cannot be removed.');
        }
        state.mfa.totpRemovals += 1;
        const user = updateUser(current => ({
          ...current,
          totp_enabled: false,
          two_factor_enabled: current.phone_numbers.some(phone => phone.reserved_for_second_factor),
          backup_code_enabled:
            current.phone_numbers.some(phone => phone.reserved_for_second_factor) && current.backup_code_enabled,
        }));
        return user ? respond({ object: 'deleted', id: 'totp_1' }) : missing();
      }
      if (
        active()?.user.totp_enabled ||
        !state.environment.user_settings.attributes.authenticator_app.used_for_second_factor
      ) {
        return error('form_param_value_invalid', 'Authenticator is unavailable.', 422);
      }
      state.mfa.totpCreations += 1;
      return respond({
        object: 'totp',
        id: 'totp_1',
        secret: `SECRET${state.mfa.totpCreations}`,
        uri: `otpauth://totp/Acme:user?secret=SECRET${state.mfa.totpCreations}`,
        verified: false,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    }),
    http.post(fapiUrl('/v1/me/totp/attempt_verification'), async ({ request }) => {
      if (state.mfa.totpCreations === 0 || active()?.user.totp_enabled) {
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
      const newCodes = backupEnabled() && !active()?.user.backup_code_enabled;
      const user = updateUser(current => ({
        ...current,
        totp_enabled: true,
        two_factor_enabled: true,
        backup_code_enabled: current.backup_code_enabled || newCodes,
      }));
      if (!user) {
        return missing();
      }
      return respond({
        object: 'totp',
        id: 'totp_1',
        verified: true,
        ...(newCodes ? { backup_codes: state.mfa.codes } : {}),
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    }),
    http.post(fapiUrl('/v1/me/backup_codes/'), () => {
      const currentUser = active()?.user;
      if (!currentUser || usableFactors(currentUser) === 0 || !backupEnabled()) {
        return error('form_param_value_invalid', 'Set up a verification method first.', 422);
      }
      state.mfa.backupCodeCreations += 1;
      state.mfa.codes = Array.from(
        { length: 10 },
        (_, index) => `CODE${String(state.mfa.backupCodeCreations).padStart(2, '0')}${String(index).padStart(2, '0')}`,
      );
      const user = updateUser(current => ({ ...current, backup_code_enabled: true }));
      return user
        ? respond({
            object: 'backup_code',
            id: 'backup_1',
            codes: state.mfa.codes,
            created_at: Date.now(),
            updated_at: Date.now(),
          })
        : missing();
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/'), async ({ request }) => {
      const number = new URLSearchParams(await request.text()).get('phone_number') ?? '';
      state.mfa.phoneCreations.push(number);
      if (active()?.user.phone_numbers.some(phone => phone.phone_number === number)) {
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
      const existingIds = new Set(active()?.user.phone_numbers.map(phone => phone.id));
      let nextPhoneNumber = state.mfa.phoneCreations.length;
      while (existingIds.has(`phone_${nextPhoneNumber}`)) {
        nextPhoneNumber += 1;
      }
      const phone = fapiPhoneNumber({
        id: `phone_${nextPhoneNumber}`,
        phone_number: number,
        verification: fapiVerification('phone_code'),
      });
      const user = updateUser(current => ({ ...current, phone_numbers: [...current.phone_numbers, phone] }));
      return user ? respond(phone) : missing();
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/:id/prepare_verification'), ({ params }) => {
      const id = String(params.id);
      state.mfa.phonePreparations.push(id);
      const phone = updatePhone(id, current => ({ ...current, verification: fapiVerification('phone_code') }));
      return phone ? respond(phone) : missing();
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/:id/attempt_verification'), async ({ params, request }) => {
      const id = String(params.id);
      const code = new URLSearchParams(await request.text()).get('code') ?? '';
      state.mfa.phoneAttempts.push({ id, code });
      if (code !== '123456') {
        return HttpResponse.json(
          { errors: [{ code: 'form_code_incorrect', message: 'Incorrect code' }] },
          { status: 422 },
        );
      }
      const phone = updatePhone(id, current => ({
        ...current,
        verification: fapiVerification('phone_code', { status: 'verified' }),
      }));
      return phone ? respond(phone) : missing();
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
      const previous = active()?.user;
      const existingPhone = previous?.phone_numbers.find(phone => phone.id === id);
      if (reserved === true && (!existingPhone || existingPhone.verification.status !== 'verified')) {
        return error(
          'identification_update_second_factor_unverified',
          'Cannot update second factor attributes for unverified identification',
        );
      }
      if (
        reserved === false &&
        state.environment.user_settings.sign_up.mfa?.required &&
        previous &&
        usableFactors(previous) <= 1
      ) {
        return error('second_factor_deletion_not_allowed', 'This method cannot be removed.');
      }
      const firstReservedPhone = !previous?.phone_numbers.some(item => item.reserved_for_second_factor);
      const newCodes = reserved && backupEnabled() && !previous?.backup_code_enabled;
      const phone = updatePhone(id, current => ({
        ...current,
        reserved_for_second_factor: reserved ?? current.reserved_for_second_factor,
        default_second_factor:
          isDefault ??
          (reserved && firstReservedPhone ? true : reserved === false ? false : current.default_second_factor),
        backup_codes: newCodes ? state.mfa.codes : undefined,
      }));
      if (isDefault) {
        updateUser(user => ({
          ...user,
          phone_numbers: user.phone_numbers.map(item =>
            item.id === id ? item : { ...item, default_second_factor: false },
          ),
        }));
      }
      if (reserved !== undefined) {
        updateUser(user => ({
          ...user,
          two_factor_enabled: user.totp_enabled || user.phone_numbers.some(item => item.reserved_for_second_factor),
          backup_code_enabled: reserved
            ? user.backup_code_enabled || Boolean(newCodes)
            : user.totp_enabled || user.phone_numbers.some(item => item.reserved_for_second_factor)
              ? user.backup_code_enabled
              : false,
        }));
        if (reserved === false && previous?.phone_numbers.find(item => item.id === id)?.default_second_factor) {
          updateUser(user => {
            const next = user.phone_numbers.find(item => item.reserved_for_second_factor);
            return {
              ...user,
              phone_numbers: user.phone_numbers.map(item =>
                item.id === next?.id ? { ...item, default_second_factor: true } : item,
              ),
            };
          });
        }
      }
      return phone ? respond(phone) : missing();
    }),
  ];
}
