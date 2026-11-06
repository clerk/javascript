import type { AccessConnection, AccessPolicy, ConnectionConfiguration } from './access.types';

export function newPolicy(): AccessPolicy {
  return {
    id: '',
    status: 'draft',
    domains: [],
    authentication: 'default',
    ssoConnectionIds: [],
    enrollment: 'invitation',
    directoryConnectionId: null,
    reverification: '24',
    mfaEnabled: false,
    mfa: 'optional',
  };
}
export function newConnection(): ConnectionConfiguration {
  return {
    name: '',
    provider: 'okta',
    mode: 'metadata',
    metadataUrl: '',
    metadataFile: null,
    signOnUrl: '',
    issuer: '',
    certificate: '',
    clientId: '',
    clientSecret: '',
    tokenUrl: '',
    userInfoUrl: '',
    ssoConnectionId: '',
    defaultRole: 'member',
    groupRoles: {},
    serviceAccountFile: null,
    subjectEmail: '',
    syncGroups: false,
  };
}
export function canActivatePolicy(policy: AccessPolicy, connections: AccessConnection[]) {
  return (
    policy.domains.length > 0 &&
    (policy.authentication === 'default' ||
      (policy.domains.every(domain => domain.verified) &&
        policy.ssoConnectionIds.length > 0 &&
        policy.ssoConnectionIds.every(id => connections.some(c => c.id === id && c.kind === 'sso')))) &&
    (policy.enrollment !== 'directory' ||
      connections.some(c => c.id === policy.directoryConnectionId && c.kind === 'directory'))
  );
}
export function attachConnection(policy: AccessPolicy, connection: AccessConnection): AccessPolicy {
  return connection.kind === 'sso'
    ? { ...policy, ssoConnectionIds: [...new Set([...policy.ssoConnectionIds, connection.id])] }
    : { ...policy, directoryConnectionId: connection.id };
}
export function isDomain(value: string) {
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value);
}
export function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
export function isConnectionConfigured(values: ConnectionConfiguration) {
  if (!values.name.trim()) {
    return false;
  }
  if (values.provider === 'oidc') {
    return (
      Boolean(values.clientId.trim() && values.clientSecret.trim()) &&
      (values.mode === 'metadata'
        ? isHttpsUrl(values.metadataUrl)
        : [values.signOnUrl, values.tokenUrl, values.userInfoUrl].every(isHttpsUrl))
    );
  }
  if (values.mode === 'file') {
    return values.metadataFile !== null;
  }
  return values.mode === 'metadata'
    ? isHttpsUrl(values.metadataUrl)
    : isHttpsUrl(values.signOnUrl) && Boolean(values.issuer.trim() && values.certificate.trim());
}

export function isDirectoryConfigured(values: ConnectionConfiguration) {
  return (
    Boolean(values.name.trim() && values.ssoConnectionId) &&
    (values.provider !== 'google' ||
      Boolean(values.serviceAccountFile && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.subjectEmail)))
  );
}
