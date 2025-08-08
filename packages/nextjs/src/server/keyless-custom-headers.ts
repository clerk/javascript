import { headers } from 'next/headers';

interface MetadataHeaders {
  nodeVersion?: string;
  nextVersion?: string;
  npmConfigUserAgent?: string;
  userAgent?: string;
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
    userAgent: headerStore.get('User-Agent') ?? undefined,
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

  return headers;
}
