import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import type {
  ApiKeyJSON,
  ClientJSON,
  EmailAddressJSON,
  EnterpriseConnectionJSON,
  OAuthProvider,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationSuggestionJSON,
  PhoneNumberJSON,
  SessionJSON,
  SessionWithActivitiesJSON,
  UserJSON,
  UserOrganizationInvitationJSON,
  Web3WalletJSON,
} from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

import { enterpriseHandlers, type FakeEnterpriseLinking } from './fake-fapi/enterprise';
import { createMfaState, type FakeMfaState, mfaHandlers } from './fake-fapi/mfa';
import { type FakePasskeysSeed, passkeyHandlers } from './fake-fapi/passkeys';
import { envelope, error, findSession, missing, updateUser } from './fake-fapi/shared';
import {
  createVerificationState,
  type FakeVerificationSeed,
  type FakeVerificationState,
  verificationHandlers,
} from './fake-fapi/verification';
import {
  fapiApiKey,
  fapiClient,
  fapiEmailAddress,
  type FapiEnvironment,
  fapiEnvironment,
  fapiExternalAccount,
  fapiMembership,
  fapiOrganization,
  fapiPage,
  fapiPhoneNumber,
  fapiToken,
  fapiVerification,
  fapiWeb3Wallet,
} from './fapi';

export const PUBLISHABLE_KEY = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';
const FAPI = 'https://clerk.abcef.12345.prod.lclclerk.com';

export const fapiUrl = (path: string) => `${FAPI}${path}`;

export interface FakeFapiState {
  environment: FapiEnvironment;
  client: ClientJSON;
  country?: string;
  memberships: OrganizationMembershipJSON[];
  invitations: UserOrganizationInvitationJSON[];
  suggestions: OrganizationSuggestionJSON[];
  apiKeys: ApiKeyJSON[];
  verification: FakeVerificationState;
  passwordUpdates: URLSearchParams[];
  enterpriseConnections: EnterpriseConnectionJSON[];
  enterpriseLinking: FakeEnterpriseLinking;
  mfa: FakeMfaState;
  activeDevices?: ActiveDeviceRecord[];
  deviceTrackingEnabled: boolean;
}

export interface ActiveDeviceRecord extends SessionWithActivitiesJSON {
  ownerUserId: string;
  replacementSessionId?: string;
  inactivityTimeoutSeconds?: number;
  touchedAt?: number;
  tokenIssuedAt?: number;
}

export type FakeFapiSeed = Partial<Omit<FakeFapiState, 'verification' | 'enterpriseLinking'>> & {
  verification?: FakeVerificationSeed;
  enterpriseLinking?: Partial<FakeEnterpriseLinking>;
  passkeys?: FakePasskeysSeed;
};

const unhandled: string[] = [];

export const worker = setupWorker();

export function startWorker() {
  return worker.start({
    quiet: true,
    onUnhandledRequest: request => {
      if (new URL(request.url).origin === FAPI) {
        unhandled.push(`${request.method} ${request.url}`);
      }
    },
  });
}

export function takeUnhandledRequests(): string[] {
  return unhandled.splice(0);
}

function page<T>(items: T[], url: URL) {
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const limit = Number(url.searchParams.get('limit') ?? items.length);
  return fapiPage(items.slice(offset, offset + limit), items.length);
}

function withStatus<T extends { status: string }>(items: T[], url: URL): T[] {
  const statuses = url.searchParams.getAll('status').flatMap(status => status.split(','));
  return statuses.length ? items.filter(item => statuses.includes(item.status)) : items;
}

function activeUser(state: FakeFapiState): UserJSON | undefined {
  return activeSession(state)?.user;
}

function withoutOrganization(session: SessionJSON, organizationId: string): SessionJSON {
  return {
    ...session,
    user: {
      ...session.user,
      organization_memberships: session.user.organization_memberships.filter(m => m.organization.id !== organizationId),
    },
  };
}

