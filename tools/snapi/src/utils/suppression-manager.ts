export interface SuppressedChange {
  package: string;
  changeId: string;
  reason: string;
  expires?: string; // ISO date string
}

/**
 * Manages suppressed/ignored API changes
 */
export class SuppressionManager {
  private suppressions: Map<string, SuppressedChange>;

  constructor(suppressedChanges: SuppressedChange[]) {
    this.suppressions = new Map();

    // Load suppressions, filtering out expired ones
    const now = new Date();
    for (const suppression of suppressedChanges) {
      if (this.isSuppressionValid(suppression, now)) {
        const key = this.getSuppressionKey(suppression.package, suppression.changeId);
        this.suppressions.set(key, suppression);
      }
    }
  }

  getSuppression(packageName: string, changeId: string): SuppressedChange | undefined {
    const key = this.getSuppressionKey(packageName, changeId);
    return this.suppressions.get(key);
  }

  isSuppressed(packageName: string, changeId: string): boolean {
    return this.getSuppression(packageName, changeId) !== undefined;
  }

  addSuppression(suppression: SuppressedChange): void {
    if (this.isSuppressionValid(suppression, new Date())) {
      const key = this.getSuppressionKey(suppression.package, suppression.changeId);
      this.suppressions.set(key, suppression);
    }
  }

  removeSuppression(packageName: string, changeId: string): boolean {
    const key = this.getSuppressionKey(packageName, changeId);
    return this.suppressions.delete(key);
  }

  getAllSuppressions(): SuppressedChange[] {
    return Array.from(this.suppressions.values());
  }

  getValidSuppressions(): SuppressedChange[] {
    const now = new Date();
    return this.getAllSuppressions().filter(suppression => this.isSuppressionValid(suppression, now));
  }

  getExpiredSuppressions(): SuppressedChange[] {
    const now = new Date();
    return this.getAllSuppressions().filter(suppression => !this.isSuppressionValid(suppression, now));
  }

  private isSuppressionValid(suppression: SuppressedChange, now: Date): boolean {
    if (!suppression.expires) {
      return true; // No expiration = always valid
    }

    try {
      const expirationDate = new Date(suppression.expires);
      return now <= expirationDate;
    } catch {
      // Invalid date format = treat as expired
      return false;
    }
  }

  private getSuppressionKey(packageName: string, changeId: string): string {
    return `${packageName}:${changeId}`;
  }

  /**
   * Generate a suppression entry for a given change
   */
  static createSuppression(
    packageName: string,
    changeId: string,
    reason: string,
    expiresInDays?: number,
  ): SuppressedChange {
    let expires: string | undefined;

    if (expiresInDays && expiresInDays > 0) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expiresInDays);
      expires = expirationDate.toISOString();
    }

    return {
      package: packageName,
      changeId,
      reason,
      expires,
    };
  }

  /**
   * Clean up expired suppressions from the configuration
   */
  cleanupExpiredSuppressions(): SuppressedChange[] {
    const validSuppressions = this.getValidSuppressions();

    // Update internal map
    this.suppressions.clear();
    for (const suppression of validSuppressions) {
      const key = this.getSuppressionKey(suppression.package, suppression.changeId);
      this.suppressions.set(key, suppression);
    }

    return validSuppressions;
  }
}
