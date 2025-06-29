import type { ClientJSON, ClientJSONSnapshot } from '@clerk/types';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createSession, createSignIn, createSignUp, createUser } from '../../vitest/fixtures';
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
      last_active_session_id: 'test_session_id',
      sign_in: createSignIn({ id: 'test_sign_in_id' }, user),
      sign_up: createSignUp({ id: 'test_sign_up_id' }), //  This is only for testing purposes, this will never happen
      sessions: [session],
      cookie_expires_at: null,
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

    // @ts-ignore This is a private method that we are mocking
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

    // @ts-ignore This is a private method that we are mocking
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'DELETE',
      path: `/client`,
    });
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

describe('Client Snapshots', () => {
  it('should match snapshot for client instance structure', () => {
    const user = createUser({ first_name: 'John', last_name: 'Doe', id: 'user_1' });
    const session = createSession({ id: 'session_1' }, user);
    const clientObjectJSON: ClientJSON = {
      object: 'client',
      id: 'test_id',
      last_active_session_id: 'test_session_id',
      sign_in: createSignIn({ id: 'test_sign_in_id' }, user),
      sign_up: createSignUp({ id: 'test_sign_up_id' }),
      sessions: [session],
      created_at: 1735689600000, // Fixed timestamp
      updated_at: 1735689600000,
    } as any;

    // @ts-expect-error We cannot mess with the singleton when tests are running in parallel
    const client = new Client(clientObjectJSON);

    // Create a serializable version for snapshot
    const clientSnapshot = {
      id: client.id,
      lastActiveSessionId: client.lastActiveSessionId,
      createdAt: client.createdAt?.getTime(),
      updatedAt: client.updatedAt?.getTime(),
      sessions: client.sessions.map((s: any) => ({
        id: s.id,
        status: s.status,
        userId: s.user?.id,
      })),
      signIn: {
        id: client.signIn?.id,
        status: client.signIn?.status,
      },
      signUp: {
        id: client.signUp?.id,
        status: client.signUp?.status,
      },
    };

    expect(clientSnapshot).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    const clientJSON = {
      object: 'client',
      status: null,
      id: 'client_DUMMY_ID',
      sessions: [],
      sign_up: {
        object: 'sign_up',
        id: 'signup_123',
        status: 'complete',
        required_fields: ['email_address'],
        optional_fields: [],
        missing_fields: [],
        unverified_fields: [],
        verifications: {
          email_address: {
            object: 'verification',
            id: 'verification_123',
            status: 'verified',
            strategy: 'email_code',
            nonce: null,
            message: null,
            external_verification_redirect_url: null,
            attempts: 1,
            expire_at: 1735689600000,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
            next_action: '',
            supported_strategies: ['email_code'],
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
            expire_at: 1735689600000,
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
            expire_at: 1735689600000,
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
            expire_at: 1735689600000,
            error: { code: '', message: '', meta: {} },
            verified_at_client: null,
          },
        },
        username: null,
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
        phone_number: null,
        has_password: true,
        unsafe_metadata: { custom: 'data' },
        created_session_id: null,
        created_user_id: null,
        abandon_at: null,
        web3_wallet: null,
        legal_accepted_at: null,
      },
      sign_in: {
        object: 'sign_in',
        id: 'signin_123',
        status: 'complete',
        supported_identifiers: ['email_address'],
        supported_first_factors: ['email_code'],
        supported_second_factors: null,
        first_factor_verification: {
          object: 'verification',
          id: 'verification_456',
          status: 'verified',
          strategy: 'email_code',
          nonce: null,
          message: null,
          external_verification_redirect_url: null,
          attempts: 1,
          expire_at: 1735689600000,
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
          expire_at: 1735689600000,
          error: { code: '', message: '', meta: {} },
          verified_at_client: null,
        },
        identifier: 'john@example.com',
        created_session_id: 'session_123',
        user_data: {
          first_name: 'John',
          last_name: 'Doe',
        },
      },
      last_active_session_id: 'session_123',
      cookie_expires_at: null,
      created_at: 1735689600000,
      updated_at: 1735689600000,
    } as unknown as ClientJSONSnapshot;

    // @ts-expect-error We cannot mess with the singleton when tests are running in parallel
    const client = new Client(clientJSON);
    const snapshot = client.__internal_toSnapshot();

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for empty client state', () => {
    const emptyClientJSON = {
      object: 'client',
      status: null,
      id: 'client_EMPTY',
      sessions: [],
      sign_up: null,
      sign_in: null,
      last_active_session_id: null,
      cookie_expires_at: null,
      created_at: 1735689600000,
      updated_at: 1735689600000,
    } as unknown as ClientJSONSnapshot;

    // @ts-expect-error We cannot mess with the singleton when tests are running in parallel
    const client = new Client(emptyClientJSON);

    expect(client).toMatchSnapshot();
  });
});