function leaveOrganization(state: FakeFapiState, organizationId: string, userId: string): void {
  state.memberships = state.memberships.filter(m => m.organization.id !== organizationId);
  state.client = {
    ...state.client,
    sessions: state.client.sessions.map(session =>
      session.user.id === userId ? withoutOrganization(session, organizationId) : session,
    ),
  };
}

function deleteOrganization(state: FakeFapiState, organizationId: string): void {
  state.memberships = state.memberships.filter(m => m.organization.id !== organizationId);
  state.client = {
    ...state.client,
    sessions: state.client.sessions.map(session => withoutOrganization(session, organizationId)),
  };
}

function updateOrganization(state: FakeFapiState, organization: OrganizationJSON): void {
  state.memberships = state.memberships.map(membership =>
    membership.organization.id === organization.id ? { ...membership, organization } : membership,
  );
  state.client = {
    ...state.client,
    sessions: state.client.sessions.map(session => ({
      ...session,
      user: {
        ...session.user,
        organization_memberships: session.user.organization_memberships.map(membership =>
          membership.organization.id === organization.id ? { ...membership, organization } : membership,
        ),
      },
    })),
  };
}

function findWeb3Wallet(state: FakeFapiState, id: unknown): Web3WalletJSON | undefined {
  return activeUser(state)?.web3_wallets.find(wallet => wallet.id === id);
}

function updateWeb3Wallet(state: FakeFapiState, wallet: Web3WalletJSON): void {
  const user = activeUser(state);
  if (user) {
    updateUser(state, {
      ...user,
      web3_wallets: user.web3_wallets.map(current => (current.id === wallet.id ? wallet : current)),
    });
  }
}

function requestingSession(state: FakeFapiState, request: Request): SessionJSON | undefined {
  const sessionId = new URL(request.url).searchParams.get('_clerk_session_id') ?? state.client.last_active_session_id;
  return findSession(state, sessionId);
}

function canRevokeDevice(record: ActiveDeviceRecord): boolean {
  const now = Date.now();
  const lastActivity = Math.max(record.touchedAt ?? record.last_active_at, record.tokenIssuedAt ?? 0);
  return (
    record.status === 'active' &&
    !record.replacementSessionId &&
    record.expire_at > now &&
    record.abandon_at > now &&
    (!record.inactivityTimeoutSeconds || now - lastActivity <= record.inactivityTimeoutSeconds * 1000)
  );
}

function deviceSessionPayload(record: ActiveDeviceRecord) {
  const {
    ownerUserId: _ownerUserId,
    replacementSessionId: _replacementSessionId,
    inactivityTimeoutSeconds: _inactivityTimeoutSeconds,
    touchedAt: _touchedAt,
    tokenIssuedAt: _tokenIssuedAt,
    latest_activity: _latestActivity,
    ...session
  } = record;
  return session;
}

function rejected(code: string, message: string) {
  return HttpResponse.json({ errors: [{ code, message, long_message: message }] }, { status: 400 });
}

export const VERIFICATION_CODE = '424242';
export const PROFILE_IMAGE_URL = 'https://img.clerk.com/uploaded.png';

const USER_FIELDS = [
  'first_name',
  'last_name',
  'username',
  'primary_email_address_id',
  'primary_phone_number_id',
  'primary_web3_wallet_id',
] as const satisfies readonly (keyof UserJSON)[];

function patchUser(user: UserJSON, body: URLSearchParams): UserJSON {
  const patch: Partial<Pick<UserJSON, (typeof USER_FIELDS)[number]>> = {};
  for (const field of USER_FIELDS) {
    if (body.has(field)) {
      patch[field] = body.get(field) || null;
    }
  }
  return { ...user, ...patch };
}

function activeSession(state: FakeFapiState): SessionJSON | undefined {
  return state.client.sessions.find(session => session.id === state.client.last_active_session_id);
}

