import type { MatchFunction } from '@clerk/shared/pathToRegexp';
import { match } from '@clerk/shared/pathToRegexp';

import type { OrganizationSyncOptions, OrganizationSyncTarget } from './types';

export class OrganizationMatcher {
  private readonly organizationPattern: MatchFunction | null;
  private readonly personalWorkspacePatterns: MatchFunction | null;

  constructor(options?: OrganizationSyncOptions) {
    this.organizationPattern = this.createMatcher(options?.organizationPatterns);
    this.personalWorkspacePatterns = this.createMatcher(
      options?.personalWorkspacePatterns || options?.personalAccountPatterns,
    );
  }

  private createMatcher(pattern?: string[]): MatchFunction | null {
    if (!pattern) return null;
    try {
      return match(pattern);
    } catch (e) {
      throw new Error(`Invalid pattern "${pattern}": ${e}`);
    }
  }

  findTarget(url: URL): OrganizationSyncTarget | null {
    const orgTarget = this.findOrganizationTarget(url);
    if (orgTarget) return orgTarget;

    return this.findPersonalWorkspaceTarget(url);
  }

  private findOrganizationTarget(url: URL): OrganizationSyncTarget | null {
    if (!this.organizationPattern) return null;

    try {
      const result = this.organizationPattern(url.pathname);
      if (!result || !('params' in result)) return null;

      const params = result.params as { id?: string; slug?: string };
      if (params.id) return { type: 'organization', organizationId: params.id };
      if (params.slug) return { type: 'organization', organizationSlug: params.slug };

      return null;
    } catch (e) {
      console.error('Failed to match organization pattern:', e);
      return null;
    }
  }

  private findPersonalWorkspaceTarget(url: URL): OrganizationSyncTarget | null {
    if (!this.personalWorkspacePatterns) return null;

    try {
      const result = this.personalWorkspacePatterns(url.pathname);
      return result ? { type: 'personalWorkspace' } : null;
    } catch (e) {
      console.error('Failed to match personal workspace pattern:', e);
      return null;
    }
  }
}
