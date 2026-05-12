import {
  BillingService,
  clerkHandlers,
  EnvironmentService,
  SessionService,
  setClerkState,
  type MockScenario,
  UserService,
  OrganizationService,
} from '@clerk/msw';

export function OrgProfileSeatLimit(): MockScenario {
  const organization = OrganizationService.create({ maxAllowedMemberships: 10 });
  const user = UserService.create();
  user.organizationMemberships = [
    {
      object: 'organization_membership',
      id: 'orgmem_3004mVaZrB4yD63C9KuwTMWNKbj',
      public_metadata: {},
      role: 'org:owner',
      role_name: 'Owner',
      permissions: [
        'org:applications:create',
        'org:applications:manage',
        'org:applications:delete',
        'org:billing:read',
        'org:billing:manage',
        'org:config:read',
        'org:config:manage',
        'org:global:read',
        'org:global:manage',
        'org:instances:create',
        'org:instances:manage',
        'org:instances:delete',
        'org:restrictions:read',
        'org:restrictions:manage',
        'org:secrets:manage',
        'org:users:imp',
        'org:sys_profile:manage',
        'org:sys_profile:delete',
        'org:sys_billing:read',
        'org:sys_billing:manage',
        'org:sys_domains:read',
        'org:sys_domains:manage',
        'org:sys_memberships:read',
        'org:sys_memberships:manage',
      ],
      created_at: 1752751315275,
      updated_at: 1752751315275,
      organization,
    },
  ];
  const session = SessionService.create(user);
  const plans = BillingService.createDefaultPlans();
  const subscription = BillingService.createSubscription(plans[1]);

  setClerkState({
    environment: EnvironmentService.MULTI_SESSION,
    session,
    user,
    organization,
    billing: {
      plans,
      subscription,
    },
  });

  return {
    description: 'OrganizationProfile with a seat limit',
    handlers: clerkHandlers,
    initialState: { session, user, organization },
    name: 'org-profile-seat-limit',
  };
}
