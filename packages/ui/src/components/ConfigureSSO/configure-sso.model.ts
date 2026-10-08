import { useSession } from '@clerk/shared/react';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import { useProtect } from '@/common';

import type { ConfigureSSOModel, SSOConnection } from './configure-sso.types';
import {
  useOrganizationEnterpriseConnection,
  type UseOrganizationEnterpriseConnectionResult,
} from './hooks/useOrganizationEnterpriseConnection';

export const useConfigureSSOContentModel = () => toConfigureSSOModel(useOrganizationEnterpriseConnection());

const copyDate = (value: Date | null) => (value ? new Date(value.getTime()) : null);

const toConnection = (connection: EnterpriseConnectionResource): SSOConnection => {
  const oauth = connection.oauthConfig;
  const saml = connection.samlConnection;
  return {
    id: connection.id,
    name: connection.name,
    active: connection.active,
    provider: connection.provider,
    logoPublicUrl: connection.logoPublicUrl,
    domains: [...(connection.domains ?? [])],
    syncUserAttributes: connection.syncUserAttributes,
    disableAdditionalIdentifications: connection.disableAdditionalIdentifications,
    oauthConfig: oauth
      ? {
          clientId: oauth.clientId,
          redirectUri: oauth.redirectUri,
          discoveryUrl: oauth.discoveryUrl,
          authUrl: oauth.authUrl,
          tokenUrl: oauth.tokenUrl,
          userInfoUrl: oauth.userInfoUrl,
          requiresPkce: oauth.requiresPkce,
        }
      : null,
    samlConnection: saml
      ? {
          idpEntityId: saml.idpEntityId,
          idpSsoUrl: saml.idpSsoUrl,
          idpCertificate: saml.idpCertificate,
          idpCertificateIssuedAt: saml.idpCertificateIssuedAt,
          idpCertificateExpiresAt: saml.idpCertificateExpiresAt,
          idpCertificates: (saml.idpCertificates ?? []).map(certificate => ({
            certificate: certificate.certificate,
            issuedAt: certificate.issuedAt,
            expiresAt: certificate.expiresAt,
          })),
          idpMetadataUrl: saml.idpMetadataUrl,
          idpMetadata: saml.idpMetadata,
          acsUrl: saml.acsUrl,
          spEntityId: saml.spEntityId,
          spMetadataUrl: saml.spMetadataUrl,
          allowSubdomains: saml.allowSubdomains,
          allowIdpInitiated: saml.allowIdpInitiated,
          forceAuthn: saml.forceAuthn,
        }
      : null,
  };
};

export const toConfigureSSOModel = (source: UseOrganizationEnterpriseConnectionResult): ConfigureSSOModel => {
  const connections = source.enterpriseConnections.map(toConnection);
  const mutations = source.enterpriseConnectionMutations;
  const domains = source.organizationDomainMutations;
  const resolveDomain = (id: string) => {
    const domain = source.organizationDomains?.find(domain => domain.id === id);
    if (!domain) {
      throw new Error('Organization domain not found');
    }
    return domain;
  };
  return {
    ownerKey: source.ownerKey,
    canRun: source.canRun,
    isLoading: source.isLoading,
    organizationName: source.organization?.name ?? '',
    enterpriseConnections: connections,
    connectionScope: source.connectionScope,
    selectConnection: source.selectConnection,
    enterpriseConnection: source.enterpriseConnection ? toConnection(source.enterpriseConnection) : undefined,
    connectionDomains: [...source.connectionDomains],
    setConnectionDomains: source.setConnectionDomains,
    claimedDomains: new Map(source.claimedDomains),
    organizationEnterpriseConnection: { ...source.organizationEnterpriseConnection },
    enterpriseConnectionMutations: {
      createConnection: async provider => {
        await mutations.createConnection(provider);
      },
      changeProvider: async (id, provider) => {
        await mutations.changeProvider(id, provider);
      },
      updateConnection: async (id, params) => {
        await mutations.updateConnection(id, params);
      },
      setConnectionActive: async (id, active) => {
        await mutations.setConnectionActive(id, active);
      },
      deleteConnection: async id => {
        await mutations.deleteConnection(id);
      },
      createTestRun: async id => {
        const result = await mutations.createTestRun(id);
        return result ? { url: result.url } : undefined;
      },
    },
    organizationDomains: source.organizationDomains?.map(domain => {
      const verification = domain.ownershipVerification;
      return {
        id: domain.id,
        name: domain.name,
        ownershipVerification: verification
          ? {
              status: verification.status,
              expiresAt: copyDate(verification.expiresAt),
              verifiedAt: copyDate(verification.verifiedAt),
              txtRecordName: verification.txtRecordName,
              txtRecordValue: verification.txtRecordValue,
            }
          : null,
      };
    }),
    organizationDomainMutations: {
      createDomain: async name => {
        await domains.createDomain(name);
      },
      prepareOwnershipVerification: async ids => {
        if (!source.canRun()) {
          return;
        }
        await domains.prepareOwnershipVerification(ids.map(resolveDomain));
      },
      removeDomain: async id => {
        if (!source.canRun()) {
          return;
        }
        try {
          await resolveDomain(id).delete();
          if (source.canRun()) {
            await domains.revalidate();
          }
        } catch (error) {
          if (source.canRun()) {
            throw error;
          }
        }
      },
    },
    testRuns: {
      rows: source.testRuns.rows.map(row => ({
        id: row.id,
        status: row.status,
        createdAt: copyDate(row.createdAt),
        logs: (row.logs ?? []).map(log => ({ shortMessage: log.shortMessage, code: log.code, message: log.message })),
        parsedUserInfo: row.parsedUserInfo
          ? { emailAddress: row.parsedUserInfo.emailAddress, firstName: row.parsedUserInfo.firstName }
          : undefined,
      })),
      totalCount: source.testRuns.totalCount,
      isLoading: source.testRuns.isLoading,
      isFetching: source.testRuns.isFetching,
      isPolling: source.testRuns.isPolling,
      page: source.testRuns.page,
      setPage: source.testRuns.setPage,
      refresh: async options => {
        await source.testRuns.refresh(options);
      },
      revalidateHasSuccessfulTestRun: source.testRuns.revalidateHasSuccessfulTestRun,
    },
  };
};

export const useConfigureSSOProtectModel = () => {
  const { session } = useSession();
  const isPersonalWorkspace = !session?.lastActiveOrganizationId;
  const canManageEnterpriseConnections = useProtect(
    has => isPersonalWorkspace || has({ permission: 'org:sys_entconns:manage' }),
  );
  return { canManageEnterpriseConnections };
};
