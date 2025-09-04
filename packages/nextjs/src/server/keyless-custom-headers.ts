'use server';

import { headers } from 'next/headers';

interface MetadataHeaders {
  nodeVersion?: string;
  nextVersion?: string;
  npmConfigUserAgent?: string;
  userAgent: string;
  port?: string;
  host: string;
  xHost: string;
  xPort: string;
  xProtocol: string;
  xClerkAuthStatus: string;
}

/**
 * Collects metadata from the environment and request headers
 */
export async function collectKeylessMetadata(): Promise<MetadataHeaders> {
  const headerStore = await headers(); // eslint-disable-line

  return {
    nodeVersion: process.version,
    nextVersion: getNextVersion(),
    npmConfigUserAgent: process.env.npm_config_user_agent, // eslint-disable-line
    userAgent: headerStore.get('User-Agent') ?? 'unknown user-agent',
    port: process.env.PORT, // eslint-disable-line
    host: headerStore.get('host') ?? 'unknown host',
    xPort: headerStore.get('x-forwarded-port') ?? 'unknown x-forwarded-port',
    xHost: headerStore.get('x-forwarded-host') ?? 'unknown x-forwarded-host',
    xProtocol: headerStore.get('x-forwarded-proto') ?? 'unknown x-forwarded-proto',
    xClerkAuthStatus: headerStore.get('x-clerk-auth-status') ?? 'unknown x-clerk-auth-status',
  };
}

/**
 * Extracts Next.js version from process title
 */
function getNextVersion(): string | undefined {
  try {
    return process.title ?? 'unknown-process-title'; // 'next-server (v15.4.5)'
  } catch {
    return undefined;
  }
}

/**
 * Converts metadata to HTTP headers
 */
export function formatMetadataHeaders(metadata: MetadataHeaders): Headers {
  const headers = new Headers();

  if (metadata.nodeVersion) {
    headers.set('Clerk-Node-Version', metadata.nodeVersion);
  }

  if (metadata.nextVersion) {
    headers.set('Clerk-Next-Version', metadata.nextVersion);
  }

  if (metadata.npmConfigUserAgent) {
    headers.set('Clerk-NPM-Config-User-Agent', metadata.npmConfigUserAgent);
  }

  if (metadata.userAgent) {
    headers.set('Clerk-Client-User-Agent', metadata.userAgent);
  }

  if (metadata.port) {
    headers.set('Clerk-Node-Port', metadata.port);
  }

  if (metadata.host) {
    headers.set('Clerk-Client-Host', metadata.host);
  }

  if (metadata.xPort) {
    headers.set('Clerk-X-Port', metadata.xPort);
  }

  if (metadata.xHost) {
    headers.set('Clerk-X-Host', metadata.xHost);
  }

  if (metadata.xProtocol) {
    headers.set('Clerk-X-Protocol', metadata.xProtocol);
  }

  if (metadata.xClerkAuthStatus) {
    headers.set('Clerk-Auth-Status', metadata.xClerkAuthStatus);
  }

  return headers;
}
