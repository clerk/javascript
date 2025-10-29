import type {
  Clerk,
  EmailAddressJSON,
  ExternalAccountJSON,
  OAuthProvider,
  OrganizationCustomRoleKey,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationPermissionKey,
  PhoneNumberJSON,
  SessionJSON,
  SignInJSON,
  SignUpJSON,
  UserJSON,
} from '@clerk/shared/types';
import { vi } from 'vitest';

export const mockJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODMxMCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJHSXBYT0VwVnlKdzUxcmtabjlLbW5jNlN4ciJ9.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

export type OrgParams = Partial<OrganizationJSON> & {
  role?: OrganizationCustomRoleKey;
  permissions?: OrganizationPermissionKey[];
};

type WithUserParams = Omit<
  Partial<UserJSON>,
  'email_addresses' | 'phone_numbers' | 'external_accounts' | 'organization_memberships'
> & {
  email_addresses?: Array<string | Partial<EmailAddressJSON>>;
  phone_numbers?: Array<string | Partial<PhoneNumberJSON>>;
  external_accounts?: Array<OAuthProvider | Partial<ExternalAccountJSON>>;
  organization_memberships?: Array<string | OrgParams>;
};

type WithSessionParams = Partial<SessionJSON>;

export const getOrganizationId = (orgParams: OrgParams) => orgParams?.id || orgParams?.name || 'test_id';

export const createOrganizationMembership = (params: OrgParams): OrganizationMembershipJSON => {
  const { role, permissions, ...orgParams } = params;
  return {
    created_at: new Date().getTime(),
    id: getOrganizationId(orgParams),
    object: 'organization_membership',
    organization: {
      created_at: new Date().getTime(),
      id: getOrganizationId(orgParams),
      image_url:
        'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18xbHlXRFppb2JyNjAwQUtVZVFEb1NsckVtb00iLCJyaWQiOiJ1c2VyXzJKbElJQTN2VXNjWXh1N2VUMnhINmFrTGgxOCIsImluaXRpYWxzIjoiREsifQ?width=160',
      max_allowed_memberships: 3,
      members_count: 1,
      name: 'Org',
      object: 'organization',
      pending_invitations_count: 0,
      public_metadata: {},
      slug: null,
      updated_at: new Date().getTime(),
      ...orgParams,
    } as OrganizationJSON,
    public_metadata: {},
    role: role || 'admin',
    permissions: permissions || [
      'org:sys_domains:manage',
      'org:sys_domains:read',
      'org:sys_memberships:manage',
      'org:sys_memberships:read',
      'org:sys_profile:delete',
      'org:sys_profile:manage',
    ],
    updated_at: new Date().getTime(),
  } as OrganizationMembershipJSON;
};

export const createEmail = (params?: Partial<EmailAddressJSON>): EmailAddressJSON => {
  return {
    object: 'email_address',
    id: params?.email_address || '',
    email_address: 'test@clerk.com',
    reserved: false,
    verification: {
      status: 'verified',
      strategy: 'email_link',
      attempts: null,
      expire_at: 1635977979774,
    },
    linked_to: [],
    ...params,
  } as EmailAddressJSON;
};

export const createPhoneNumber = (params?: Partial<PhoneNumberJSON>): PhoneNumberJSON => {
  return {
    object: 'phone_number',
    id: params?.phone_number || '',
    phone_number: '+30 691 1111111',
    reserved: false,
    verification: {
      status: 'verified',
      strategy: 'phone_code',
      attempts: null,
      expire_at: 1635977979774,
    },
    linked_to: [],
    ...params,
  } as PhoneNumberJSON;
};

export const createExternalAccount = (params?: Partial<ExternalAccountJSON>): ExternalAccountJSON => {
  return {
    id: params?.provider || '',
    object: 'external_account',
    provider: 'google',
    identification_id: '98675202',
    provider_user_id: '3232',
    approved_scopes: '',
    email_address: 'test@clerk.com',
    first_name: 'First name',
    last_name: 'Last name',
    image_url: '',
    username: '',
    phoneNumber: '',
    verification: {
      status: 'verified',
      strategy: '',
      attempts: null,
      expire_at: 1635977979774,
    },
    ...params,
  } as ExternalAccountJSON;
};

