import { ClerkRuntimeError } from '@clerk/shared/error';
import {
  __experimental_useOrganizationAccessPolicies as useOrganizationAccessPolicies,
  __experimental_useOrganizationAccessPolicy as useOrganizationAccessPolicy,
  __internal_organizationAccessPolicyCacheKeys,
  getClerkQueryClient,
  useOrganization,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type {
  CreateOrganizationAccessPolicyParams,
  OrganizationAccessPolicyResource,
  OrganizationResource,
  UpdateOrganizationAccessPolicyParams,
} from '@clerk/shared/types';

import { save } from '../../../utils/errors';
import { ORGANIZATION_PERMISSIONS } from '../../../utils/permissions';
import type { AccessData, AccessPolicy } from './access.types';
import { newPolicy } from './access.utils';
import { useAccessConnectionsModel } from './access-connections.model';

function useAccessPermissions() {
  const { session } = useSession();
  return {
    canRead: session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.domainsRead }) ?? false,
    canManageDomains: session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.domainsManage }) ?? false,
    canManageSso:
      session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.enterpriseConnectionsManage }) ?? false,
  };
}

export function useAccessPanelAvailability(organization: OrganizationResource | null | undefined) {
  const { canRead } = useAccessPermissions();
  const policies = useOrganizationAccessPolicies({ enabled: canRead, infinite: true });
  return (
    canRead &&
    typeof organization?.getAccessPolicies === 'function' &&
    !policies.isLoading &&
    !isAccessDisabled(policies.error)
  );
}

function isAccessDisabled(error: { errors: { code: string }[] } | null) {
  return error?.errors?.some(item => item.code === 'access_policies_not_enabled') ?? false;
}

function toPolicyData({
  id,
  isDefault,
  domains,
  enrollmentMode,
  status,
  authentication,
}: OrganizationAccessPolicyResource) {
  return { id, isDefault, domains, enrollmentMode, status, authentication };
}

export function useAccessModel({ policyId, enabled = true }: { policyId?: string | null; enabled?: boolean } = {}) {
  const { isLoaded, organization } = useOrganization();
  const { user } = useUser();
  const { canRead, canManageDomains, canManageSso } = useAccessPermissions();
  const canQuery = enabled && canRead;
  const policies = useOrganizationAccessPolicies({ enabled: canQuery, infinite: true });
  const policy = useOrganizationAccessPolicy({ policyId, enabled: canQuery });

  if (!isLoaded || user === undefined) {
    return { status: 'loading' as const };
  }
  if (
    !canQuery ||
    !user ||
    !organization ||
    typeof organization.getAccessPolicies !== 'function' ||
    isAccessDisabled(policies.error)
  ) {
    return { status: 'hidden' as const };
  }
  if (policies.isLoading) {
    return { status: 'loading' as const };
  }
  if (policies.error && policies.data.length === 0) {
    return { status: 'error' as const, error: policies.error, retry: policies.revalidate };
  }

  const { id: userId } = user;
  const selectedPolicy = policy.data;
  const canReadDetail = typeof organization.getAccessPolicy === 'function';
  const defaultPolicy = policies.data.find(item => item.isDefault);
  return {
    status: 'ready' as const,
    canManageDomains,
    canReadDetail,
    selectedPolicy: selectedPolicy && toPolicyData(selectedPolicy),
    canManageSso: canManageSso && organization.selfServeSSOEnabled,
    policies: policies.data.filter(item => !item.isDefault).map(toPolicyData),
    defaultPolicy: defaultPolicy && toPolicyData(defaultPolicy),
    hasMorePolicies: policies.hasNextPage,
    loadMorePolicies: policies.fetchNext,
    isLoadingMorePolicies: policies.isFetching,
    retryPolicies: policies.revalidate,
    policyListError: policies.error,
    ...getPolicyActions({
      organization,
      userId,
      selectedPolicy,
      policyId,
      canManageDomains,
      revalidate: policies.revalidate,
    }),
  };
}

