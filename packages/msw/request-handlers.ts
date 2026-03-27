import { http, HttpResponse } from 'msw';

import type {
  BillingPaymentMethodJSON,
  BillingPayerJSON,
  BillingPlanJSON,
  BillingSubscriptionJSON,
  OrganizationMembershipResource,
  OrganizationResource,
  SessionResource,
  UserResource,
} from '@clerk/shared/types';

import { BillingService } from './BillingService';
import { EnvironmentService, type EnvironmentPreset } from './EnvironmentService';
import { OrganizationService } from './OrganizationService';
import { SessionService } from './SessionService';
import { SignInService } from './SignInService';
import { SignUpService } from './SignUpService';
import { UserService } from './UserService';

type ErrorResponse = {
  error: string;
};

type SuccessResponse = {
  success: boolean;
};

function createNoStoreResponse(data: any, options?: { status?: number }) {
  return HttpResponse.json(data, {
    status: options?.status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    },
  });
}

function createCacheableResponse(data: any, maxAge: number = 60) {
  return HttpResponse.json(data, {
    headers: {
      'Cache-Control': `public, max-age=${maxAge}`,
    },
  });
}

function createUserResourceResponse(session: SessionResource | null, user: UserResource, resource: any) {
  if (session) {
    session.user = user;
  }
  user.updatedAt = new Date();

  const serializedUser = SessionService.serialize(user);
  const clientState = SessionService.getClientState(session);

  clientState.response.sessions = clientState.response.sessions?.map(sess => ({
    ...sess,
    user: serializedUser,
  }));

  return createNoStoreResponse({
    client: clientState.response,
    response: SessionService.serialize(resource),
  });
}

function parseUrlEncodedBody(text: string): Record<string, any> {
  const body: Record<string, any> = {};
  const params = new URLSearchParams(text);
  params.forEach((value, key) => {
    body[key] = value;
  });
  return body;
}

function createValidationError(paramName: string, message: string, longMessage: string) {
  return createNoStoreResponse(
    {
      errors: [
        {
          code: 'form_param_nil',
          long_message: longMessage,
          message,
          meta: { param_name: paramName },
        },
      ],
    },
    { status: 422 },
  );
}

function normalizeOrganizationSlug(name?: string, providedSlug?: string) {
  const base = (providedSlug || name || 'organization').toString().trim().toLowerCase();
  const normalized = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return normalized || 'organization';
}

async function handleOrganizationCreate(request: Request) {
  if (!currentSession || !currentUser) {
    return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
  }

  let body: any = {};
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      body = parseUrlEncodedBody(await request.text());
    }
  } catch {
    body = {};
  }

  const name = body.name || body.organization_name;
  const slugInput = body.slug || body.organization_slug;
  const publicMetadataInput = body.public_metadata ?? body.publicMetadata;

  if (!name || `${name}`.trim() === '') {
    return createValidationError('name', 'is missing or empty', 'Name is required.');
  }

  const slug = normalizeOrganizationSlug(name, slugInput);

  let publicMetadata = {};
  if (publicMetadataInput !== undefined) {
    try {
      publicMetadata =
        typeof publicMetadataInput === 'string' ? JSON.parse(publicMetadataInput) : publicMetadataInput || {};
    } catch {
      publicMetadata = {};
    }
  }

  const organization = OrganizationService.create({
    id: `org_${Math.random().toString(36).slice(2, 10)}`,
    membersCount: 1,
    name,
    publicMetadata,
    slug,
    updatedAt: new Date(),
  });

  const membership = OrganizationService.createMembership(organization, currentUser.id, 'org:admin');
  const memberships = (currentUser as any).organizationMemberships || [];
  (currentUser as any).organizationMemberships = [...memberships, membership];

  currentMembership = membership;
  currentOrganization = organization;
  SessionService.setOrganization(currentSession, organization);

  const clientState = SessionService.getClientState(currentSession);
  if (clientState.response.sessions) {
    clientState.response.sessions = clientState.response.sessions.map(sess => ({
      ...sess,
      last_active_organization_id: organization.id,
    }));
  }

  return createNoStoreResponse({
    client: clientState.response,
    response: SessionService.serialize(organization),
  });
}

let currentSession: SessionResource | null = null;
let currentUser: UserResource | null = null;
let currentOrganization: OrganizationResource | null = null;
let currentMembership: OrganizationMembershipResource | null = null;
let currentInvitations: any[] = [];
let currentEnvironment: EnvironmentPreset = EnvironmentService.MULTI_SESSION;
let currentBillingPlans: BillingPlanJSON[] = BillingService.createDefaultPlans();
let currentSubscription: BillingSubscriptionJSON | null = null;
let currentOrganizationSubscription: BillingSubscriptionJSON | null = null;

function getSubscriptionPayerType(
  subscription: BillingSubscriptionJSON | null | undefined,
): BillingPlanJSON['for_payer_type'] | null {
  return subscription?.subscription_items?.[0]?.plan?.for_payer_type ?? null;
}

function getBillingPlans(): BillingPlanJSON[] {
  if (currentBillingPlans.length > 0) {
    return currentBillingPlans;
  }
  return BillingService.createDefaultPlans();
}

function getBillingPlansForPayerType(payerType: BillingPlanJSON['for_payer_type']): BillingPlanJSON[] {
  const plans = getBillingPlans().filter(plan => plan.for_payer_type === payerType);
  if (plans.length > 0) {
    return plans;
  }
  return BillingService.createDefaultPlans().filter(plan => plan.for_payer_type === payerType);
}

function getDefaultBillingPlan(payerType: BillingPlanJSON['for_payer_type']): BillingPlanJSON {
  const plans = getBillingPlansForPayerType(payerType);
  return (
    plans.find(plan => plan.is_default) ??
    plans[0] ??
    BillingService.createPlan({
      for_payer_type: payerType,
      id: `plan_${payerType}_fallback`,
      name: payerType === 'org' ? 'Organization Plan' : 'User Plan',
      slug: `${payerType}-fallback`,
    })
  );
}

function resolveBillingPlan(payerType: BillingPlanJSON['for_payer_type'], planId?: string | null): BillingPlanJSON {
  const plans = getBillingPlansForPayerType(payerType);
  if (planId) {
    const matchingPlan = plans.find(plan => plan.id === planId);
    if (matchingPlan) {
      return matchingPlan;
    }
  }
  return getDefaultBillingPlan(payerType);
}

function getCurrentUserEmail(): string | null {
  const safeUser = currentUser as any;
  return (
    safeUser?.primaryEmailAddress?.emailAddress ??
    safeUser?.emailAddresses?.[0]?.emailAddress ??
    (safeUser?.id ? `${safeUser.id}@example.com` : null)
  );
}

function createBillingPayer(orgId?: string): BillingPayerJSON {
  const safeUser = currentUser as any;
  const payerType = orgId ? 'org' : 'user';

  return BillingService.createPayer({
    id: orgId ? `payer_org_${orgId}` : `payer_user_${currentUser?.id ?? 'mock'}`,
    user_id: currentUser?.id ?? null,
    email: getCurrentUserEmail(),
    first_name: safeUser?.firstName ?? null,
    last_name: safeUser?.lastName ?? null,
    organization_id: orgId ?? null,
    organization_name: payerType === 'org' ? ((currentOrganization as any)?.name ?? null) : null,
  });
}

function getStoredSubscriptionForPayerType(
  payerType: BillingPlanJSON['for_payer_type'],
): BillingSubscriptionJSON | null {
  if (payerType === 'org') {
    return currentOrganizationSubscription;
  }
  return currentSubscription;
}

function setStoredSubscriptionForPayerType(
  payerType: BillingPlanJSON['for_payer_type'],
  subscription: BillingSubscriptionJSON | null,
) {
  if (payerType === 'org') {
    currentOrganizationSubscription = subscription;
    return;
  }
  currentSubscription = subscription;
}

function getBillingSubscriptionForPayerType(payerType: BillingPlanJSON['for_payer_type']): BillingSubscriptionJSON {
  const storedSubscription = getStoredSubscriptionForPayerType(payerType);
  if (storedSubscription && getSubscriptionPayerType(storedSubscription) === payerType) {
    return storedSubscription;
  }
  const generatedSubscription = BillingService.createSubscription(getDefaultBillingPlan(payerType));
  setStoredSubscriptionForPayerType(payerType, generatedSubscription);
  return generatedSubscription;
}

function getNestedParams(body: Record<string, unknown>): Record<string, unknown> | null {
  const nested = body.params;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return null;
}

function readStringParam(
  body: Record<string, unknown>,
  keys: string[],
  searchParams: URLSearchParams,
): string | undefined {
  const nested = getNestedParams(body);

  for (const key of keys) {
    const value = body[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }

    const loweredKey = key.toLowerCase();
    const loweredValue = body[loweredKey];
    if (typeof loweredValue === 'string' && loweredValue.length > 0) {
      return loweredValue;
    }

    const nestedValue = nested?.[key];
    if (typeof nestedValue === 'string' && nestedValue.length > 0) {
      return nestedValue;
    }

    const nestedLoweredValue = nested?.[loweredKey];
    if (typeof nestedLoweredValue === 'string' && nestedLoweredValue.length > 0) {
      return nestedLoweredValue;
    }
  }

  for (const key of keys) {
    const fromQuery = searchParams.get(key) ?? searchParams.get(key.toLowerCase());
    if (fromQuery) {
      return fromQuery;
    }
  }

  return undefined;
}

