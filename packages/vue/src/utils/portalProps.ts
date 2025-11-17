import type { PortalProps } from '@clerk/shared/types';

type PortalRoot = HTMLElement | null | undefined;

/**
 * Merges portal props from multiple sources, with later sources taking precedence.
 * Useful when you have portal props at multiple levels (e.g., top-level and nested props).
 */
export function mergePortalProps(
  ...sources: Array<Partial<PortalProps> | undefined | null>
): Pick<PortalProps, 'disablePortal' | 'portalId' | 'portalRoot'> {
  const result: Pick<PortalProps, 'disablePortal' | 'portalId' | 'portalRoot'> = {};

  for (const source of sources) {
    if (!source) continue;

    if ('disablePortal' in source && source.disablePortal !== undefined) {
      result.disablePortal = source.disablePortal;
    }
    if ('portalId' in source && source.portalId !== undefined) {
      result.portalId = source.portalId;
    }
    if ('portalRoot' in source && source.portalRoot !== undefined && source.portalRoot !== null) {
      result.portalRoot = source.portalRoot;
    }
  }

  return result;
}

/**
 * Normalizes portalRoot from PortalProps format to PortalRoot format.
 * Converts function form to HTMLElement and null to undefined.
 */
export function normalizePortalRoot(portalRoot: PortalProps['portalRoot']): PortalRoot {
  if (!portalRoot) {
    return undefined;
  }
  if (typeof portalRoot === 'function') {
    return portalRoot() ?? undefined;
  }
  return portalRoot ?? undefined;
}