function updateActiveUser(state: FakeFapiState, next: (user: UserJSON) => UserJSON): UserJSON | undefined {
  const session = activeSession(state);
  if (!session) {
    return undefined;
  }
  const user = next(session.user);
  state.client = {
    ...state.client,
    sessions: state.client.sessions.map(s => (s.id === session.id ? { ...s, user } : s)),
  };
  return user;
}

function findPhone(state: FakeFapiState, id: unknown): PhoneNumberJSON | undefined {
  return activeSession(state)?.user.phone_numbers.find(phone => phone.id === id);
}

function replacePhone(state: FakeFapiState, phone: PhoneNumberJSON) {
  updateActiveUser(state, user => ({
    ...user,
    phone_numbers: user.phone_numbers.map(p => (p.id === phone.id ? phone : p)),
  }));
}

function findEmail(state: FakeFapiState, id: unknown): EmailAddressJSON | undefined {
  return activeSession(state)?.user.email_addresses.find(email => email.id === id);
}

function replaceEmail(state: FakeFapiState, email: EmailAddressJSON) {
  updateActiveUser(state, user => ({
    ...user,
    email_addresses: user.email_addresses.map(e => (e.id === email.id ? email : e)),
  }));
}

export function verifyEmailOutOfBand(state: FakeFapiState, id: string): void {
  const email = findEmail(state, id);
  if (!email) {
    throw new Error(`No email address ${id} to verify`);
  }
  replaceEmail(state, {
    ...email,
    verification: { ...(email.verification ?? fapiVerification('email_code')), status: 'verified' },
  });
}