function getPolicyActions({
  organization,
  userId,
  selectedPolicy,
  policyId,
  canManageDomains,
  revalidate,
}: {
  organization: OrganizationResource;
  userId: string;
  selectedPolicy: OrganizationAccessPolicyResource | undefined;
  policyId?: string | null;
  canManageDomains: boolean;
  revalidate: () => Promise<void>;
}) {
  const organizationId = organization.id;
  const refreshPolicies = async (scope: 'list' | 'detail' | 'all') => {
    const detailKeys = __internal_organizationAccessPolicyCacheKeys(organizationId, userId, policyId ?? undefined);
    const client = getClerkQueryClient();
    await Promise.allSettled([
      revalidate(),
      scope === 'list'
        ? undefined
        : client?.invalidateQueries({
            queryKey: scope === 'all' ? detailKeys.invalidationKey : detailKeys.queryKey,
            exact: scope === 'detail',
          }),
    ]);
  };

  const writePolicy = async (action: () => Promise<OrganizationAccessPolicyResource>, scope: 'list' | 'detail') => {
    try {
      const updated = await action();
      const { queryKey } = __internal_organizationAccessPolicyCacheKeys(organizationId, userId, updated.id);
      getClerkQueryClient()?.setQueryData<OrganizationAccessPolicyResource>(queryKey, current =>
        current ? updated : undefined,
      );
      return toPolicyData(updated);
    } finally {
      await refreshPolicies(scope);
    }
  };

  return {
    loadPolicy:
      typeof organization.getAccessPolicy === 'function'
        ? async (id: string) => {
            const { queryKey } = __internal_organizationAccessPolicyCacheKeys(organizationId, userId, id);
            const queryFn = () => organization.getAccessPolicy({ policyId: id });
            const client = getClerkQueryClient();
            return toPolicyData(await (client ? client.query({ queryKey, queryFn }) : queryFn()));
          }
        : undefined,
    createPolicy:
      typeof organization.createAccessPolicy === 'function'
        ? (params: CreateOrganizationAccessPolicyParams) =>
            save(() => writePolicy(() => organization.createAccessPolicy(params), 'list'))
        : undefined,
    updatePolicy: selectedPolicy
      ? (params: UpdateOrganizationAccessPolicyParams) =>
          save(() => writePolicy(() => selectedPolicy.update(params), 'detail'))
      : undefined,
    prepareAffiliationVerification: selectedPolicy
      ? (params: { domain: string; affiliationEmailAddress: string }) =>
          writePolicy(() => selectedPolicy.prepareAffiliationVerification(params), 'detail')
      : undefined,
    attemptAffiliationVerification: selectedPolicy
      ? (params: { domain: string; code: string }) =>
          writePolicy(() => selectedPolicy.attemptAffiliationVerification(params), 'detail')
      : undefined,
    ...getOwnershipActions(organization, canManageDomains, () => refreshPolicies('all')),
  };
}

function getOwnershipActions(
  organization: OrganizationResource,
  canManageDomains: boolean,
  revalidate: () => Promise<void>,
) {
  const canVerify = canManageDomains && organization.selfServeSSOEnabled;
  return {
    prepareOwnershipVerification:
      canVerify && typeof organization.prepareAccessPolicyOwnershipVerification === 'function'
        ? async (domains: string[]) => (await organization.prepareAccessPolicyOwnershipVerification({ domains })).data
        : undefined,
    attemptOwnershipVerification:
      canVerify && typeof organization.attemptAccessPolicyOwnershipVerification === 'function'
        ? async (domains: string[]) => {
            try {
              return (await organization.attemptAccessPolicyOwnershipVerification({ domains })).data;
            } finally {
              await revalidate();
            }
          }
        : undefined,
  };
}

const enrollmentModes = {
  invitation_only: 'invitation',
  invite_automatically: 'automatic',
  join_automatically: 'automatic',
  request_access: 'request',
  blocked: 'blocked',
} as const;

const writableEnrollmentModes = {
  invitation: 'invitation_only',
  automatic: 'invite_automatically',
  request: 'request_access',
} as const;

function toEditorPolicy(
  policy: ReturnType<typeof toPolicyData>,
  canManageDomains: boolean,
  canManageSso: boolean,
): AccessPolicy {
  const { authentication } = policy;
  const isSso = policy.enrollmentMode === 'sso';
  const canEdit = isSso
    ? canManageSso
    : canManageDomains && policy.enrollmentMode !== 'blocked' && policy.enrollmentMode !== 'join_automatically';

  return {
    ...newPolicy(),
    id: policy.id,
    status: policy.status ?? 'active',
    domains: policy.domains.map(domain => ({
      name: domain.name,
      verified: domain.ownershipVerified,
      affiliationVerified: domain.affiliationVerified,
    })),
    authentication: isSso ? 'sso' : 'default',
    enrollment:
      policy.enrollmentMode === 'sso'
        ? authentication?.provisioning === 'directory'
          ? 'directory'
          : 'automatic'
        : enrollmentModes[policy.enrollmentMode],
    ssoConnectionIds: authentication?.connections.map(connection => connection.id) ?? [],
    directoryConnectionId: authentication?.directories[0]?.id ?? null,
    connectionNames: Object.fromEntries(
      [...(authentication?.connections ?? []), ...(authentication?.directories ?? [])].map(connection => [
        connection.id,
        connection.name,
      ]),
    ),
    canEdit,
  };
}

