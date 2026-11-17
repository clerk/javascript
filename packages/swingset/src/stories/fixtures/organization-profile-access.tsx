import { useAccessController } from '@clerk/mosaic/features/organization-profile/organization-profile-access-panel/access.controller';
import type { AccessData } from '@clerk/mosaic/features/organization-profile/organization-profile-access-panel/access.types';
import {
  AccessBackAction,
  AccessFooter,
  OrganizationProfileAccessPanelView,
} from '@clerk/mosaic/features/organization-profile/organization-profile-access-panel/access.view';
import { SaveError } from '@clerk/mosaic/utils/errors';
import { useState } from 'react';

import {
  accessServiceProvider,
  directoryRolesResponse,
  directoryUsersResponse,
  initialConnectionResponses,
  initialDirectoryRoles,
  initialPolicyPreview,
  initialPolicyResponse,
  ownershipResponse,
  readConnections,
  rotateDirectoryResponse,
  saveConnectionResponse,
  savePolicyResponse,
  testRunResponse,
  toAccessPolicy,
  upsertResponse,
} from './organization-profile-access-data';

const settle = () => new Promise<void>(resolve => setTimeout(resolve, 500));
export function useOrganizationProfileAccessFixture({
  empty = false,
  failSave = false,
  failTest = false,
  failVerification = false,
} = {}) {
  const [policyResponse, setPolicyResponse] = useState(() =>
    empty
      ? { data: initialPolicyResponse.data.filter(policy => policy.default), total_count: 1 }
      : initialPolicyResponse,
  );
  const [policyPreview, setPolicyPreview] = useState(initialPolicyPreview);
  const [connectionResponses, setConnectionResponses] = useState(() =>
    empty ? { enterpriseConnections: [], directories: [] } : initialConnectionResponses,
  );
  const [directoryRoles, setDirectoryRoles] = useState(initialDirectoryRoles);
  const connections = readConnections(connectionResponses, directoryRoles);
  const defaultPolicy = policyResponse.data.find(policy => policy.default);
  const data: AccessData = {
    policies: policyResponse.data
      .filter(policy => !policy.default)
      .map(policy => toAccessPolicy(policy, policyPreview[policy.id])),
    defaultPolicy: defaultPolicy && toAccessPolicy(defaultPolicy),
    connections,
    serviceProvider: accessServiceProvider,
    onSavePolicy: async policy => {
      await settle();
      if (failSave) {
        throw new SaveError({ global: { code: 'fixture_error', message: 'The policy could not be saved.' } });
      }
      const saved = { ...policy, id: policy.id || crypto.randomUUID() };
      setPolicyResponse(current => {
        const response = savePolicyResponse(
          saved,
          connections,
          current.data.find(item => item.id === saved.id),
        );
        const data = upsertResponse(current.data, response);
        return { data, total_count: data.length };
      });
      setPolicyPreview(current => ({
        ...current,
        [saved.id]: {
          ...(saved.status === 'inactive' || (saved.authentication === 'default' && saved.status === 'draft')
            ? { status: saved.status }
            : {}),
          mfa: saved.mfa,
          mfaEnabled: saved.mfaEnabled,
          reverification: saved.reverification,
          ...(saved.authentication !== 'sso' && saved.enrollment === 'directory'
            ? { enrollment: saved.enrollment, directoryConnectionId: saved.directoryConnectionId }
            : {}),
          ...(saved.authentication === 'sso' && saved.enrollment !== 'directory' && saved.enrollment !== 'automatic'
            ? { enrollment: saved.enrollment }
            : {}),
        },
      }));
    },
    onSaveConnection: async (kind, configuration, id) => {
      await settle();
      if (failSave) {
        throw new SaveError({ global: { code: 'fixture_error', message: 'The connection could not be saved.' } });
      }
      const connectionId = id ?? crypto.randomUUID();
      const next = saveConnectionResponse(connectionResponses, kind, configuration, connectionId);
      setConnectionResponses(current => saveConnectionResponse(current, kind, configuration, connectionId));
      const roles = directoryRolesResponse(connectionId, configuration);
      if (kind === 'directory') {
        setDirectoryRoles(current => ({ ...current, [connectionId]: roles }));
      }
      const saved = readConnections(next, { ...directoryRoles, [connectionId]: roles }).find(
        item => item.id === connectionId,
      );
      if (!saved) {
        throw new Error('Connection response missing after save');
      }
      return saved;
    },
    onTestConnection: async (kind, values) => {
      await settle();
      if (kind === 'directory') {
        const user = directoryUsersResponse(failTest).data[0];
        return {
          success: Boolean(user),
          email: user?.identifier,
          firstName: user?.first_name,
          lastName: user?.last_name,
          groups: user ? ['Engineering'] : [],
        };
      }
      const run = testRunResponse(failTest, values.provider);
      return {
        id: run.id,
        createdAt: run.created_at,
        success: run.status === 'success',
        email: run.parsed_user_info?.email_address,
        firstName: run.parsed_user_info?.first_name,
        lastName: run.parsed_user_info?.last_name,
      };
    },
    onRotateDirectoryToken: async id => {
      await settle();
      return rotateDirectoryResponse(connectionResponses, id).api_key ?? '';
    },
    onVerifyDomain: async name => {
      await settle();
      return ownershipResponse(name, !failVerification).ownership_verified;
    },
  };
  const controller = useAccessController(data);
  const contentTitle = controller.pageTitle;
  const hasSubpage = controller.pageStep !== 'list';
  return {
    page: (
      <OrganizationProfileAccessPanelView
        controller={controller}
        title={contentTitle}
      />
    ),
    layout: {
      contentTitle,
      contentBackAction: hasSubpage ? <AccessBackAction controller={controller} /> : undefined,
      contentFooter: hasSubpage ? <AccessFooter controller={controller} /> : undefined,
    },
  };
}
