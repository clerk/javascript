export function resolveProxyUrl(topLevel: string | undefined, nested: string | undefined): string | undefined {
  if (topLevel && nested && topLevel !== nested) {
    throw new Error('proxyUrl conflict: top-level and multiDomain.proxyUrl have different values');
  }
  return nested ?? topLevel;
}