export function serveFapi(seed: FakeFapiSeed = {}): FakeFapiState {
  const { verification, enterpriseLinking, passkeys, ...rest } = seed;
  const state: FakeFapiState = {
    environment: fapiEnvironment(),
    client: fapiClient(),
    memberships: [],
    invitations: [],
    suggestions: [],
    apiKeys: [],
    passwordUpdates: [],
    enterpriseConnections: [],
    deviceTrackingEnabled: true,
    mfa: createMfaState(),
    ...rest,
    verification: createVerificationState(verification),
    enterpriseLinking: {
      enabled: false,
      preparations: {},
      verifiedLinks: [],
      pendingExternalAccounts: [],
      ...enterpriseLinking,
    },
  };
  let identifications = 0;

  worker.use(
    ...verificationHandlers(state, fapiUrl),
    ...enterpriseHandlers(state, fapiUrl),
    ...passkeyHandlers(state, fapiUrl, passkeys),
    ...mfaHandlers(state, fapiUrl),
    http.get(fapiUrl('/v1/environment'), () =>
      HttpResponse.json(state.environment, state.country ? { headers: { 'x-country': state.country } } : undefined),
    ),
    http.get(fapiUrl('/v1/client'), () => envelope(state.client, null)),
    http.get(fapiUrl('/v1/me'), () => {
      const user = activeUser(state);
      return user ? envelope(user, state.client) : missing();
    }),
    http.post(fapiUrl('/v1/me/external_accounts'), async ({ request }) => {
      const user = activeUser(state);
      if (!user) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      const strategy = body.get('strategy');
      if (!strategy) {
        return missing();
      }
      const provider: OAuthProvider | undefined = OAUTH_PROVIDERS.find(item => item.strategy === strategy)?.provider;
      if (!provider) {
        return missing();
      }
      const account = fapiExternalAccount({
        id: `idn_${crypto.randomUUID()}`,
        approved_scopes: '',
        provider,
        verification: fapiVerification(strategy, {
          status: 'unverified',
          external_verification_redirect_url: 'https://accounts.example/authorize',
        }),
      });
      updateActiveUser(state, current => ({
        ...current,
        external_accounts: [
          ...current.external_accounts.filter(
            item => item.provider !== provider || item.verification?.status === 'verified',
          ),
          account,
        ],
      }));
      return envelope(account, state.client);
    }),
    http.post(fapiUrl('/v1/me/external_accounts/:id/reauthorize'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'PATCH') {
        return undefined;
      }
      const user = activeUser(state);
      const account = user?.external_accounts.find(item => item.id === params.id);
      if (!user || !account) {
        return missing();
      }
      const pending = {
        ...account,
        verification: fapiVerification(`oauth_${account.provider}`, {
          status: 'unverified',
          external_verification_redirect_url: 'https://accounts.example/consent',
        }),
      };
      updateActiveUser(state, current => ({
        ...current,
        external_accounts: current.external_accounts.map(item => (item.id === pending.id ? pending : item)),
      }));
      return envelope(pending, state.client);
    }),
    http.post(fapiUrl('/v1/me/external_accounts/:id'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      const user = activeUser(state);
      const account = user?.external_accounts.find(item => item.id === params.id);
      if (!user || !account) {
        return missing();
      }
      updateActiveUser(state, current => ({
        ...current,
        external_accounts: current.external_accounts.filter(item => item.id !== account.id),
      }));
      return envelope({ ...account, object: 'external_account' }, state.client);
    }),
    http.post(fapiUrl('/v1/me/web3_wallets'), async ({ request }) => {
      const user = activeUser(state);
      if (!user) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      const address = body.get('web3_wallet');
      if (!address) {
        return missing();
      }
      const wallet = fapiWeb3Wallet({
        id: `wallet_${user.web3_wallets.length + 1}`,
        web3_wallet: address,
        verification: fapiVerification('', { expire_at: 0 }),
      });
      updateUser(state, { ...user, web3_wallets: [...user.web3_wallets, wallet] });
      return envelope(wallet, state.client);
    }),
    http.post(fapiUrl('/v1/me/web3_wallets/:id/prepare_verification'), async ({ params, request }) => {
      const wallet = findWeb3Wallet(state, params.id);
      if (!wallet) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      const prepared = fapiWeb3Wallet({
        ...wallet,
        verification: fapiVerification(body.get('strategy') ?? '', {
          message: 'Sign this wallet challenge',
          expire_at: 0,
        }),
      });
      updateWeb3Wallet(state, prepared);
      return envelope(prepared, state.client);
    }),
    http.post(fapiUrl('/v1/me/web3_wallets/:id/attempt_verification'), ({ params }) => {
      const wallet = findWeb3Wallet(state, params.id);
      if (!wallet) {
        return missing();
      }
      const verified = fapiWeb3Wallet({
        ...wallet,
        verification: fapiVerification(wallet.verification?.strategy ?? '', {
          ...wallet.verification,
          status: 'verified',
          verified_at_client: '',
          attempts: 1,
        }),
      });
      updateWeb3Wallet(state, verified);
      const user = activeUser(state);
      if (user && !user.primary_web3_wallet_id) {
        updateUser(state, { ...user, primary_web3_wallet_id: verified.id });
      }
      return envelope(verified, state.client);
    }),
    http.post(fapiUrl('/v1/me/web3_wallets/:id'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      const user = activeUser(state);
      const wallet = findWeb3Wallet(state, params.id);
      if (!user || !wallet) {
        return missing();
      }
      const remainingWallets = user.web3_wallets.filter(current => current.id !== wallet.id);
      updateUser(state, {
        ...user,
        web3_wallets: remainingWallets,
        primary_web3_wallet_id:
          user.primary_web3_wallet_id === wallet.id
            ? (remainingWallets.find(current => current.verification?.status === 'verified')?.id ?? null)
            : user.primary_web3_wallet_id,
      });
      return envelope({ object: 'web3_wallet', id: wallet.id, deleted: true }, state.client);
    }),
    http.post(fapiUrl('/v1/client/sessions/:id/tokens'), ({ params }) => {
      const session = findSession(state, params.id);
      return session
        ? HttpResponse.json(
            fapiToken({ sid: session.id, sub: session.user.id, org_id: session.last_active_organization_id }),
          )
        : missing();
    }),
    http.post(fapiUrl('/v1/client/sessions/:id/touch'), async ({ params, request }) => {
      const session = findSession(state, params.id);
      if (!session) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      const organizationId = body.get('active_organization_id') || null;
      const touched = {
        ...session,
        last_active_organization_id: organizationId,
        last_active_token: fapiToken({ sid: session.id, sub: session.user.id, org_id: organizationId }),
      };
      state.client = {
        ...state.client,
        last_active_session_id: touched.id,
        sessions: state.client.sessions.map(s => (s.id === touched.id ? touched : s)),
      };
      return envelope(touched, state.client);
    }),
    http.post(fapiUrl('/v1/client/sessions/:id/remove'), ({ params }) => {
      const session = findSession(state, params.id);
      if (!session) {
        return missing();
      }
      const sessions = state.client.sessions.filter(s => s.id !== session.id);
      state.client = { ...state.client, sessions, last_active_session_id: sessions[0]?.id ?? null };
      return envelope({ ...session, status: 'removed' }, state.client);
    }),
    http.get(fapiUrl('/v1/me/sessions/active'), ({ request }) => {
      if (!state.activeDevices) {
        return undefined;
      }
      const requester = requestingSession(state, request);
      if (!requester) {
        return missing();
      }
      if (!state.deviceTrackingEnabled) {
        const { user: _user, ...session } = requester;
        return HttpResponse.json([{ ...session, user: null }]);
      }
      const records = state.activeDevices.filter(
        item => item.ownerUserId === requester.user.id && canRevokeDevice(item) && (!item.actor || requester.actor),
      );
      return HttpResponse.json(
        records.map(item => ({
          ...deviceSessionPayload(item),
          status: item.tasks?.length ? 'pending' : item.status,
          latest_activity: item.latest_activity,
        })),
      );
    }),
    http.post(fapiUrl('/v1/me/sessions/:id/revoke'), ({ params, request }) => {
      if (!state.activeDevices) {
        return undefined;
      }
      const requester = requestingSession(state, request);
      if (!requester) {
        return missing();
      }
      const target = state.activeDevices.find(item => item.id === params.id);
      if (target?.id === requester.id) {
        const code = 'invalid_action_for_session';
        return HttpResponse.json({ errors: [{ code, message: code }] }, { status: 400 });
      }
      if (!target || target.ownerUserId !== requester.user.id) {
        const code = 'action_for_session_not_authorized';
        return HttpResponse.json({ errors: [{ code, message: code }] }, { status: 401 });
      }
      if (!canRevokeDevice(target)) {
        const code = 'invalid_action_for_session';
        return HttpResponse.json({ errors: [{ code, message: code }] }, { status: 400 });
      }
      target.status = 'revoked';
      return envelope({ ...deviceSessionPayload(target), user: requester.user, status: 'revoked' }, state.client);
    }),
    http.post(fapiUrl('/v1/me/change_password'), async ({ request }) => {
      const session = findSession(state, state.client.last_active_session_id);
      if (!session) {
        return missing();
      }
      state.passwordUpdates.push(new URLSearchParams(await request.text()));
      const updatedUser = { ...session.user, password_enabled: true };
      state.client = {
        ...state.client,
        sessions: state.client.sessions.map(item => (item.id === session.id ? { ...item, user: updatedUser } : item)),
      };
      return envelope(updatedUser, state.client);
    }),
    http.post(fapiUrl('/v1/client/sessions'), ({ request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      state.client = { ...state.client, sessions: [], last_active_session_id: null };
      return envelope(state.client, state.client);
    }),
    http.post(fapiUrl('/v1/me'), async ({ request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'PATCH') {
        return undefined;
      }
      const body = new URLSearchParams(await request.text());
      const user = updateActiveUser(state, user => patchUser(user, body));
      return user ? envelope(user, state.client) : missing();
    }),
    http.post(fapiUrl('/v1/me/profile_image'), async ({ request }) => {
      if (new URL(request.url).searchParams.get('_method') === 'DELETE') {
        const user = updateActiveUser(state, user => ({ ...user, image_url: '', has_image: false }));
        return user ? envelope({ id: 'img_1', name: null, public_url: null }, state.client) : missing();
      }
      const file = (await request.formData()).get('file');
      if (!(file instanceof File)) {
        return rejected('form_param_missing', 'file is required');
      }
      const user = updateActiveUser(state, user => ({ ...user, image_url: PROFILE_IMAGE_URL, has_image: true }));
      return user ? envelope({ id: 'img_1', name: file.name, public_url: PROFILE_IMAGE_URL }, state.client) : missing();
    }),
    http.post(fapiUrl('/v1/me/email_addresses'), async ({ request }) => {
      const body = new URLSearchParams(await request.text());
      const email = fapiEmailAddress({
        id: `idn_${++identifications}`,
        email_address: body.get('email_address') ?? '',
      });
      const user = updateActiveUser(state, user => ({ ...user, email_addresses: [...user.email_addresses, email] }));
      return user ? envelope(email, state.client) : missing();
    }),
    http.get(fapiUrl('/v1/me/email_addresses/:id'), ({ params }) => {
      const email = findEmail(state, params.id);
      return email ? envelope(email, state.client) : missing();
    }),
    http.post(fapiUrl('/v1/me/email_addresses/:id/prepare_verification'), async ({ params, request }) => {
      const email = findEmail(state, params.id);
      if (!email) {
        return missing();
      }
      const strategy = new URLSearchParams(await request.text()).get('strategy');
      if (strategy !== 'email_code' && strategy !== 'email_link' && strategy !== 'enterprise_sso') {
        return rejected('strategy_invalid', `Unsupported strategy ${strategy}`);
      }
      const domain = email.email_address.split('@')[1] ?? 'acme.co';
      const prepared: EmailAddressJSON = {
        ...email,
        verification: fapiVerification(strategy, {
          external_verification_redirect_url: strategy === 'enterprise_sso' ? `https://idp.${domain}/sso` : undefined,
        }),
      };
      replaceEmail(state, prepared);
      return envelope(prepared, state.client);
    }),
    http.post(fapiUrl('/v1/me/email_addresses/:id/attempt_verification'), async ({ params, request }) => {
      const email = findEmail(state, params.id);
      if (!email) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      if (body.get('code') !== VERIFICATION_CODE) {
        return rejected('form_code_incorrect', 'Incorrect code');
      }
      const verified: EmailAddressJSON = {
        ...email,
        verification: fapiVerification('email_code', { status: 'verified' }),
      };
      replaceEmail(state, verified);
      return envelope(verified, state.client);
    }),
    http.post(fapiUrl('/v1/me/email_addresses/:id'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      const email = findEmail(state, params.id);
      if (!email) {
        return missing();
      }
      updateActiveUser(state, user => ({
        ...user,
        email_addresses: user.email_addresses.filter(e => e.id !== email.id),
        primary_email_address_id: user.primary_email_address_id === email.id ? null : user.primary_email_address_id,
      }));
      return envelope({ object: 'email_address', id: email.id, deleted: true }, state.client);
    }),
    http.post(fapiUrl('/v1/me/phone_numbers'), async ({ request }) => {
      const body = new URLSearchParams(await request.text());
      const phone = fapiPhoneNumber({ id: `idn_${++identifications}`, phone_number: body.get('phone_number') ?? '' });
      const user = updateActiveUser(state, user => ({ ...user, phone_numbers: [...user.phone_numbers, phone] }));
      return user ? envelope(phone, state.client) : missing();
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/:id/prepare_verification'), ({ params }) => {
      const phone = findPhone(state, params.id);
      if (!phone) {
        return missing();
      }
      const prepared = { ...phone, verification: fapiVerification('phone_code') };
      replacePhone(state, prepared);
      return envelope(prepared, state.client);
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/:id/attempt_verification'), async ({ params, request }) => {
      const phone = findPhone(state, params.id);
      if (!phone) {
        return missing();
      }
      const body = new URLSearchParams(await request.text());
      if (body.get('code') !== VERIFICATION_CODE) {
        return rejected('form_code_incorrect', 'Incorrect code');
      }
      const verified = { ...phone, verification: fapiVerification('phone_code', { status: 'verified' }) };
      replacePhone(state, verified);
      return envelope(verified, state.client);
    }),
    http.post(fapiUrl('/v1/me/phone_numbers/:id'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      const phone = findPhone(state, params.id);
      if (!phone) {
        return missing();
      }
      updateActiveUser(state, user => ({
        ...user,
        phone_numbers: user.phone_numbers.filter(p => p.id !== phone.id),
        primary_phone_number_id: user.primary_phone_number_id === phone.id ? null : user.primary_phone_number_id,
      }));
      return envelope({ object: 'phone_number', id: phone.id, deleted: true }, state.client);
    }),
    http.get(fapiUrl('/v1/me/organization_memberships'), ({ request }) =>
      envelope(page(state.memberships, new URL(request.url)), null),
    ),
    http.get(fapiUrl('/v1/me/organization_invitations'), ({ request }) => {
      const url = new URL(request.url);
      return envelope(page(withStatus(state.invitations, url), url), null);
    }),
    http.get(fapiUrl('/v1/me/organization_suggestions'), ({ request }) => {
      const url = new URL(request.url);
      return envelope(page(withStatus(state.suggestions, url), url), null);
    }),
    http.post(fapiUrl('/v1/me/organization_memberships/:organizationId'), ({ params, request }) => {
      if (new URL(request.url).searchParams.get('_method') !== 'DELETE') {
        return undefined;
      }
      const user = activeUser(state);
      const membership = state.memberships.find(m => m.organization.id === params.organizationId);
      if (!user || !membership) {
        return missing();
      }
      leaveOrganization(state, membership.organization.id, user.id);
      return envelope({ object: 'organization_membership', id: membership.id, deleted: true }, state.client);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId'), async ({ params, request }) => {
      const method = new URL(request.url).searchParams.get('_method');
      if (method === 'PATCH') {
        const membership = state.memberships.find(m => m.organization.id === params.organizationId);
        if (!membership) {
          return missing();
        }
        const body = new URLSearchParams(await request.text());
        const organization = {
          ...membership.organization,
          ...(body.has('name') ? { name: body.get('name') ?? '' } : {}),
          ...(body.has('slug') ? { slug: body.get('slug') ?? '' } : {}),
        };
        updateOrganization(state, organization);
        return envelope(organization, state.client);
      }
      if (method !== 'DELETE') {
        return undefined;
      }
      const membership = state.memberships.find(m => m.organization.id === params.organizationId);
      if (!membership) {
        return missing();
      }
      deleteOrganization(state, membership.organization.id);
      return envelope({ object: 'organization', id: membership.organization.id, deleted: true }, state.client);
    }),
    http.post(fapiUrl('/v1/organizations/:organizationId/logo'), ({ params, request }) => {
      const method = new URL(request.url).searchParams.get('_method');
      if (method !== 'PUT' && method !== 'DELETE') {
        return undefined;
      }
      const membership = state.memberships.find(m => m.organization.id === params.organizationId);
      if (!membership) {
        return missing();
      }
      const organization = {
        ...membership.organization,
        has_image: method === 'PUT',
        image_url: method === 'PUT' ? `https://example.com/${membership.organization.id}/logo.png` : '',
      };
      updateOrganization(state, organization);
      return envelope(
        method === 'DELETE' ? { object: 'image', id: `img_${organization.id}`, deleted: true } : organization,
        state.client,
      );
    }),
    http.post(fapiUrl('/v1/me/organization_invitations/:id/accept'), ({ params }) => {
      const invitation = state.invitations.find(i => i.id === params.id);
      if (!invitation) {
        return missing();
      }
      const accepted = { ...invitation, status: 'accepted' as const };
      state.invitations = state.invitations.map(i => (i.id === accepted.id ? accepted : i));
      state.memberships = [...state.memberships, fapiMembership(fapiOrganization(invitation.public_organization_data))];
      return envelope(accepted, state.client);
    }),
    http.post(fapiUrl('/v1/me/organization_suggestions/:id/accept'), ({ params }) => {
      const suggestion = state.suggestions.find(s => s.id === params.id);
      if (!suggestion) {
        return missing();
      }
      const accepted = { ...suggestion, status: 'accepted' as const };
      state.suggestions = state.suggestions.map(s => (s.id === accepted.id ? accepted : s));
      return envelope(accepted, state.client);
    }),
    http.get(fapiUrl('/api_keys'), ({ request }) => {
      const url = new URL(request.url);
      const subject = url.searchParams.get('subject');
      const query = (url.searchParams.get('query') ?? '').toLowerCase();
      const keys = state.apiKeys.filter(
        key => !key.revoked && key.subject === subject && key.name.toLowerCase().includes(query),
      );
      return HttpResponse.json(page(keys, url));
    }),
    http.post(fapiUrl('/api_keys'), async ({ request }) => {
      const body: { name: string; subject: string; seconds_until_expiration?: number } = await request.json();
      if (state.apiKeys.some(key => !key.revoked && key.subject === body.subject && key.name === body.name)) {
        return error('token_creation_conflict', 409);
      }
      const now = Date.now();
      const created = fapiApiKey({
        id: `ak_${state.apiKeys.length + 1}`,
        name: body.name,
        subject: body.subject,
        expiration: body.seconds_until_expiration ? now + body.seconds_until_expiration * 1000 : null,
        created_at: now,
        updated_at: now,
      });
      state.apiKeys = [created, ...state.apiKeys];
      return HttpResponse.json({ ...created, secret: `ak_secret_${created.id}` });
    }),
    http.post(fapiUrl('/api_keys/:id/revoke'), ({ params }) => {
      const key = state.apiKeys.find(k => k.id === params.id);
      if (!key) {
        return missing();
      }
      const revoked = { ...key, revoked: true };
      state.apiKeys = state.apiKeys.map(k => (k.id === revoked.id ? revoked : k));
      return HttpResponse.json(revoked);
    }),
  );

  return state;
}

