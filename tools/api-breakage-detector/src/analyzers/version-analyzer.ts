import semver from 'semver';
import { ChangeSeverity } from '../types.js';
import type { ApiChange } from '../types.js';

export interface VersionBumpAnalysis {
  recommendedBump: ChangeSeverity;
  actualBump?: ChangeSeverity;
  isValid: boolean;
  reasons: string[];
}

/**
 * Analyzes version bumps in relation to API changes
 */
export class VersionAnalyzer {
  async analyzeVersionBump(
    changes: ApiChange[],
    currentVersion: string,
    previousVersion: string,
  ): Promise<VersionBumpAnalysis> {
    const recommendedBump = this.calculateRecommendedBump(changes);
    const actualBump = this.calculateActualBump(currentVersion, previousVersion);
    const isValid = this.isValidVersionBump(recommendedBump, actualBump);
    const reasons = this.generateReasons(changes, recommendedBump, actualBump);

    return {
      recommendedBump,
      actualBump,
      isValid,
      reasons,
    };
  }

  private calculateRecommendedBump(changes: ApiChange[]): ChangeSeverity {
    // No changes = patch bump (or no bump)
    if (changes.length === 0) {
      return ChangeSeverity.PATCH;
    }

    // Any breaking change requires major bump
    const hasBreakingChanges = changes.some(c => c.type === 'breaking' && !c.isSuppressed);
    if (hasBreakingChanges) {
      return ChangeSeverity.MAJOR;
    }

    // New features or non-breaking changes require minor bump
    const hasNewFeatures = changes.some(c => (c.type === 'addition' || c.type === 'non-breaking') && !c.isSuppressed);
    if (hasNewFeatures) {
      return ChangeSeverity.MINOR;
    }

    // Fallback to patch
    return ChangeSeverity.PATCH;
  }

  private calculateActualBump(currentVersion: string, previousVersion: string): ChangeSeverity | undefined {
    if (!semver.valid(currentVersion) || !semver.valid(previousVersion)) {
      return undefined;
    }

    if (semver.eq(currentVersion, previousVersion)) {
      return undefined; // No version bump
    }

    const diff = semver.diff(previousVersion, currentVersion);

    switch (diff) {
      case 'major':
        return ChangeSeverity.MAJOR;
      case 'minor':
        return ChangeSeverity.MINOR;
      case 'patch':
        return ChangeSeverity.PATCH;
      default:
        return undefined;
    }
  }

  private isValidVersionBump(recommended: ChangeSeverity, actual?: ChangeSeverity): boolean {
    if (!actual) {
      // No version bump is only valid if recommended is patch and there are no changes
      return recommended === ChangeSeverity.PATCH;
    }

    // Convert to numeric for comparison
    const severityOrder = {
      [ChangeSeverity.PATCH]: 1,
      [ChangeSeverity.MINOR]: 2,
      [ChangeSeverity.MAJOR]: 3,
    };

    // Actual bump must be >= recommended bump
    return severityOrder[actual] >= severityOrder[recommended];
  }

  private generateReasons(changes: ApiChange[], recommended: ChangeSeverity, actual?: ChangeSeverity): string[] {
    const reasons: string[] = [];

    // Explain why the recommended bump is needed
    const breakingChanges = changes.filter(c => c.type === 'breaking' && !c.isSuppressed);
    const newFeatures = changes.filter(c => c.type === 'addition' && !c.isSuppressed);
    const nonBreakingChanges = changes.filter(c => c.type === 'non-breaking' && !c.isSuppressed);

    if (breakingChanges.length > 0) {
      reasons.push(`Major version bump required due to ${breakingChanges.length} breaking change(s)`);
    } else if (newFeatures.length > 0) {
      reasons.push(`Minor version bump required due to ${newFeatures.length} new feature(s)`);
    } else if (nonBreakingChanges.length > 0) {
      reasons.push(`Minor version bump recommended due to ${nonBreakingChanges.length} non-breaking change(s)`);
    }

    // Explain version bump validation
    if (!actual) {
      if (recommended !== ChangeSeverity.PATCH) {
        reasons.push('⚠️ No version bump detected, but changes require version update');
      }
    } else if (!this.isValidVersionBump(recommended, actual)) {
      reasons.push(`⚠️ Version bump (${actual}) is insufficient for the detected changes (requires ${recommended})`);
    } else {
      reasons.push(`✅ Version bump (${actual}) is appropriate for the detected changes`);
    }

    return reasons;
  }

  /**
   * Check if a version is a prerelease
   */
  isPrerelease(version: string): boolean {
    return semver.prerelease(version) !== null;
  }

  /**
   * Get next version based on bump type
   */
  getNextVersion(currentVersion: string, bump: ChangeSeverity): string {
    switch (bump) {
      case ChangeSeverity.MAJOR:
        return semver.inc(currentVersion, 'major') || currentVersion;
      case ChangeSeverity.MINOR:
        return semver.inc(currentVersion, 'minor') || currentVersion;
      case ChangeSeverity.PATCH:
        return semver.inc(currentVersion, 'patch') || currentVersion;
    }
  }
}
