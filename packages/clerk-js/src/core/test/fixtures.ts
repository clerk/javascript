import type {
  EmailAddressJSON,
  ExternalAccountJSON,
  MembershipRole,
  OAuthProvider,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationPermission,
  PhoneNumberJSON,
  UserJSON,
} from '@clerk/types';

export const mockJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODMxMCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJHSXBYT0VwVnlKdzUxcmtabjlLbW5jNlN4ciJ9.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

type OrgParams = Partial<OrganizationJSON> & { role?: MembershipRole; permissions?: OrganizationPermission[] };

type WithUserParams = Omit<
  Partial<UserJSON>,
  'email_addresses' | 'phone_numbers' | 'external_accounts' | 'organization_memberships'
> & {
  email_addresses?: Array<string | Partial<EmailAddressJSON>>;
  phone_numbers?: Array<string | Partial<PhoneNumberJSON>>;
  external_accounts?: Array<OAuthProvider | Partial<ExternalAccountJSON>>;
  organization_memberships?: Array<string | OrgParams>;
};

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
      logo_url: null,
      image_url: 'https://img.clerk.com',
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
      'org:sys_domains:delete',
      'org:sys_domains:manage',
      'org:sys_domains:read',
      'org:sys_memberships:delete',
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
    avatar_url: '',
    username: '',
    verification: {
      status: 'verified',
      strategy: '',
      attempts: null,
      expire_at: 1635977979774,
    },
    ...params,
  } as ExternalAccountJSON;
};

export const createUser = (params: WithUserParams): UserJSON => {
  const res = {
    object: 'user',
    id: params.id,
    primary_email_address_id: '',
    primary_phone_number_id: '',
    primary_web3_wallet_id: '',
    profile_image_url: '',
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
    email_addresses: (params.email_addresses || []).map(e =>
      typeof e === 'string' ? createEmail({ email_address: e }) : createEmail(e),
    ),
    phone_numbers: (params.phone_numbers || []).map(n =>
      typeof n === 'string' ? createPhoneNumber({ phone_number: n }) : createPhoneNumber(n),
    ),
    external_accounts: (params.external_accounts || []).map(p =>
      typeof p === 'string' ? createExternalAccount({ provider: p }) : createExternalAccount(p),
    ),
    organization_memberships: (params.organization_memberships || []).map(o =>
      typeof o === 'string' ? createOrganizationMembership({ name: o }) : createOrganizationMembership(o),
    ),
  } as any as UserJSON;
  res.primary_email_address_id = res.email_addresses[0]?.id;
  return res;
};

export const clerkMock = () => {
  return {
    getFapiClient: jest.fn().mockReturnValue({
      request: jest.fn().mockReturnValue({ payload: { object: 'token', jwt: mockJwt }, status: 200 }),
    }),
  };
};