async function parseRequestBodyAsRecord(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (!text) {
    return {};
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // noop
  }

  return parseUrlEncodedBody(text);
}

function parsePagination(searchParams: URLSearchParams): { limit?: number; offset?: number } {
  const parseValue = (value: string | null): number | undefined => {
    if (!value) {
      return undefined;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };

  return {
    limit: parseValue(searchParams.get('limit')),
    offset: parseValue(searchParams.get('offset')),
  };
}

function paginateCollection<T>(items: T[], limit?: number, offset?: number): { data: T[]; total_count: number } {
  const safeOffset = typeof offset === 'number' && offset >= 0 ? offset : 0;
  const safeLimit = typeof limit === 'number' && limit >= 0 ? limit : items.length;
  return {
    data: items.slice(safeOffset, safeOffset + safeLimit),
    total_count: items.length,
  };
}

function normalizePlanPeriod(value: string | null | undefined): 'month' | 'annual' {
  const normalized = (value || '').toLowerCase();
  if (['annual', 'year', 'yearly', 'annually'].includes(normalized)) {
    return 'annual';
  }
  return 'month';
}

function createUnauthorizedResponse() {
  return createNoStoreResponse({ error: 'No active session' }, { status: 401 });
}

function getDefaultPaymentMethods(): BillingPaymentMethodJSON[] {
  return BillingService.createDefaultPaymentMethods();
}

function getPrimaryPaymentMethod(): BillingPaymentMethodJSON | undefined {
  return getDefaultPaymentMethods()[0];
}

export function setClerkState(state: {
  billing?: {
    plans: BillingPlanJSON[];
    subscription: BillingSubscriptionJSON;
  };
  environment?: EnvironmentPreset;
  instance?: EnvironmentPreset;
  membership?: OrganizationMembershipResource | null;
  organization?: OrganizationResource | null;
  session?: SessionResource | null;
  user?: UserResource | null;
}) {
  currentSession = state.session ?? null;
  currentUser = state.user ?? null;
  currentOrganization = state.organization ?? null;
  currentMembership = state.membership ?? null;
  currentInvitations = [];
  currentBillingPlans = state.billing?.plans ?? BillingService.createDefaultPlans();
  currentSubscription = null;
  currentOrganizationSubscription = null;
  if (state.billing?.subscription) {
    const payerType = getSubscriptionPayerType(state.billing.subscription);
    if (payerType === 'org') {
      currentOrganizationSubscription = state.billing.subscription;
    } else {
      currentSubscription = state.billing.subscription;
    }
  }
  SignUpService.reset();
  SignInService.reset();

  // If organization is set, update the session's lastActiveOrganizationId
  if (currentSession && currentOrganization) {
    (currentSession as any).lastActiveOrganizationId = currentOrganization.id;
  }

  if (state.environment) {
    currentEnvironment = state.environment;
  }
  // Support legacy 'instance' parameter for backwards compatibility
  if (state.instance) {
    currentEnvironment = state.instance;
  }
}

export const clerkHandlers = [
  // Environment endpoints
  http.get('*/v1/environment', () => {
    return HttpResponse.json(currentEnvironment.config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }),

  http.post('*/v1/environment', () => {
    return HttpResponse.json(currentEnvironment.config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }),

  http.patch('*/v1/environment', () => {
    return HttpResponse.json(currentEnvironment.config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }),

  // Client state endpoint
  http.get('*/v1/client*', () => {
    const currentSignUp = SignUpService.getCurrentSignUp();
    const currentSignIn = SignInService.getCurrentSignIn();
    const clientState = SessionService.getClientState(currentSession);
    if (currentSignUp) {
      clientState.response.sign_up = currentSignUp as any;
    }
    if (currentSignIn) {
      clientState.response.sign_in = currentSignIn as any;
    }

    // Include organization and task data in sessions
    if (clientState.response.sessions && currentSession) {
      clientState.response.sessions = clientState.response.sessions.map((sess: any) => {
        const updates: any = { ...sess };

        // Include organization ID if active
        if (currentOrganization) {
          updates.last_active_organization_id = currentOrganization.id;
        }

        // Include task data
        if ((currentSession as any).currentTask) {
          updates.current_task = SessionService.serialize((currentSession as any).currentTask);
        }
        if ((currentSession as any).tasks) {
          updates.tasks = SessionService.serialize((currentSession as any).tasks);
        }

        return updates;
      });
    }

    return createNoStoreResponse(clientState);
  }),

  // POST client endpoint - used for setting active session/organization
  http.post('*/v1/client', async ({ request }) => {
    const body = parseUrlEncodedBody(await request.text());

    // Handle setting active organization
    if (body.active_organization_id && currentOrganization) {
      if (currentSession) {
        (currentSession as any).lastActiveOrganizationId = body.active_organization_id;
      }
    }

    const clientState = SessionService.getClientState(currentSession);
    const activeOrgId = currentOrganization?.id;
    if (activeOrgId && currentMembership && clientState.response.sessions) {
      clientState.response.sessions = clientState.response.sessions.map((sess: any) => ({
        ...sess,
        last_active_organization_id: activeOrgId,
      }));
    }
    return createNoStoreResponse(clientState);
  }),

  // Session token endpoints
  http.post('*/v1/client/sessions/tokens', async () => {
    if (!currentSession || !currentUser) {
      return HttpResponse.json({ error: 'No active session' }, { status: 401 });
    }
    const token = await SessionService.generateToken(currentUser, currentSession, currentOrganization?.id);
    return createCacheableResponse(token, 60);
  }),

  http.post('*/v1/client/sessions/:sessionId/tokens', async () => {
    if (!currentSession || !currentUser) {
      return HttpResponse.json({ error: 'No active session' }, { status: 401 });
    }
    const token = await SessionService.generateToken(currentUser, currentSession, currentOrganization?.id);
    return createCacheableResponse(token, 60);
  }),

  http.post('*/v1/client/sessions/:sessionId/tokens/:template', async () => {
    if (!currentSession || !currentUser) {
      return HttpResponse.json({ error: 'No active session' }, { status: 401 });
    }
    const token = await SessionService.generateToken(currentUser, currentSession, currentOrganization?.id);
    return createCacheableResponse(token, 60);
  }),

  // Session management
  http.post('*/v1/client/sessions/:sessionId/end', () => {
    if (!currentSession) {
      return HttpResponse.json({ error: 'No active session' }, { status: 401 });
    }
    return HttpResponse.json(SessionService.getEndResponse(currentSession));
  }),

  http.post('*/v1/client/sessions/:sessionId/touch', () => {
    if (!currentSession || !currentUser) {
      return HttpResponse.json({ error: 'No active session' }, { status: 401 });
    }
    return HttpResponse.json(SessionService.handleTouch(currentSession));
  }),

  // Set active organization endpoint
  http.post('*/v1/client/sessions/:sessionId/organization/:orgId', ({ params }) => {
    if (!currentSession || !currentUser) {
      return HttpResponse.json({ error: 'No active session' }, { status: 401 });
    }

    const orgId = params.orgId as string;

    // Find the organization from user's memberships
    let org = currentOrganization;
    if (currentUser && (currentUser as any).organizationMemberships?.length > 0) {
      const membership = (currentUser as any).organizationMemberships.find((m: any) => m.organization?.id === orgId);
      if (membership?.organization) {
        org = membership.organization;
        currentOrganization = org;
        currentMembership = membership;
      }
    }

    if (org) {
      (currentSession as any).lastActiveOrganizationId = org.id;
    }

    const touchResponse = SessionService.handleTouch(currentSession);
    // Include organization ID in response
    if (org) {
      touchResponse.response.last_active_organization_id = org.id;
      if (touchResponse.client.sessions) {
        touchResponse.client.sessions = touchResponse.client.sessions.map((sess: any) => ({
          ...sess,
          last_active_organization_id: org!.id,
        }));
      }
    }

    return createNoStoreResponse(touchResponse);
  }),

  http.get('*/v1/client/sessions/:sessionId', () => {
    if (!currentSession) {
      return HttpResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return HttpResponse.json(SessionService.getSessionResponse(currentSession));
  }),

  // Session tasks endpoints
  http.get('*/v1/client/sessions/:sessionId/tasks', () => {
    if (!currentSession) {
      return HttpResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const tasks = (currentSession as any).tasks || [];
    return createNoStoreResponse({
      response: {
        data: Array.isArray(tasks) ? tasks : tasks.data || [],
        total_count: Array.isArray(tasks) ? tasks.length : tasks.total_count || 0,
      },
    });
  }),

  http.post('*/v1/client/sessions/:sessionId/tasks/:taskId/resolve', async ({ params, request }) => {
    if (!currentSession) {
      return HttpResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const taskId = params.taskId as string;
    const body = parseUrlEncodedBody(await request.text());

    // If resolving with an organization, set it as active
    if (body.destination_organization_id && currentUser) {
      const orgId = body.destination_organization_id;
      const memberships = (currentUser as any).organizationMemberships || [];
      const membership = memberships.find((m: any) => m.organization?.id === orgId);

      if (membership?.organization) {
        currentOrganization = membership.organization;
        currentMembership = membership;
        (currentSession as any).lastActiveOrganizationId = orgId;
      }
    }

    // Mark task as complete
    if ((currentSession as any).tasks?.data) {
      (currentSession as any).tasks.data = (currentSession as any).tasks.data.map((t: any) =>
        t.id === taskId ? { ...t, status: 'complete' } : t,
      );
    }
    if ((currentSession as any).currentTask?.id === taskId) {
      (currentSession as any).currentTask = null;
    }

    const clientState = SessionService.getClientState(currentSession);
    const resolvedOrgId = currentOrganization?.id;
    if (resolvedOrgId && clientState.response.sessions) {
      clientState.response.sessions = clientState.response.sessions.map((sess: any) => ({
        ...sess,
        last_active_organization_id: resolvedOrgId,
      }));
    }

    return createNoStoreResponse({
      client: clientState.response,
      response: { status: 'complete' },
    });
  }),

  // User endpoints
  http.get('/v1/client/users/:userId', () => {
    if (!currentUser) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json({ response: SessionService.serialize(currentUser) });
  }),

  http.post('https://*.clerk.accounts.dev/v1/me', async ({ request }) => {
    if (!currentUser) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    const body = parseUrlEncodedBody(await request.text());
    UserService.updateUser(currentUser, body);

    const clientState = SessionService.getClientState(currentSession);

    return createNoStoreResponse({
      client: clientState.response,
      response: SessionService.serialize(currentUser),
    });
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/email_addresses', async ({ request }) => {
    if (!currentUser || !currentSession) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    const body = parseUrlEncodedBody(await request.text());
    const emailAddress = body.email_address || body.emailAddress;

    if (!emailAddress) {
      return createValidationError('email_address', 'is missing or empty', 'Email address is required.');
    }

    const newEmail = UserService.addEmailAddress(currentUser, emailAddress);
    return createUserResourceResponse(currentSession, currentUser, newEmail);
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/email_addresses/:emailId/prepare_verification', ({ params }) => {
    if (!currentUser || !currentSession) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    const emailId = params.emailId as string;
    const email = UserService.prepareEmailVerification(currentUser, emailId);

    if (!email) {
      return createNoStoreResponse({ error: 'Email address not found' }, { status: 404 });
    }

    return createUserResourceResponse(currentSession, currentUser, email);
  }),

  http.post(
    'https://*.clerk.accounts.dev/v1/me/email_addresses/:emailId/attempt_verification',
    async ({ params, request }) => {
      if (!currentUser || !currentSession) {
        return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
      }

      const body = parseUrlEncodedBody(await request.text());
      const code = body.code;

      if (!code || code.trim() === '') {
        return createValidationError('code', 'is missing or empty', 'Please enter your verification code.');
      }

      const emailId = params.emailId as string;
      const email = UserService.verifyEmailAddress(currentUser, emailId);

      if (!email) {
        return createNoStoreResponse({ error: 'Email address not found' }, { status: 404 });
      }

      return createUserResourceResponse(currentSession, currentUser, email);
    },
  ),

  http.post('https://*.clerk.accounts.dev/v1/me/phone_numbers', async ({ request }) => {
    if (!currentUser || !currentSession) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    const body = parseUrlEncodedBody(await request.text());
    const phoneNumber = body.phone_number || body.phoneNumber;

    if (!phoneNumber) {
      return createValidationError('phone_number', 'is missing or empty', 'Phone number is required.');
    }

    const newPhone = UserService.addPhoneNumber(currentUser, phoneNumber);
    return createUserResourceResponse(currentSession, currentUser, newPhone);
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/phone_numbers/:phoneId/prepare_verification', ({ params }) => {
    if (!currentUser || !currentSession) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    const phoneId = params.phoneId as string;
    const phone = UserService.preparePhoneVerification(currentUser, phoneId);

    if (!phone) {
      return createNoStoreResponse({ error: 'Phone number not found' }, { status: 404 });
    }

    return createUserResourceResponse(currentSession, currentUser, phone);
  }),

  http.post(
    'https://*.clerk.accounts.dev/v1/me/phone_numbers/:phoneId/attempt_verification',
    async ({ params, request }) => {
      if (!currentUser || !currentSession) {
        return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
      }

      const body = parseUrlEncodedBody(await request.text());
      const code = body.code;

      if (!code || code.trim() === '') {
        return createValidationError('code', 'is missing or empty', 'Please enter your verification code.');
      }

      const phoneId = params.phoneId as string;
      const phone = UserService.verifyPhoneNumber(currentUser, phoneId);

      if (!phone) {
        return createNoStoreResponse({ error: 'Phone number not found' }, { status: 404 });
      }

      return createUserResourceResponse(currentSession, currentUser, phone);
    },
  ),

  http.post('https://*.clerk.accounts.dev/v1/me/phone_numbers/:phoneId', async ({ params, request }) => {
    const url = new URL(request.url);
    const method = url.searchParams.get('_method');

    if (method === 'DELETE') {
      if (!currentUser || !currentSession) {
        return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
      }

      const phoneId = params.phoneId as string;
      const removed = UserService.removePhoneNumber(currentUser, phoneId);

      if (!removed) {
        return createNoStoreResponse({ error: 'Phone number not found' }, { status: 404 });
      }

      const deletionResponse = { deleted: true, id: phoneId, object: 'phone_number' };
      return createUserResourceResponse(currentSession, currentUser, deletionResponse);
    }

    if (method !== 'PATCH') {
      return createNoStoreResponse({ error: 'Method not allowed' }, { status: 405 });
    }

    if (!currentUser || !currentSession) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    const body = parseUrlEncodedBody(await request.text());
    const phoneId = params.phoneId as string;
    const phone = UserService.updatePhoneNumber(currentUser, phoneId, body);

    if (!phone) {
      return createNoStoreResponse({ error: 'Phone number not found' }, { status: 404 });
    }

    return createUserResourceResponse(currentSession, currentUser, phone);
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/backup_codes', () => {
    if (!currentUser || !currentSession) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    const backupCodes = UserService.generateBackupCodes(currentUser);

    return createUserResourceResponse(currentSession, currentUser, {
      backup_codes: backupCodes,
      object: 'backup_code',
    });
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/totp', ({ request }) => {
    const url = new URL(request.url);
    const method = url.searchParams.get('_method');

    if (method !== 'DELETE') {
      return createNoStoreResponse({ error: 'Method not allowed' }, { status: 405 });
    }

    if (!currentUser || !currentSession) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    UserService.disableTOTP(currentUser);

    const deletionResponse = { deleted: true, object: 'totp' };
    return createUserResourceResponse(currentSession, currentUser, deletionResponse);
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/external_accounts', async ({ request }) => {
    const url = new URL(request.url);

    if (url.pathname.includes('/external_accounts/')) {
      return;
    }

    if (!currentUser || !currentSession) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    const body = parseUrlEncodedBody(await request.text());
    const strategy = body.strategy || 'oauth_google';

    const newExternalAccount = UserService.addExternalAccount(currentUser, strategy);
    return createUserResourceResponse(currentSession, currentUser, newExternalAccount);
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/external_accounts/:externalAccountId', ({ params, request }) => {
    const url = new URL(request.url);
    const method = url.searchParams.get('_method');

    if (method !== 'DELETE') {
      return createNoStoreResponse({ error: 'Method not allowed' }, { status: 405 });
    }

    if (!currentUser || !currentSession) {
      return createNoStoreResponse({ error: 'User not found' }, { status: 404 });
    }

    const externalAccountId = params.externalAccountId as string;
    const removed = UserService.removeExternalAccount(currentUser, externalAccountId);

    if (!removed) {
      return createNoStoreResponse({ error: 'External account not found' }, { status: 404 });
    }

    const deletionResponse = { deleted: true, id: externalAccountId, object: 'external_account' };
    return createUserResourceResponse(currentSession, currentUser, deletionResponse);
  }),

  // User sessions endpoint
  http.get('*/v1/users/:userId/sessions', async () => {
    if (!currentUser) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const sessions = await currentUser.getSessions();
    const serializedSessions = sessions.map((session: any) => SessionService.serialize(session));
    return createNoStoreResponse(serializedSessions);
  }),

  http.get('*/v1/me/sessions/active', async () => {
    if (!currentUser) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const sessions = await currentUser.getSessions();
    const serializedSessions = sessions.map((session: any) => SessionService.serialize(session));
    return createNoStoreResponse(serializedSessions);
  }),

  http.get('*/v1/me/sessions', async () => {
    if (!currentUser) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const sessions = await currentUser.getSessions();
    const serializedSessions = sessions.map((session: any) => SessionService.serialize(session));
    return createNoStoreResponse(serializedSessions);
  }),

  // Revoke session endpoint
  http.post('*/v1/users/:userId/sessions/:sessionId/revoke', async () => {
    return createNoStoreResponse({
      object: 'session',
      status: 'revoked',
    });
  }),

  // Organization endpoints
  http.post('https://*.clerk.accounts.dev/v1/organizations', async ({ request }) => {
    return handleOrganizationCreate(request);
  }),

  http.post('*/v1/organizations', async ({ request }) => {
    return handleOrganizationCreate(request);
  }),

  http.get('*/v1/me/organization_memberships*', () => {
    // First check if user has organizationMemberships array (multiple orgs)
    if (currentUser && (currentUser as any).organizationMemberships?.length > 0) {
      const memberships = (currentUser as any).organizationMemberships;
      return createNoStoreResponse({
        response: {
          data: memberships.map((m: any) => SessionService.serialize(m)),
          total_count: memberships.length,
        },
      });
    }
    // Fall back to single membership if set
    if (currentMembership && currentOrganization) {
      return createNoStoreResponse({
        response: {
          data: [SessionService.serialize(currentMembership)],
          total_count: 1,
        },
      });
    }
    return createNoStoreResponse({
      response: {
        data: [],
        total_count: 0,
      },
    });
  }),

  http.post('*/v1/me/organization_memberships/:orgId', ({ params, request }) => {
    const url = new URL(request.url);
    const method = url.searchParams.get('_method');
    const orgId = params.orgId as string;

    if (method !== 'DELETE') {
      return createNoStoreResponse({ error: 'Method not allowed' }, { status: 405 });
    }

    if ((currentUser as any)?.organizationMemberships?.length > 0) {
      (currentUser as any).organizationMemberships = (currentUser as any).organizationMemberships.filter(
        (membership: any) => membership.organization?.id !== orgId,
      );
    }

    if (currentOrganization?.id === orgId) {
      currentOrganization = null;
      currentMembership = null;
      if (currentSession) {
        (currentSession as any).lastActiveOrganizationId = null;
      }
    }

    const deletionResponse = { deleted: true, id: orgId, object: 'organization_membership' };
    return createNoStoreResponse({
      response: deletionResponse,
    });
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/organization_memberships/:orgId', ({ params, request }) => {
    const url = new URL(request.url);
    const method = url.searchParams.get('_method');
    const orgId = params.orgId as string;

    if (method !== 'DELETE') {
      return createNoStoreResponse({ error: 'Method not allowed' }, { status: 405 });
    }

    if ((currentUser as any)?.organizationMemberships?.length > 0) {
      (currentUser as any).organizationMemberships = (currentUser as any).organizationMemberships.filter(
        (membership: any) => membership.organization?.id !== orgId,
      );
    }

    if (currentOrganization?.id === orgId) {
      currentOrganization = null;
      currentMembership = null;
      if (currentSession) {
        (currentSession as any).lastActiveOrganizationId = null;
      }
    }

    const deletionResponse = { deleted: true, id: orgId, object: 'organization_membership' };
    return createNoStoreResponse({
      response: deletionResponse,
    });
  }),

  http.get('*/v1/me/organization_invitations*', () => {
    return createNoStoreResponse({
      response: {
        data: [],
        total_count: 0,
      },
    });
  }),

  http.get('*/v1/me/organization_suggestions*', () => {
    return createNoStoreResponse({
      response: {
        data: [],
        total_count: 0,
      },
    });
  }),

  // Organization profile endpoints
  http.get('*/v1/organizations/:orgId', ({ params }) => {
    const orgId = params.orgId as string;

    // Check current active organization first
    if (currentOrganization && orgId === currentOrganization.id) {
      return createNoStoreResponse({
        response: SessionService.serialize(currentOrganization),
      });
    }

    // Check user's organization memberships
    if (currentUser && (currentUser as any).organizationMemberships?.length > 0) {
      const membership = (currentUser as any).organizationMemberships.find((m: any) => m.organization?.id === orgId);
      if (membership?.organization) {
        return createNoStoreResponse({
          response: SessionService.serialize(membership.organization),
        });
      }
    }

    return createNoStoreResponse({ error: 'Organization not found' }, { status: 404 });
  }),

  http.get('https://*.clerk.accounts.dev/v1/organizations/:orgId', ({ params }) => {
    const orgId = params.orgId as string;

    if (currentOrganization && orgId === currentOrganization.id) {
      return createNoStoreResponse({
        response: SessionService.serialize(currentOrganization),
      });
    }

    if (currentUser && (currentUser as any).organizationMemberships?.length > 0) {
      const membership = (currentUser as any).organizationMemberships.find((m: any) => m.organization?.id === orgId);
      if (membership?.organization) {
        return createNoStoreResponse({
          response: SessionService.serialize(membership.organization),
        });
      }
    }

    return createNoStoreResponse({ error: 'Organization not found' }, { status: 404 });
  }),

  http.get('*/v1/organizations/:orgId/memberships*', ({ params }) => {
    const orgId = params.orgId as string;

    // Check user's organization memberships for this org
    if (currentUser && (currentUser as any).organizationMemberships?.length > 0) {
      const membership = (currentUser as any).organizationMemberships.find((m: any) => m.organization?.id === orgId);
      if (membership) {
        return createNoStoreResponse({
          data: [SessionService.serialize(membership)],
          total_count: 1,
        });
      }
    }

    // Fall back to current membership if it matches
    if (currentMembership && currentOrganization?.id === orgId) {
      return createNoStoreResponse({
        data: [SessionService.serialize(currentMembership)],
        total_count: 1,
      });
    }

    return createNoStoreResponse({
      data: [],
      total_count: 0,
    });
  }),

  http.get('*/v1/organizations/:orgId/invitations*', ({ params, request }) => {
    const orgId = params.orgId as string;
    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status');
    const limit = Number(url.searchParams.get('limit')) || 10;
    const offset = Number(url.searchParams.get('offset')) || 0;

    const filtered = currentInvitations.filter(invite => invite.organization_id === orgId);
    const statusFiltered = statusParam ? filtered.filter(invite => invite.status === statusParam) : filtered;
    const data = statusFiltered.slice(offset, offset + limit);

    return createNoStoreResponse({
      response: {
        data,
        total_count: statusFiltered.length,
      },
    });
  }),

  http.get('https://*.clerk.accounts.dev/v1/organizations/:orgId/invitations*', ({ params, request }) => {
    const orgId = params.orgId as string;
    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status');
    const limit = Number(url.searchParams.get('limit')) || 10;
    const offset = Number(url.searchParams.get('offset')) || 0;

    const filtered = currentInvitations.filter(invite => invite.organization_id === orgId);
    const statusFiltered = statusParam ? filtered.filter(invite => invite.status === statusParam) : filtered;
    const data = statusFiltered.slice(offset, offset + limit);

    return createNoStoreResponse({
      response: {
        data,
        total_count: statusFiltered.length,
      },
    });
  }),

  http.post('*/v1/organizations/:orgId/invitations', async ({ params, request }) => {
    const orgId = params.orgId as string;
    if (!currentOrganization || orgId !== currentOrganization.id) {
      return createNoStoreResponse({ error: 'Organization not found' }, { status: 404 });
    }

    let body: any = {};
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await request.json();
      } else {
        body = parseUrlEncodedBody(await request.text());
      }
    } catch {
      body = {};
    }

    const email = body.email_address || body.emailAddress;
    const role = body.role || 'org:member';
    if (!email) {
      return createNoStoreResponse(
        {
          errors: [
            {
              code: 'form_param_nil',
              long_message: 'Email address is required.',
              message: 'is missing or empty',
              meta: { param_name: 'email_address' },
            },
          ],
        },
        { status: 422 },
      );
    }
    const now = Date.now();
    const invitation = {
      created_at: now,
      email_address: email,
      id: `orginv_${orgId}_${now}_${Math.random().toString(36).slice(2, 6)}`,
      organization_id: orgId,
      public_metadata: {},
      role,
      role_name: role,
      status: 'pending',
      updated_at: now,
    };
    currentInvitations.push(invitation);
    return createNoStoreResponse({
      response: invitation,
    });
  }),

  http.post('https://*.clerk.accounts.dev/v1/organizations/:orgId/invitations', async ({ params, request }) => {
    const orgId = params.orgId as string;
    if (!currentOrganization || orgId !== currentOrganization.id) {
      return createNoStoreResponse({ error: 'Organization not found' }, { status: 404 });
    }

    let body: any = {};
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await request.json();
      } else {
        body = parseUrlEncodedBody(await request.text());
      }
    } catch {
      body = {};
    }

    const email = body.email_address || body.emailAddress;
    const role = body.role || 'org:member';
    if (!email) {
      return createNoStoreResponse(
        {
          errors: [
            {
              code: 'form_param_nil',
              long_message: 'Email address is required.',
              message: 'is missing or empty',
              meta: { param_name: 'email_address' },
            },
          ],
        },
        { status: 422 },
      );
    }
    const now = Date.now();
    const invitation = {
      created_at: now,
      email_address: email,
      id: `orginv_${orgId}_${now}_${Math.random().toString(36).slice(2, 6)}`,
      organization_id: orgId,
      public_metadata: {},
      role,
      role_name: role,
      status: 'pending',
      updated_at: now,
    };
    currentInvitations.push(invitation);
    return createNoStoreResponse({
      response: invitation,
    });
  }),

  http.post('*/v1/organizations/:orgId/invitations/bulk', async ({ params, request }) => {
    const orgId = params.orgId as string;
    if (!currentOrganization || orgId !== currentOrganization.id) {
      return createNoStoreResponse({ error: 'Organization not found' }, { status: 404 });
    }
    let body: any = {};
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await request.json();
      } else {
        const text = await request.text();
        body = parseUrlEncodedBody(text);
      }
    } catch {
      body = {};
    }

    const role = body.role || 'org:member';
    const now = Date.now();

    const fromArrayObjects = (arr: any[]) =>
      arr
        .map((item, idx) => {
          const email = item?.email_address || item?.emailAddress;
          const itemRole = item?.role || role;
          if (!email) {
            return null;
          }
          return {
            created_at: now,
            email_address: email,
            id: `orginv_${orgId}_${now}_${idx}`,
            organization_id: orgId,
            public_metadata: item?.public_metadata || item?.publicMetadata || {},
            role: itemRole,
            role_name: itemRole,
            status: 'pending',
            updated_at: now,
          };
        })
        .filter(Boolean) as any[];

    let invitations: any[] = [];

    if (Array.isArray(body)) {
      invitations = fromArrayObjects(body);
    } else if (Array.isArray(body.invitations)) {
      invitations = fromArrayObjects(body.invitations);
    } else if (Array.isArray(body.params)) {
      invitations = fromArrayObjects(body.params);
    } else {
      const emails =
        body.email_address || body.email_addresses || body.emailAddresses || body.emailAddress || body.emails || [];
      const emailList = Array.isArray(emails)
        ? emails
        : typeof emails === 'string'
          ? emails
              .split(',')
              .map(e => e.trim())
              .filter(Boolean)
          : [];
      invitations = emailList.map((email: string, idx: number) => ({
        created_at: now,
        email_address: email,
        id: `orginv_${orgId}_${now}_${idx}`,
        organization_id: orgId,
        public_metadata: {},
        role,
        role_name: role,
        status: 'pending',
        updated_at: now,
      }));
    }

    currentInvitations = currentInvitations.concat(invitations);
    return createNoStoreResponse({
      response: invitations,
    });
  }),

  http.post('https://*.clerk.accounts.dev/v1/organizations/:orgId/invitations/bulk', async ({ params, request }) => {
    const orgId = params.orgId as string;
    if (!currentOrganization || orgId !== currentOrganization.id) {
      return createNoStoreResponse({ error: 'Organization not found' }, { status: 404 });
    }
    let body: any = {};
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await request.json();
      } else {
        const text = await request.text();
        body = parseUrlEncodedBody(text);
      }
    } catch {
      body = {};
    }

    const role = body.role || 'org:member';
    const now = Date.now();

    const fromArrayObjects = (arr: any[]) =>
      arr
        .map((item, idx) => {
          const email = item?.email_address || item?.emailAddress;
          const itemRole = item?.role || role;
          if (!email) {
            return null;
          }
          return {
            created_at: now,
            email_address: email,
            id: `orginv_${orgId}_${now}_${idx}`,
            organization_id: orgId,
            public_metadata: item?.public_metadata || item?.publicMetadata || {},
            role: itemRole,
            role_name: itemRole,
            status: 'pending',
            updated_at: now,
          };
        })
        .filter(Boolean) as any[];

    let invitations: any[] = [];

    if (Array.isArray(body)) {
      invitations = fromArrayObjects(body);
    } else if (Array.isArray(body.invitations)) {
      invitations = fromArrayObjects(body.invitations);
    } else if (Array.isArray(body.params)) {
      invitations = fromArrayObjects(body.params);
    } else {
      const emails =
        body.email_address || body.email_addresses || body.emailAddresses || body.emailAddress || body.emails || [];
      const emailList = Array.isArray(emails)
        ? emails
        : typeof emails === 'string'
          ? emails
              .split(',')
              .map(e => e.trim())
              .filter(Boolean)
          : [];
      invitations = emailList.map((email: string, idx: number) => ({
        created_at: now,
        email_address: email,
        id: `orginv_${orgId}_${now}_${idx}`,
        organization_id: orgId,
        public_metadata: {},
        role,
        role_name: role,
        status: 'pending',
        updated_at: now,
      }));
    }

    currentInvitations = currentInvitations.concat(invitations);
    return createNoStoreResponse({
      response: invitations,
    });
  }),

  http.post('https://*.clerk.accounts.dev/v1/organizations/:orgId/invitations/:invitationId/revoke', ({ params }) => {
    const orgId = params.orgId as string;
    const invitationId = params.invitationId as string;

    const idx = currentInvitations.findIndex(inv => inv.organization_id === orgId && inv.id === invitationId);

    if (idx === -1) {
      return createNoStoreResponse({ error: 'Invitation not found' }, { status: 404 });
    }

    const now = Date.now();
    currentInvitations[idx] = {
      ...currentInvitations[idx],
      status: 'revoked',
      updated_at: now,
      revoked_at: now,
    };

    return createNoStoreResponse({
      response: currentInvitations[idx],
    });
  }),

  http.post('*/v1/organizations/:orgId/invitations/:invitationId/revoke', ({ params }) => {
    const orgId = params.orgId as string;
    const invitationId = params.invitationId as string;

    const idx = currentInvitations.findIndex(inv => inv.organization_id === orgId && inv.id === invitationId);

    if (idx === -1) {
      return createNoStoreResponse({ error: 'Invitation not found' }, { status: 404 });
    }

    const now = Date.now();
    currentInvitations[idx] = {
      ...currentInvitations[idx],
      status: 'revoked',
      updated_at: now,
      revoked_at: now,
    };

    return createNoStoreResponse({
      response: currentInvitations[idx],
    });
  }),

  http.get('https://*.clerk.accounts.dev/v1/organizations/:orgId/domains', () => {
    return createNoStoreResponse({
      data: [],
      total_count: 0,
    });
  }),

  http.get('*/v1/organizations/:orgId/domains*', () => {
    return createNoStoreResponse({
      data: [],
      total_count: 0,
    });
  }),

  http.get('*/v1/organizations/:orgId/membership_requests*', () => {
    return createNoStoreResponse({
      data: [],
      total_count: 0,
    });
  }),

  http.get('*/v1/organizations/:orgId/roles*', () => {
    return createNoStoreResponse({
      data: [
        {
          id: 'role_admin',
          key: 'org:admin',
          name: 'Admin',
          description: 'Full access to all organization resources',
          permissions: [
            'org:sys_profile:manage',
            'org:sys_profile:delete',
            'org:sys_memberships:read',
            'org:sys_memberships:manage',
            'org:sys_domains:read',
            'org:sys_domains:manage',
          ],
          is_creator_eligible: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'role_member',
          key: 'org:member',
          name: 'Member',
          description: 'Basic member access',
          permissions: ['org:sys_profile:read', 'org:sys_memberships:read'],
          is_creator_eligible: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      total_count: 2,
    });
  }),

  // Update organization
  http.patch('*/v1/organizations/:orgId', async ({ params, request }) => {
    if (!currentOrganization || params.orgId !== currentOrganization.id) {
      return createNoStoreResponse({ error: 'Organization not found' }, { status: 404 });
    }
    const body = parseUrlEncodedBody(await request.text());
    if (body.name) {
      (currentOrganization as any).name = body.name;
    }
    if (body.slug) {
      (currentOrganization as any).slug = body.slug;
    }
    return createNoStoreResponse({
      response: SessionService.serialize(currentOrganization),
    });
  }),

  http.post('*/v1/organizations/:orgId', async ({ params, request }) => {
    const url = new URL(request.url);
    const method = url.searchParams.get('_method');
    const orgId = params.orgId as string;

    if (!currentOrganization || orgId !== currentOrganization.id) {
      return createNoStoreResponse({ error: 'Organization not found' }, { status: 404 });
    }

    if (method === 'PATCH') {
      const body = parseUrlEncodedBody(await request.text());
      if (body.name) {
        (currentOrganization as any).name = body.name;
      }
      if (body.slug) {
        (currentOrganization as any).slug = body.slug;
      }

      if (currentMembership) {
        (currentMembership as any).organization = currentOrganization;
      }
      if (currentUser && (currentUser as any).organizationMemberships?.length > 0) {
        (currentUser as any).organizationMemberships = (currentUser as any).organizationMemberships.map(
          (membership: any) =>
            membership.organization?.id === orgId ? { ...membership, organization: currentOrganization } : membership,
        );
      }

      return createNoStoreResponse({
        response: SessionService.serialize(currentOrganization),
      });
    }

    if (method === 'DELETE') {
      return createNoStoreResponse(
        {
          errors: [
            {
              code: 'organization_delete_mocked',
              message: 'Organization deletion is not available in this preview.',
              long_message: 'Organization deletion is mocked in this preview environment and cannot be performed.',
              meta: { reason: 'mocked_delete' },
            },
          ],
        },
        { status: 422 },
      );
    }

    return createNoStoreResponse({ error: 'Method not allowed' }, { status: 405 });
  }),

  http.post('*/v1/organizations/:orgId/logo', async ({ params, request }) => {
    const url = new URL(request.url);
    const method = url.searchParams.get('_method');
    const orgId = params.orgId as string;

    if (!currentOrganization || orgId !== currentOrganization.id) {
      return createNoStoreResponse({ error: 'Organization not found' }, { status: 404 });
    }

    if (method === 'PUT') {
      (currentOrganization as any).hasImage = true;
      (currentOrganization as any).imageUrl =
        (currentOrganization as any).imageUrl || 'https://img.clerk.com/static/default-organization-logo.png';
      (currentOrganization as any).updatedAt = new Date();
    } else if (method === 'DELETE') {
      (currentOrganization as any).hasImage = false;
      (currentOrganization as any).imageUrl = '';
      (currentOrganization as any).updatedAt = new Date();
    } else {
      return createNoStoreResponse({ error: 'Method not allowed' }, { status: 405 });
    }

    if (currentMembership) {
      (currentMembership as any).organization = currentOrganization;
    }
    if (currentUser && (currentUser as any).organizationMemberships?.length > 0) {
      (currentUser as any).organizationMemberships = (currentUser as any).organizationMemberships.map(
        (membership: any) =>
          membership.organization?.id === orgId ? { ...membership, organization: currentOrganization } : membership,
      );
    }

    return createNoStoreResponse({
      response: SessionService.serialize(currentOrganization),
    });
  }),

  // Billing namespace endpoints
  http.get('*/v1/billing/plans', ({ request }) => {
    const url = new URL(request.url);
    const payerTypeParam = url.searchParams.get('payer_type');
    const payerType =
      payerTypeParam === 'org' || payerTypeParam === 'user'
        ? (payerTypeParam as BillingPlanJSON['for_payer_type'])
        : undefined;
    const { limit, offset } = parsePagination(url.searchParams);
    const plans = payerType ? getBillingPlansForPayerType(payerType) : getBillingPlans();
    return createNoStoreResponse(paginateCollection(plans, limit, offset));
  }),

  http.get('*/v1/billing/plans/:id', ({ params }) => {
    const planId = params.id as string;
    const plan = getBillingPlans().find(item => item.id === planId);

    if (!plan) {
      return createNoStoreResponse({ error: 'Plan not found' }, { status: 404 });
    }

    return createNoStoreResponse(plan);
  }),

  http.get('*/v1/me/billing/subscription', () => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    return createNoStoreResponse({ response: getBillingSubscriptionForPayerType('user') });
  }),

  http.get('*/v1/organizations/:orgId/billing/subscription', () => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    return createNoStoreResponse({ response: getBillingSubscriptionForPayerType('org') });
  }),

  http.get('*/v1/me/billing/statements', ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url.searchParams);
    const subscription = getBillingSubscriptionForPayerType('user');
    const plan = subscription.subscription_items?.[0]?.plan ?? getDefaultBillingPlan('user');
    const response = paginateCollection([BillingService.createStatement(plan)], limit, offset);

    return createNoStoreResponse({ response });
  }),

  http.get('*/v1/organizations/:orgId/billing/statements', ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url.searchParams);
    const subscription = getBillingSubscriptionForPayerType('org');
    const plan = subscription.subscription_items?.[0]?.plan ?? getDefaultBillingPlan('org');
    const response = paginateCollection([BillingService.createStatement(plan)], limit, offset);

    return createNoStoreResponse({ response });
  }),

  http.get('*/v1/me/billing/statements/:id', ({ params }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const subscription = getBillingSubscriptionForPayerType('user');
    const plan = subscription.subscription_items?.[0]?.plan ?? getDefaultBillingPlan('user');
    const statement = BillingService.createStatement(plan, { id: params.id as string });

    return createNoStoreResponse({ response: statement });
  }),

  http.get('*/v1/organizations/:orgId/billing/statements/:id', ({ params }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const subscription = getBillingSubscriptionForPayerType('org');
    const plan = subscription.subscription_items?.[0]?.plan ?? getDefaultBillingPlan('org');
    const statement = BillingService.createStatement(plan, { id: params.id as string });

    return createNoStoreResponse({ response: statement });
  }),

  http.get('*/v1/me/billing/payment_attempts', ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url.searchParams);
    const subscription = getBillingSubscriptionForPayerType('user');
    const plan = subscription.subscription_items?.[0]?.plan ?? getDefaultBillingPlan('user');

    return createNoStoreResponse(paginateCollection([BillingService.createPaymentAttempt(plan)], limit, offset));
  }),

  http.get('*/v1/organizations/:orgId/billing/payment_attempts', ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url.searchParams);
    const subscription = getBillingSubscriptionForPayerType('org');
    const plan = subscription.subscription_items?.[0]?.plan ?? getDefaultBillingPlan('org');

    return createNoStoreResponse(paginateCollection([BillingService.createPaymentAttempt(plan)], limit, offset));
  }),

  http.get('*/v1/me/billing/payment_attempts/:id', ({ params }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const subscription = getBillingSubscriptionForPayerType('user');
    const plan = subscription.subscription_items?.[0]?.plan ?? getDefaultBillingPlan('user');

    return createNoStoreResponse(BillingService.createPaymentAttempt(plan, { id: params.id as string }));
  }),

  http.get('*/v1/organizations/:orgId/billing/payment_attempts/:id', ({ params }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const subscription = getBillingSubscriptionForPayerType('org');
    const plan = subscription.subscription_items?.[0]?.plan ?? getDefaultBillingPlan('org');

    return createNoStoreResponse(BillingService.createPaymentAttempt(plan, { id: params.id as string }));
  }),

  http.get('*/v1/me/billing/payment_methods', ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url.searchParams);
    const paginated = paginateCollection(getDefaultPaymentMethods(), limit, offset);

    return createNoStoreResponse({
      response: paginated,
    });
  }),

  http.get('*/v1/organizations/:orgId/billing/payment_methods', ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url.searchParams);
    const paginated = paginateCollection(getDefaultPaymentMethods(), limit, offset);

    return createNoStoreResponse({
      response: paginated,
    });
  }),

  http.post('*/v1/me/billing/payment_methods/initialize', () => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    return createNoStoreResponse({
      response: BillingService.createInitializedPaymentMethod(),
    });
  }),

  http.post('*/v1/organizations/:orgId/billing/payment_methods/initialize', () => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    return createNoStoreResponse({
      response: BillingService.createInitializedPaymentMethod(),
    });
  }),

  http.post('*/v1/me/billing/payment_methods', async ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    try {
      await request.text();
    } catch {
      // ignore body in mock mode
    }

    return createNoStoreResponse({
      response: BillingService.createPaymentMethod({
        card_type: 'visa',
        last4: '4242',
      }),
    });
  }),

  http.post('*/v1/organizations/:orgId/billing/payment_methods', async ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    try {
      await request.text();
    } catch {
      // ignore body in mock mode
    }

    return createNoStoreResponse({
      response: BillingService.createPaymentMethod({
        card_type: 'visa',
        last4: '4242',
      }),
    });
  }),

  http.post('*/v1/me/billing/checkouts', async ({ request }) => {
    if (!currentSession || !currentUser) {
      return createNoStoreResponse({ error: 'No active session' }, { status: 401 });
    }

    const url = new URL(request.url);
    const body = await parseRequestBodyAsRecord(request);
    const planId = readStringParam(body, ['plan_id', 'planId', 'plan'], url.searchParams);
    const rawPlanPeriod = readStringParam(
      body,
      ['plan_period', 'planPeriod', 'interval', 'billing_interval', 'billingInterval', 'period'],
      url.searchParams,
    );
    const planPeriod = normalizePlanPeriod(rawPlanPeriod);
    const plan = resolveBillingPlan('user', planId);
    const paymentMethod = getPrimaryPaymentMethod();
    const checkout = BillingService.createCheckout(plan, {
      plan_period: planPeriod,
      payer: createBillingPayer(),
      payment_method: paymentMethod,
      needs_payment_method: !paymentMethod,
    });

    return createNoStoreResponse({ response: checkout });
  }),

  http.post('*/v1/organizations/:orgId/billing/checkouts', async ({ params, request }) => {
    if (!currentSession || !currentUser) {
      return createNoStoreResponse({ error: 'No active session' }, { status: 401 });
    }

    const url = new URL(request.url);
    const body = await parseRequestBodyAsRecord(request);
    const planId = readStringParam(body, ['plan_id', 'planId', 'plan'], url.searchParams);
    const rawPlanPeriod = readStringParam(
      body,
      ['plan_period', 'planPeriod', 'interval', 'billing_interval', 'billingInterval', 'period'],
      url.searchParams,
    );
    const planPeriod = normalizePlanPeriod(rawPlanPeriod);
    const plan = resolveBillingPlan('org', planId);
    const paymentMethod = getPrimaryPaymentMethod();
    const checkout = BillingService.createCheckout(plan, {
      plan_period: planPeriod,
      payer: createBillingPayer(params.orgId as string),
      payment_method: paymentMethod,
      needs_payment_method: !paymentMethod,
    });

    return createNoStoreResponse({ response: checkout });
  }),

  http.patch('*/v1/me/billing/checkouts/:checkoutId/confirm', async ({ params, request }) => {
    if (!currentSession || !currentUser) {
      return createNoStoreResponse({ error: 'No active session' }, { status: 401 });
    }

    const url = new URL(request.url);
    const body = await parseRequestBodyAsRecord(request);
    const planId = readStringParam(body, ['plan_id', 'planId', 'plan'], url.searchParams);
    const rawPlanPeriod = readStringParam(
      body,
      ['plan_period', 'planPeriod', 'interval', 'billing_interval', 'billingInterval', 'period'],
      url.searchParams,
    );
    const planPeriod = normalizePlanPeriod(rawPlanPeriod);
    const plan = resolveBillingPlan('user', planId);
    const paymentMethod = getPrimaryPaymentMethod();
    const checkout = BillingService.createCheckout(plan, {
      id: params.checkoutId as string,
      plan_period: planPeriod,
      status: 'completed',
      payer: createBillingPayer(),
      payment_method: paymentMethod,
      needs_payment_method: !paymentMethod,
    });

    setStoredSubscriptionForPayerType(
      'user',
      BillingService.createSubscription(plan, {
        subscription_items: [
          BillingService.createSubscriptionItem(plan, {
            plan_period: planPeriod,
          }),
        ],
      }),
    );

    return createNoStoreResponse({ response: checkout });
  }),

  http.patch('*/v1/organizations/:orgId/billing/checkouts/:checkoutId/confirm', async ({ params, request }) => {
    if (!currentSession || !currentUser) {
      return createNoStoreResponse({ error: 'No active session' }, { status: 401 });
    }

    const url = new URL(request.url);
    const body = await parseRequestBodyAsRecord(request);
    const planId = readStringParam(body, ['plan_id', 'planId', 'plan'], url.searchParams);
    const rawPlanPeriod = readStringParam(
      body,
      ['plan_period', 'planPeriod', 'interval', 'billing_interval', 'billingInterval', 'period'],
      url.searchParams,
    );
    const planPeriod = normalizePlanPeriod(rawPlanPeriod);
    const plan = resolveBillingPlan('org', planId);
    const paymentMethod = getPrimaryPaymentMethod();
    const checkout = BillingService.createCheckout(plan, {
      id: params.checkoutId as string,
      plan_period: planPeriod,
      status: 'completed',
      payer: createBillingPayer(params.orgId as string),
      payment_method: paymentMethod,
      needs_payment_method: !paymentMethod,
    });

    setStoredSubscriptionForPayerType(
      'org',
      BillingService.createSubscription(plan, {
        subscription_items: [
          BillingService.createSubscriptionItem(plan, {
            plan_period: planPeriod,
          }),
        ],
      }),
    );

    return createNoStoreResponse({ response: checkout });
  }),

  // Commerce endpoints - Payment methods
  http.get('https://*.clerk.accounts.dev/v1/me/commerce/payment_methods', () => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const data = getDefaultPaymentMethods();
    const total = data.length;

    return createNoStoreResponse({
      data,
      response: {
        data,
        total_count: total,
      },
      total_count: total,
    });
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/commerce/payment_methods/initialize', () => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    return createNoStoreResponse({
      response: BillingService.createInitializedPaymentMethod(),
    });
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/commerce/payment_methods', () => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    return createNoStoreResponse({
      response: BillingService.createPaymentMethod({
        card_type: 'visa',
        last4: '4242',
      }),
    });
  }),

  http.patch('https://*.clerk.accounts.dev/v1/me/commerce/payment_methods/:id', () => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    return createNoStoreResponse({
      response: {
        success: true,
      },
    });
  }),

  http.delete('https://*.clerk.accounts.dev/v1/me/commerce/payment_methods/:id', ({ params }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    return createNoStoreResponse({
      response: {
        deleted: true,
        id: (params.id as string) ?? 'pm_mock_deleted',
        object: 'commerce_payment_method',
      },
    });
  }),

  http.post('https://*.clerk.accounts.dev/v1/me/commerce/checkouts', async ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const body = await parseRequestBodyAsRecord(request);
    const checkoutId = `chk_mock_${Math.random().toString(36).slice(2, 10)}`;
    const preferredPlanId = readStringParam(body, ['plan_id', 'planId', 'plan'], url.searchParams);
    const rawPeriod = readStringParam(
      body,
      [
        'plan_period',
        'planPeriod',
        'interval',
        'billing_interval',
        'billingInterval',
        'billing_period',
        'billingPeriod',
        'cycle',
        'billing_cycle',
        'billingCycle',
        'period',
      ],
      url.searchParams,
    );
    const planPeriod = normalizePlanPeriod(rawPeriod);
    const plan = resolveBillingPlan('user', preferredPlanId);
    const paymentMethod = getPrimaryPaymentMethod();
    const checkout = BillingService.createCheckout(plan, {
      id: checkoutId,
      plan_period: planPeriod,
      payer: createBillingPayer(),
      payment_method: paymentMethod,
      needs_payment_method: !paymentMethod,
      external_client_secret: `mock_checkout_secret_${checkoutId}`,
      external_gateway_id: 'mock_gateway',
      status: 'needs_confirmation',
    });
    const intervalLabel = planPeriod === 'annual' ? 'year' : 'month';

    return createNoStoreResponse({
      response: {
        ...checkout,
        billing_interval: intervalLabel,
        interval: intervalLabel,
      },
    });
  }),

  http.post(
    'https://*.clerk.accounts.dev/v1/me/commerce/checkouts/:checkoutId/confirm',
    async ({ params, request }) => {
      if (!currentSession || !currentUser) {
        return createUnauthorizedResponse();
      }

      const url = new URL(request.url);
      const body = await parseRequestBodyAsRecord(request);
      const preferredPlanId = readStringParam(body, ['plan_id', 'planId', 'plan'], url.searchParams);
      const rawPeriod = readStringParam(
        body,
        [
          'plan_period',
          'planPeriod',
          'interval',
          'billing_interval',
          'billingInterval',
          'billing_period',
          'billingPeriod',
          'cycle',
          'billing_cycle',
          'billingCycle',
          'period',
        ],
        url.searchParams,
      );
      const planPeriod = normalizePlanPeriod(rawPeriod);
      const plan = resolveBillingPlan('user', preferredPlanId);
      const paymentMethod = getPrimaryPaymentMethod();
      const checkoutId = params.checkoutId as string;
      const checkout = BillingService.createCheckout(plan, {
        id: checkoutId,
        plan_period: planPeriod,
        status: 'completed',
        payer: createBillingPayer(),
        payment_method: paymentMethod,
        needs_payment_method: !paymentMethod,
        external_client_secret: `mock_checkout_secret_${checkoutId}`,
        external_gateway_id: 'mock_gateway',
      });

      setStoredSubscriptionForPayerType(
        'user',
        BillingService.createSubscription(plan, {
          subscription_items: [
            BillingService.createSubscriptionItem(plan, {
              plan_period: planPeriod,
            }),
          ],
        }),
      );

      return createNoStoreResponse({
        response: checkout,
      });
    },
  ),

  // Commerce endpoints - Plans
  http.get('*/v1/commerce/plans', ({ request }) => {
    const url = new URL(request.url);
    const payerTypeParam = url.searchParams.get('payer_type');
    const payerType =
      payerTypeParam === 'org' || payerTypeParam === 'user'
        ? (payerTypeParam as BillingPlanJSON['for_payer_type'])
        : undefined;
    const { limit, offset } = parsePagination(url.searchParams);
    const plans = payerType ? getBillingPlansForPayerType(payerType) : getBillingPlans();
    const paginated = paginateCollection(plans, limit, offset);

    return createNoStoreResponse({
      data: paginated.data,
      response: paginated,
      total_count: paginated.total_count,
    });
  }),

  // Commerce endpoints - User subscription creation (trial/start)
  http.post('*/v1/me/commerce/subscription', async ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    try {
      await request.json();
    } catch {
      // ignore request body, this endpoint only toggles trial state in mocks
    }
    const trialPlan =
      getBillingPlansForPayerType('user').find(plan => plan.free_trial_enabled) ?? getDefaultBillingPlan('user');
    const subscription = BillingService.createFreeTrialSubscription(trialPlan);
    setStoredSubscriptionForPayerType('user', subscription);

    return createNoStoreResponse({ response: subscription });
  }),

  // Commerce endpoints - User subscription (singular)
  http.get('*/v1/me/commerce/subscription', () => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    return createNoStoreResponse({ response: getBillingSubscriptionForPayerType('user') });
  }),

  // Commerce endpoints - User subscriptions (plural)
  http.get('*/v1/me/commerce/subscriptions', () => {
    return createNoStoreResponse({
      data: [getBillingSubscriptionForPayerType('user')],
      total_count: 1,
    });
  }),

  // Commerce endpoints - Statements
  http.get('*/v1/me/commerce/statements', ({ request }) => {
    if (!currentSession || !currentUser) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const { limit, offset } = parsePagination(url.searchParams);
    const subscription = getBillingSubscriptionForPayerType('user');
    const plan = subscription.subscription_items?.[0]?.plan ?? getDefaultBillingPlan('user');
    const statements = paginateCollection([BillingService.createStatement(plan)], limit, offset);

    return createNoStoreResponse(statements);
  }),

  // Image endpoints
  http.get('https://storage.googleapis.com/images.clerk.dev/examples/previews/*', async ({ request }) => {
    const url = new URL(request.url);
    const filename = url.pathname.split('/').pop();

    if (filename === 'cameron-walker.jpg') {
      const response = await fetch('/cameron-walker.jpg');
      const blob = await response.blob();
      return new HttpResponse(blob, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // Telemetry endpoints
  http.post('https://clerk-telemetry.com/v1/event', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('*/clerk-telemetry.com/v1/*', () => {
    return HttpResponse.json({ success: true });
  }),

  // Sign up endpoints
  http.post('*/v1/client/sign_ups', async ({ request }) => {
    let body: any = {};
    try {
      const text = await request.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => {
        body[key] = value;
      });
    } catch (e) {
      // Ignore parse errors
    }

    const email = (body?.email_address as string) || (body?.emailAddress as string) || 'user@example.com';
    const firstName = (body?.first_name as string) || (body?.firstName as string) || null;
    const lastName = (body?.last_name as string) || (body?.lastName as string) || null;

    SignUpService.setEmail(email);
    SignUpService.setFirstName(firstName);
    SignUpService.setLastName(lastName);

    const signUpResponse = SignUpService.createSignUpResponse({
      email,
      firstName,
      lastName,
      status: 'missing_requirements',
      unverifiedFields: ['email_address'],
      verificationAttempts: 0,
      verificationStatus: 'unverified',
    });

    const clientState = SessionService.getClientState(currentSession);
    clientState.response.sign_up = signUpResponse as any;

    return createNoStoreResponse({
      client: clientState.response,
      response: signUpResponse,
    });
  }),

  http.patch('*/v1/client/sign_ups/:signUpId', async ({ request }) => {
    let body: any = {};
    try {
      const text = await request.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => {
        body[key] = value;
      });
    } catch (e) {
      // Ignore
    }

    if (body?.email_address || body?.emailAddress) {
      const email = (body?.email_address as string) || (body?.emailAddress as string);
      SignUpService.setEmail(email);
    }
    if (body?.first_name || body?.firstName) {
      SignUpService.setFirstName((body?.first_name as string) || (body?.firstName as string));
    }
    if (body?.last_name || body?.lastName) {
      SignUpService.setLastName((body?.last_name as string) || (body?.lastName as string));
    }

    const signUpResponse = SignUpService.createSignUpResponse({
      status: 'missing_requirements',
      unverifiedFields: ['email_address'],
      verificationAttempts: 0,
      verificationStatus: 'unverified',
    });

    const clientState = SessionService.getClientState(currentSession);
    clientState.response.sign_up = signUpResponse as any;

    return createNoStoreResponse({
      client: clientState.response,
      response: signUpResponse,
    });
  }),

  http.post('*/v1/client/sign_ups/:signUpId/prepare_verification', () => {
    const signUpResponse = SignUpService.createSignUpResponse({
      status: 'missing_requirements',
      unverifiedFields: ['email_address'],
      verificationAttempts: 1,
      verificationStatus: 'unverified',
    });

    const clientState = SessionService.getClientState(currentSession);
    clientState.response.sign_up = signUpResponse as any;

    return createNoStoreResponse({
      client: clientState.response,
      response: signUpResponse,
    });
  }),

  http.post('*/v1/client/sign_ups/:signUpId/attempt_verification', async ({ request }) => {
    let body: any = {};
    try {
      const text = await request.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => {
        body[key] = value;
      });
    } catch (e) {
      // Ignore
    }

    const code = body?.code;

    // Validate code is provided
    if (!code || code.trim() === '') {
      return HttpResponse.json(
        {
          errors: [
            {
              code: 'form_param_nil',
              long_message: 'Please enter your verification code.',
              message: 'is missing or empty',
              meta: {
                param_name: 'code',
              },
            },
          ],
        },
        {
          status: 422,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          },
        },
      );
    }

    // Create a new user and session using the service
    const { clientState, newSession, newUser, signUpResponse } = SignUpService.createUser(currentSession);

    // Update current session and user
    currentSession = newSession as any;
    currentUser = newUser;

    return createNoStoreResponse({
      client: clientState.response,
      response: signUpResponse,
    });
  }),

  http.get('*/v1/client/sign_ups/:signUpId', () => {
    const currentSignUp = SignUpService.getCurrentSignUp();
    const clientState = SessionService.getClientState(currentSession);
    if (currentSignUp) {
      clientState.response.sign_up = currentSignUp as any;
    }
    return createNoStoreResponse({
      client: clientState.response,
      response: currentSignUp,
    });
  }),

  http.get('*/v1/client/sign_ups', () => {
    const currentSignUp = SignUpService.getCurrentSignUp();
    const clientState = SessionService.getClientState(currentSession);
    if (currentSignUp) {
      clientState.response.sign_up = currentSignUp as any;
    }
    return createNoStoreResponse({
      client: clientState.response,
      response: currentSignUp,
    });
  }),

  // Sign in endpoints
  http.post('*/v1/client/sign_ins', async ({ request }) => {
    let body: any = {};
    try {
      const text = await request.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => {
        body[key] = value;
      });
    } catch (e) {
      // Ignore
    }

    const identifier = (body?.identifier as string) || 'user@example.com';
    SignInService.setIdentifier(identifier);

    const signInResponse = SignInService.createSignInResponse({
      identifier,
      status: 'needs_first_factor',
      verificationAttempts: 0,
      verificationStatus: 'unverified',
    });

    const clientState = SessionService.getClientState(currentSession);
    clientState.response.sign_in = signInResponse as any;

    return createNoStoreResponse({
      client: clientState.response,
      response: signInResponse,
    });
  }),

  http.post('*/v1/client/sign_ins/:signInId/prepare_first_factor', () => {
    const signInResponse = SignInService.createSignInResponse({
      status: 'needs_first_factor',
      verificationAttempts: 0,
      verificationStatus: 'unverified',
    });

    const clientState = SessionService.getClientState(currentSession);
    clientState.response.sign_in = signInResponse as any;

    return createNoStoreResponse({
      client: clientState.response,
      response: signInResponse,
    });
  }),

  http.post('*/v1/client/sign_ins/:signInId/attempt_first_factor', async ({ request }) => {
    let body: any = {};
    try {
      const text = await request.text();
      const params = new URLSearchParams(text);
      params.forEach((value, key) => {
        body[key] = value;
      });
    } catch (e) {
      // Ignore
    }

    const password = body?.password;

    // Validate password is provided
    if (!password || password.trim() === '') {
      return HttpResponse.json(
        {
          errors: [
            {
              code: 'form_password_incorrect',
              long_message: 'Password is incorrect. Try again, or use another method.',
              message: 'is incorrect',
              meta: {
                param_name: 'password',
              },
            },
          ],
        },
        {
          status: 422,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          },
        },
      );
    }

    // Create a new user and session using the service
    const { clientState, newSession, newUser, signInResponse } = SignInService.createUser(currentSession);

    // Update current session and user
    currentSession = newSession as any;
    currentUser = newUser;

    return createNoStoreResponse({
      client: clientState.response,
      response: signInResponse,
    });
  }),

  http.get('*/v1/client/sign_ins*', () => {
    const currentSignIn = SignInService.getCurrentSignIn();
    const clientState = SessionService.getClientState(currentSession);
    if (currentSignIn) {
      clientState.response.sign_in = currentSignIn as any;
    }
    return createNoStoreResponse({
      client: clientState.response,
      response: currentSignIn,
    });
  }),

  // Catch-all endpoints
  http.post('*/__clerk/client*', () => {
    return HttpResponse.json({ client: {}, response: {} });
  }),

  http.all('*/clerk.accounts.dev/*', () => {
    return HttpResponse.json({ response: {} });
  }),

  http.all('https://*.clerk.com/v1/*', () => {
    return HttpResponse.json({ response: {} });
  }),
];
