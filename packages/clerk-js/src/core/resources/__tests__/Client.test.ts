import type { ClientJSON, ClientJSONSnapshot } from '@clerk/shared/types';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createSession, createSignIn, createSignUp, createUser } from '@/test/core-fixtures';

import { BaseResource, Client } from '../internal';

const FIXED_DATE = new Date('2025-01-01T00:00:00Z');

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_DATE);
});

afterAll(() => {
  vi.useRealTimers();
});

describe('Client Singleton', () => {
  describe('__internal_sendCaptchaToken', () => {
    it('sends captcha token', async () => {
      const user = createUser({ first_name: 'John', last_name: 'Doe', id: 'user_1' });
      const session = createSession({ id: 'session_1' }, user);
      const clientObjectJSON: ClientJSON = {
        object: 'client',
        id: 'test_id',
        status: 'active',
        last_active_session_id: 'test_session_id',
        sign_in: createSignIn({ id: 'test_sign_in_id' }, user),
        sign_up: createSignUp({ id: 'test_sign_up_id' }), //  This is only for testing purposes, this will never happen
        sessions: [session],
        created_at: Date.now() - 1000,
        updated_at: Date.now(),
      } as any;

      // @ts-expect-error This is a private method that we are mocking
      BaseResource._baseFetch = vi.fn();

      const client = Client.getOrCreateInstance().fromJSON(clientObjectJSON);
      await client.__internal_sendCaptchaToken({ captcha_token: 'test_captcha_token' });
      // @ts-expect-error This is a private method that we are mocking
      expect(BaseResource._baseFetch).toHaveBeenCalledWith({
        method: 'POST',
        path: `/client/verify`,
        body: {
          captcha_token: 'test_captcha_token',
        },
      });
    });

    it('ignores null response payload', async () => {
      const user = createUser({ first_name: 'John', last_name: 'Doe', id: 'user_1' });
      const session = createSession({ id: 'session_1' }, user);
      const clientObjectJSON: ClientJSON = {
        object: 'client',
        id: 'test_id',
        status: 'active',
        last_active_session_id: 'test_session_id',
        sign_in: createSignIn({ id: 'test_sign_in_id' }, user),
        sign_up: createSignUp({ id: 'test_sign_up_id' }), //  This is only for testing purposes, this will never happen
        sessions: [session],
        created_at: Date.now() - 1000,
        updated_at: Date.now(),
      } as any;

      // @ts-expect-error This is a private method that we are mocking
      BaseResource._baseFetch = vi.fn().mockResolvedValueOnce(Promise.resolve(null));

      const client = Client.getOrCreateInstance().fromJSON(clientObjectJSON);
      await client.__internal_sendCaptchaToken({ captcha_token: 'test_captcha_token' });
      // @ts-expect-error This is a private method that we are mocking
      expect(BaseResource._baseFetch).toHaveBeenCalledWith({
        method: 'POST',
        path: `/client/verify`,
        body: {
          captcha_token: 'test_captcha_token',
        },
      });
      expect(client.id).toBe('test_id');
    });
  });

  it('destroy', async () => {
    const user = createUser({ first_name: 'John', last_name: 'Doe', id: 'user_1' });
    const session = createSession({ id: 'session_1' }, user);
    const clientObjectJSON: ClientJSON = {
      object: 'client',
      id: 'test_id',
      status: 'active',
      last_active_session_id: 'test_session_id',
      sign_in: createSignIn({ id: 'test_sign_in_id' }, user),
      sign_up: createSignUp({ id: 'test_sign_up_id' }), //  This is only for testing purposes, this will never happen
      sessions: [session],
      created_at: Date.now() - 1000,
      updated_at: Date.now(),
    };

    const destroyedSession = createSession(
      {
        id: 'test_session_id',
        abandon_at: Date.now(),
        status: 'ended',
        last_active_token: undefined,
      },
      user,
    );

    const clientObjectDeletedJSON = {
      id: 'test_id_deleted',
      status: 'ended',
      last_active_session_id: null,
      sign_in: null,
      sign_up: null,
      sessions: [destroyedSession],
      created_at: Date.now() - 1000,
      updated_at: Date.now(),
    };

    // @ts-expect-error This is a private method that we are mocking
    BaseResource._fetch = vi.fn().mockReturnValue(
      Promise.resolve({
        client: null,
        response: clientObjectDeletedJSON,
      }),
    );

    const client = Client.getOrCreateInstance().fromJSON(clientObjectJSON);
    expect(client.sessions.length).toBe(1);
    expect(client.createdAt).not.toBeNull();
    expect(client.updatedAt).not.toBeNull();
    expect(client.lastActiveSessionId).not.toBeNull();
    expect(client.signUp.id).toBe('test_sign_up_id');
    expect(client.signIn.id).toBe('test_sign_in_id');

    await client.destroy();

    expect(client.sessions.length).toBe(0);
    expect(client.createdAt).toBeNull();
    expect(client.updatedAt).toBeNull();
    expect(client.lastActiveSessionId).toBeNull();
    expect(client.signUp.id).toBeUndefined();
    expect(client.signIn.id).toBeUndefined();

    // @ts-expect-error This is a private method that we are mocking
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'DELETE',
      path: `/client`,
    });
  });

  it('preserves sign up and sign in identity when fromJSON receives matching ids', () => {
    const user = createUser({ first_name: 'John', last_name: 'Doe', id: 'user_1' });
    const session = createSession({ id: 'session_1' }, user);
    const initialClientJSON: ClientJSON = {
      object: 'client',
      id: 'test_id',
      status: 'active',
      last_active_session_id: 'test_session_id',
      sign_in: createSignIn({ id: 'test_sign_in_id', status: 'needs_first_factor' }, user),
      sign_up: createSignUp({ id: 'test_sign_up_id', status: 'missing_requirements' }),
      sessions: [session],
      created_at: Date.now() - 1000,
      updated_at: Date.now(),
    } as any;

    // @ts-expect-error We cannot mess with the singleton when tests are running in parallel
    const client = new Client(initialClientJSON);
    const initialSignUp = client.signUp;
    const initialSignIn = client.signIn;

    client.fromJSON({
      ...initialClientJSON,
      sign_in: createSignIn(
        {
          id: 'test_sign_in_id',
          status: 'needs_second_factor',
          identifier: 'updated@example.com',
        },
        user,
      ),
      sign_up: createSignUp({
        id: 'test_sign_up_id',
        status: 'missing_requirements',
        email_address: 'updated@example.com',
      }),
      updated_at: Date.now() + 1000,
    });

    expect(client.signUp).toBe(initialSignUp);
    expect(client.signIn).toBe(initialSignIn);
    expect(client.signUp.emailAddress).toBe('updated@example.com');
    expect(client.signIn.identifier).toBe('updated@example.com');
    expect(client.signIn.status).toBe('needs_second_factor');
  });

  it('replaces sign up and sign in identity when fromJSON receives new ids', () => {
    const user = createUser({ first_name: 'John', last_name: 'Doe', id: 'user_1' });
    const session = createSession({ id: 'session_1' }, user);
    const initialClientJSON: ClientJSON = {
      object: 'client',
      id: 'test_id',
      status: 'active',
      last_active_session_id: 'test_session_id',
      sign_in: createSignIn({ id: 'test_sign_in_id', status: 'needs_first_factor' }, user),
      sign_up: createSignUp({ id: 'test_sign_up_id', status: 'missing_requirements' }),
      sessions: [session],
      created_at: Date.now() - 1000,
      updated_at: Date.now(),
    } as any;

    // @ts-expect-error We cannot mess with the singleton when tests are running in parallel
    const client = new Client(initialClientJSON);
    const initialSignUp = client.signUp;
    const initialSignIn = client.signIn;

    client.fromJSON({
      ...initialClientJSON,
      sign_in: createSignIn({ id: 'test_sign_in_id_v2', status: 'needs_first_factor' }, user),
      sign_up: createSignUp({ id: 'test_sign_up_id_v2', status: 'missing_requirements' }),
      updated_at: Date.now() + 1000,
    });

    expect(client.signUp).not.toBe(initialSignUp);
    expect(client.signIn).not.toBe(initialSignIn);
    expect(client.signUp.id).toBe('test_sign_up_id_v2');
    expect(client.signIn.id).toBe('test_sign_in_id_v2');
  });

  it('has the same initial properties', () => {
    const clientJSON = {
      object: 'client',
      status: null,
      id: 'client_DUMMY_ID',
      sessions: [],
      sign_up: {
        object: 'sign_up',
        id: '',
        status: null,
        required_fields: [],
        optional_fields: [],
        missing_fields: [],
        unverified_fields: [],
        verifications: {
          email_address: {
            object: 'verification',
            id: '',
            status: null,
            strategy: null,
            nonce: null,
            message: null,
            external_verification_redirect_url: null,
            attempts: null,
            expire_at: 1733924546849,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
            next_action: '',
            supported_strategies: [],
          },
          phone_number: {
            object: 'verification',
            id: '',
            status: null,
            strategy: null,
            nonce: null,
            message: null,
            external_verification_redirect_url: null,
            attempts: null,
            expire_at: 1733924546849,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
            next_action: '',
            supported_strategies: [],
          },
          web3_wallet: {
            object: 'verification',
            id: '',
            status: null,
            strategy: null,
            nonce: null,
            message: null,
            external_verification_redirect_url: null,
            attempts: null,
            expire_at: 1733924546849,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
            next_action: '',
            supported_strategies: [],
          },
          external_account: {
            object: 'verification',
            id: '',
            status: null,
            strategy: null,
            nonce: null,
            message: null,
            external_verification_redirect_url: null,
            attempts: null,
            expire_at: 1733924546849,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
          },
        },
        username: null,
        first_name: null,
        last_name: null,
        email_address: null,
        phone_number: null,
        has_password: false,
        unsafe_metadata: {},
        created_session_id: null,
        created_user_id: null,
        abandon_at: null,
        web3_wallet: null,
        legal_accepted_at: null,
      },
      sign_in: {
        object: 'sign_in',
        id: '',
        status: null,
        supported_identifiers: [],
        supported_first_factors: [],
        supported_second_factors: null,
        first_factor_verification: {
          object: 'verification',
          id: '',
          status: null,
          strategy: null,
          nonce: null,
          message: null,
          external_verification_redirect_url: null,
          attempts: null,
          expire_at: 1733924546849,
          error: { code: '', message: '', meta: {} },
          verified_at_client: null,
        },
        second_factor_verification: {
          object: 'verification',
          id: '',
          status: null,
          strategy: null,
          nonce: null,
          message: null,
          external_verification_redirect_url: null,
          attempts: null,
          expire_at: 1733924546849,
          error: { code: '', message: '', meta: {} },
          verified_at_client: null,
        },
        identifier: null,
        created_session_id: null,
        user_data: {},
      },
      last_active_session_id: null,
      cookie_expires_at: null,
      created_at: 1733924546843,
      updated_at: 1733924546843,
    } as unknown as ClientJSONSnapshot;

    // @ts-expect-error We cannot mess with the singleton when tests are running in parallel
    const client = new Client(clientJSON);

    expect(client).toMatchObject({
      id: 'client_DUMMY_ID',
      sessions: [],
      signUp: expect.objectContaining({
        status: null,
        missingFields: [],
        unverifiedFields: [],
        verifications: expect.objectContaining({
          emailAddress: expect.objectContaining({
            status: null,
          }),
        }),
      }),
      signIn: expect.objectContaining({
        status: null,
        identifier: null,
      }),
      lastActiveSessionId: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('__internal_toSnapshot()', () => {
    const clientJSON = {
      object: 'client',
      status: null,
      id: 'client_DUMMY_ID',
      sessions: [],
      sign_up: {
        object: 'sign_up',
        id: '',
        status: null,
        required_fields: [],
        optional_fields: [],
        missing_fields: [],
        unverified_fields: [],
        verifications: {
          email_address: {
            object: 'verification',
            id: '',
            status: null,
            strategy: null,
            nonce: null,
            message: null,
            external_verification_redirect_url: null,
            attempts: null,
            expire_at: 1733924546849,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
            next_action: '',
            supported_strategies: [],
          },
          phone_number: {
            object: 'verification',
            id: '',
            status: null,
            strategy: null,
            nonce: null,
            message: null,
            external_verification_redirect_url: null,
            attempts: null,
            expire_at: 1733924546849,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
            next_action: '',
            supported_strategies: [],
          },
          web3_wallet: {
            object: 'verification',
            id: '',
            status: null,
            strategy: null,
            nonce: null,
            message: null,
            external_verification_redirect_url: null,
            attempts: null,
            expire_at: 1733924546849,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
            next_action: '',
            supported_strategies: [],
          },
          external_account: {
            object: 'verification',
            id: '',
            status: null,
            strategy: null,
            nonce: null,
            message: null,
            external_verification_redirect_url: null,
            attempts: null,
            expire_at: 1733924546849,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
          },
        },
        username: null,
        first_name: null,
        last_name: null,
        email_address: null,
        phone_number: null,
        has_password: false,
        unsafe_metadata: {},
        created_session_id: null,
        created_user_id: null,
        abandon_at: null,
        web3_wallet: null,
        legal_accepted_at: null,
      },
      sign_in: {
        object: 'sign_in',
        id: '',
        status: null,
        supported_identifiers: [],
        supported_first_factors: [],
        supported_second_factors: null,
        first_factor_verification: {
          object: 'verification',
          id: '',
          status: null,
          strategy: null,
          nonce: null,
          message: null,
          external_verification_redirect_url: null,
          attempts: null,
          expire_at: 1733924546849,
          error: { code: '', message: '', meta: {} },
          verified_at_client: null,
        },
        second_factor_verification: {
          object: 'verification',
          id: '',
          status: null,
          strategy: null,
          nonce: null,
          message: null,
          external_verification_redirect_url: null,
          attempts: null,
          expire_at: 1733924546849,
          error: { code: '', message: '', meta: {} },
          verified_at_client: null,
        },
        identifier: null,
        created_session_id: null,
        user_data: {},
      },
      last_active_session_id: null,
      cookie_expires_at: null,
      created_at: 1733924546843,
      updated_at: 1733924546843,
    } as unknown as ClientJSONSnapshot;

    // @ts-expect-error We cannot mess with the singleton when tests are running in parallel
    const client = new Client(clientJSON);

    expect(client.__internal_toSnapshot()).toMatchObject({
      object: 'client',
      id: 'client_DUMMY_ID',
      sessions: [],
      sign_up: expect.objectContaining({
        status: null,
        missing_fields: [],
        unverified_fields: [],
        verifications: expect.objectContaining({
          email_address: expect.objectContaining({
            status: null,
          }),
        }),
      }),
      sign_in: expect.objectContaining({
        status: null,
        identifier: null,
      }),
      last_active_session_id: null,
      created_at: expect.any(Number),
      updated_at: expect.any(Number),
    });
  });
});