export interface HeldRequests {
  requests: Request[];
  release: () => void;
  fail: (code?: string, longMessage?: string, paramName?: string) => void;
}

interface Hold {
  name: string;
  release: () => void;
}

const unsettledHolds = new Set<Hold>();

export function takeUnsettledHolds(): string[] {
  const holds = [...unsettledHolds];
  unsettledHolds.clear();
  for (const hold of holds) {
    hold.release();
  }
  return holds.map(hold => hold.name);
}

export function holdRequests(method: 'get' | 'post', path: string): HeldRequests {
  const requests: Request[] = [];
  let resolveGate: (response: Response | undefined) => void = () => {};
  const gate = new Promise<Response | undefined>(resolve => {
    resolveGate = resolve;
  });
  const hold: Hold = { name: `${method.toUpperCase()} ${path}`, release: () => resolveGate(undefined) };
  const settle = (response: Response | undefined) => {
    unsettledHolds.delete(hold);
    resolveGate(response);
  };
  unsettledHolds.add(hold);

  worker.use(
    http[method](fapiUrl(path), ({ request }) => {
      requests.push(request.clone());
      return gate;
    }),
  );

  return {
    requests,
    release: () => settle(undefined),
    fail: (code = 'form_param_invalid', longMessage = code, paramName?: string) =>
      settle(
        HttpResponse.json(
          {
            errors: [
              {
                code,
                message: code,
                long_message: longMessage,
                ...(paramName ? { meta: { param_name: paramName } } : {}),
              },
            ],
          },
          { status: 400 },
        ),
      ),
  };
}