export function useAccessPanelModel(
  policyId: string | null,
  onSelectPolicy: (id: string | null) => void,
  directoryParentId: string | null,
  onManageDirectory: (id: string | null) => void,
) {
  const model = useAccessModel({ policyId });
  const connections = useAccessConnectionsModel(model.status === 'ready', directoryParentId, onManageDirectory);
  if (model.status !== 'ready') {
    return model;
  }

  const { canManageDomains, canManageSso, loadPolicy, prepareOwnershipVerification, attemptOwnershipVerification } =
    model;
  const data: AccessData = {
    live: true,
    canEditPolicyAuthentication: canManageSso && canManageDomains,
    policies: model.policies.map(policy =>
      toEditorPolicy(policy, model.canReadDetail && canManageDomains, model.canReadDetail && canManageSso),
    ),
    defaultPolicy: model.defaultPolicy && toEditorPolicy(model.defaultPolicy, canManageDomains, canManageSso),
    ...connections,
    canCreatePolicy: (canManageDomains || canManageSso) && Boolean(model.createPolicy),
    newPolicyAuthentication: canManageDomains ? 'default' : 'sso',
    onSelectPolicy,
    loadPolicy: loadPolicy && (async id => toEditorPolicy(await loadPolicy(id), canManageDomains, canManageSso)),
    policyListError: Boolean(model.policyListError),
    retryPolicies: model.retryPolicies,
    loadMorePolicies: model.hasMorePolicies ? model.loadMorePolicies : undefined,
    isLoadingMorePolicies: model.isLoadingMorePolicies,
    onSavePolicy: values => saveEditorPolicy(values, model),
    onPrepareDomain:
      prepareOwnershipVerification &&
      (async domain => {
        const result = (await prepareOwnershipVerification([domain])).find(item => item.domain === domain);
        if (result?.ownershipVerified) {
          return null;
        }
        if (!result?.txtRecordName || !result.txtRecordValue) {
          throw new ClerkRuntimeError('The ownership challenge has no DNS record.', {
            code: 'access_policy_dns_record_unavailable',
          });
        }
        return { name: result.txtRecordName, value: result.txtRecordValue };
      }),
    onVerifyDomain:
      attemptOwnershipVerification &&
      (async domain =>
        (await attemptOwnershipVerification([domain])).some(item => item.domain === domain && item.ownershipVerified)),
  };
  return { status: model.status, data };
}

async function saveEditorPolicy(
  values: AccessPolicy,
  model: Extract<ReturnType<typeof useAccessModel>, { status: 'ready' }>,
) {
  const previous = model.selectedPolicy;
  const write = values.id ? model.updatePolicy : model.createPolicy;
  const params = editorPolicyParams(values, model.canManageDomains, model.canManageSso, previous?.authentication);
  if (!write || !params || (values.id && previous?.id !== values.id)) {
    throw new ClerkRuntimeError('This access policy cannot be saved.', { code: 'access_policy_save_unavailable' });
  }
  await write(params);
}

export function editorPolicyParams(
  values: AccessPolicy,
  canManageDomains: boolean,
  canManageSso: boolean,
  previous?: OrganizationAccessPolicyResource['authentication'],
): CreateOrganizationAccessPolicyParams | undefined {
  const domains = values.domains.map(domain => domain.name);
  if (values.authentication === 'sso') {
    if (!canManageSso) {
      return undefined;
    }
    const provisioning = values.enrollment === 'directory' ? 'directory' : 'jit';
    return {
      domains,
      enrollmentMode: 'sso',
      status: values.status === 'active' ? 'active' : 'draft',
      authentication: {
        connectionIds: values.ssoConnectionIds,
        directoryIds: getPolicyDirectoryIds(values, previous),
        provisioning,
      },
    };
  }
  if (canManageDomains && values.enrollment !== 'directory' && values.enrollment !== 'blocked') {
    return { domains, enrollmentMode: writableEnrollmentModes[values.enrollment] };
  }
  return undefined;
}

function getPolicyDirectoryIds(policy: AccessPolicy, previous?: OrganizationAccessPolicyResource['authentication']) {
  if (policy.enrollment !== 'directory') {
    return previous?.provisioning === 'jit' ? undefined : [];
  }
  const [first, ...others] = previous?.directories ?? [];
  const selected = policy.directoryConnectionId;
  if (previous?.provisioning === 'directory' && selected === (first?.id ?? null)) {
    return undefined;
  }
  return selected ? [...new Set([selected, ...others.map(directory => directory.id)])] : [];
}