export const createUser = (params?: WithUserParams): UserJSON => {
  const res = {
    object: 'user',
    id: params?.id || 'user_123',
    primary_email_address_id: '',
    primary_phone_number_id: '',
    primary_web3_wallet_id: '',
    image_url: '',
    username: 'testUsername',
    web3_wallets: [],
    password: '',
    profile_image_id: '',
    first_name: 'FirstName',
    last_name: 'LastName',
    password_enabled: false,
    totp_enabled: false,
    backup_code_enabled: false,
    two_factor_enabled: false,
    public_metadata: {},
    unsafe_metadata: {},
    last_sign_in_at: null,
    updated_at: new Date().getTime(),
    created_at: new Date().getTime(),
    ...params,
    email_addresses: (params?.email_addresses || []).map(e =>
      typeof e === 'string' ? createEmail({ email_address: e }) : createEmail(e),
    ),
    phone_numbers: (params?.phone_numbers || []).map(n =>
      typeof n === 'string' ? createPhoneNumber({ phone_number: n }) : createPhoneNumber(n),
    ),
    external_accounts: (params?.external_accounts || []).map(p =>
      typeof p === 'string' ? createExternalAccount({ provider: p }) : createExternalAccount(p),
    ),
    organization_memberships: (params?.organization_memberships || []).map(o =>
      typeof o === 'string' ? createOrganizationMembership({ name: o }) : createOrganizationMembership(o),
    ),
  } as UserJSON;
  res.primary_email_address_id = res.email_addresses[0]?.id;
  return res;
};

export const createSession = (sessionParams: WithSessionParams = {}, user: Partial<UserJSON> = {}) => {
  return {
    object: 'session',
    id: sessionParams.id,
    status: sessionParams.status,
    expire_at: sessionParams.expire_at || Date.now() + 5000,
    abandon_at: sessionParams.abandon_at,
    last_active_at: sessionParams.last_active_at || Date.now(),
    last_active_organization_id: sessionParams.last_active_organization_id,
    actor: sessionParams.actor,
    user: createUser({}),
    public_user_data: {
      first_name: user.first_name,
      last_name: user.last_name,
      image_url: user.image_url,
      has_image: user.has_image,
      identifier: user.email_addresses?.find(e => e.id === user.primary_email_address_id)?.email_address || '',
    },
    created_at: sessionParams.created_at || Date.now() - 1000,
    updated_at: sessionParams.updated_at || Date.now(),
    last_active_token: {
      object: 'token',
      jwt: mockJwt,
    },
  } as SessionJSON;
};

export const createSignIn = (signInParams: Partial<SignInJSON> = {}, user: Partial<UserJSON> = {}) => {
  return {
    id: signInParams.id,
    created_session_id: signInParams.created_session_id,
    status: signInParams.status,
    first_factor_verification: signInParams.first_factor_verification,
    identifier: signInParams.identifier,
    object: 'sign_in',
    second_factor_verification: signInParams.second_factor_verification,
    supported_first_factors: signInParams.supported_first_factors,
    untrusted_first_factors: signInParams.untrusted_first_factors || [],
    supported_second_factors: signInParams.supported_second_factors,
    user_data: {
      first_name: user.first_name,
      last_name: user.last_name,
      image_url: user.image_url,
      has_image: user.has_image,
    },
  } as SignInJSON;
};

export const createSignUp = (signUpParams: Partial<SignUpJSON> = {}) => {
  return {
    id: signUpParams.id,
    created_session_id: signUpParams.created_session_id,
    status: signUpParams.status,
    abandon_at: signUpParams.abandon_at,
    created_user_id: signUpParams.created_user_id,
    email_address: signUpParams.email_address,
    external_account: signUpParams.external_account,
    external_account_strategy: signUpParams.external_account_strategy,
    first_name: signUpParams.first_name,
    has_password: signUpParams.has_password,
    last_name: signUpParams.last_name,
    legal_accepted_at: signUpParams.legal_accepted_at,
    locale: signUpParams.locale,
    missing_fields: signUpParams.missing_fields,
    object: 'sign_up',
    optional_fields: signUpParams.optional_fields,
    phone_number: signUpParams.phone_number,
    required_fields: signUpParams.required_fields,
    unsafe_metadata: signUpParams.unsafe_metadata,
    unverified_fields: signUpParams.unverified_fields,
    username: signUpParams.username,
    verifications: signUpParams.verifications,
    web3_wallet: signUpParams.web3_wallet,
  } as SignUpJSON;
};

export const clerkMock = (params?: Partial<Clerk>) => {
  return {
    getFapiClient: vi.fn().mockReturnValue({
      request: vi.fn().mockReturnValue({ payload: { object: 'token', jwt: mockJwt }, status: 200 }),
    }),
    ...params,
  };
};

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export const mockFetch = (ok = true, status = 200, responsePayload = {}) => {
  // @ts-ignore
  global.fetch = vi.fn(() => {
    return Promise.resolve<RecursivePartial<Response>>({
      status,
      statusText: status.toString(),
      ok,
      json: () => Promise.resolve(responsePayload),
    });
  });
};

export const mockNetworkFailedFetch = () => {
  // @ts-ignore
  global.fetch = vi.fn(() => {
    return Promise.reject(new TypeError('Failed to fetch'));
  });
};

export const mockDevClerkInstance = {
  frontendApi: 'clerk.example.com',
  instanceType: 'development',
  isSatellite: false,
  version: 'test-0.0.0',
  domain: '',
};
