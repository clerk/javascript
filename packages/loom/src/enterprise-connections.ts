import { isRecord } from './hydration';
import type { EnterpriseConnection } from './types';

export function parseEnterpriseConnections(value: unknown): readonly EnterpriseConnection[] {
  const entries: unknown = isRecord(value) ? value.response : value;
  if (!Array.isArray(entries)) {
    throw new Error('Invalid Loom enterprise connections.');
  }
  const connections = entries.map((entry: unknown) => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== 'string' ||
      !entry.id ||
      typeof entry.name !== 'string' ||
      !entry.name ||
      typeof entry.allow_organization_account_linking !== 'boolean' ||
      (entry.logo_public_url != null && typeof entry.logo_public_url !== 'string')
    ) {
      throw new Error('Invalid Loom enterprise connection.');
    }
    const logoPublicUrl = typeof entry.logo_public_url === 'string' ? entry.logo_public_url : null;
    if (logoPublicUrl) {
      const url = new URL(logoPublicUrl);
      if (url.protocol !== 'https:' || url.username || url.password) {
        throw new Error('Invalid Loom enterprise logo.');
      }
    }
    return {
      id: entry.id,
      name: entry.name,
      allowOrganizationAccountLinking: entry.allow_organization_account_linking,
      logoPublicUrl,
    };
  });
  if (new Set(connections.map(connection => connection.id)).size !== connections.length) {
    throw new Error('Duplicate Loom enterprise connection.');
  }
  return connections;
}
