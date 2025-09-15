import type { MatchFunction } from '@clerk/shared/pathToRegexp';
import { match } from '@clerk/shared/pathToRegexp';

import type { OrganizationSyncOptions, OrganizationSyncTarget } from './types';

export class OrganizationMatcher {
  private readonly organizationPattern: MatchFunction | null;
  private readonly personalAccountPattern: MatchFunction | null;

  constructor(options?: OrganizationSyncOptions) {
    this.organizationPattern = this.createMatcher(options?.organizationPatterns);
    this.personalAccountPattern = this.createMatcher(options?.personalAccountPatterns);
  }

  private createMatcher(pattern?: string[]): MatchFunction | null {
    if (!pattern) {
      return null;
    }
    try {
      return match(pattern);
    } catch (e) {
      throw new Error(`Invalid pattern "${pattern}": ${e}`);
    }
  }

  findTarget(url: URL): OrganizationSyncTarget | null {
    const orgTarget = this.findOrganizationTarget(url);
    if (orgTarget) {
      return orgTarget;
    }

    return this.findPersonalAccountTarget(url);
  }

  private findOrganizationTarget(url: URL): OrganizationSyncTarget | null {
    if (!this.organizationPattern) {
      return null;
    }

    try {
      const result = this.organizationPattern(url.pathname);
      if (!result || !('params' in result)) {
        return null;
      }

      const params = result.params as { id?: string; slug?: string };
      if (params.id) {
        return { type: 'organization', organizationId: params.id };
      }
      if (params.slug) {
        return { type: 'organization', organizationSlug: params.slug };
      }

      return null;
    } catch (e) {
      console.error('Failed to match organization pattern:', e);
      return null;
    }
  }

  private findPersonalAccountTarget(url: URL): OrganizationSyncTarget | null {
    if (!this.personalAccountPattern) {
      return null;
    }

    try {
      const result = this.personalAccountPattern(url.pathname);
      return result ? { type: 'personalAccount' } : null;
    } catch (e) {
      console.error('Failed to match personal account pattern:', e);
      return null;
    }
  }
}
