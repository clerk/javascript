export interface SnapshotMetadata {
  packageName: string;
  version: string;
  timestamp: string;
  commitHash: string;
  branch: string;
  author?: string;
  fileSize: number;
  checksum: string;
}

export interface StorageConfig {
  type: 'gcs' | 'turborepo';
  options: Record<string, any>;
}

export interface BaselineSnapshot {
  packageName: string;
  filePath: string;
  metadata: SnapshotMetadata;
}

export interface SnapshotStorageBackend {
  /**
   * Store a snapshot file with metadata
   */
  store(packageName: string, snapshotPath: string, metadata: SnapshotMetadata): Promise<string>;

  /**
   * Retrieve a snapshot file for a specific package and commit
   */
  retrieve(packageName: string, commitHash: string): Promise<string | null>;

  /**
   * Get the baseline snapshot for a package from the main branch
   */
  getBaseline(packageName: string, branch?: string): Promise<BaselineSnapshot | null>;

  /**
   * List all snapshots for a package
   */
  listSnapshots(packageName: string, options?: { limit?: number; branch?: string }): Promise<SnapshotMetadata[]>;

  /**
   * Clean up old snapshots based on retention policy
   */
  cleanup(retentionDays: number): Promise<void>;

  /**
   * Check if the storage backend is healthy and accessible
   */
  healthCheck(): Promise<boolean>;

  /**
   * Get storage statistics and usage information
   */
  getStats(): Promise<{
    totalSize: number;
    snapshotCount: number;
    oldestSnapshot: string;
    newestSnapshot: string;
  }>;
}

/**
 * Base implementation with common utilities
 */
export abstract class BaseStorageBackend implements SnapshotStorageBackend {
  protected config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  abstract store(packageName: string, snapshotPath: string, metadata: SnapshotMetadata): Promise<string>;
  abstract retrieve(packageName: string, commitHash: string): Promise<string | null>;
  abstract getBaseline(packageName: string, branch?: string): Promise<BaselineSnapshot | null>;
  abstract listSnapshots(
    packageName: string,
    options?: { limit?: number; branch?: string },
  ): Promise<SnapshotMetadata[]>;
  abstract cleanup(retentionDays: number): Promise<void>;
  abstract healthCheck(): Promise<boolean>;
  abstract getStats(): Promise<{
    totalSize: number;
    snapshotCount: number;
    oldestSnapshot: string;
    newestSnapshot: string;
  }>;

  /**
   * Generate a storage key for a package snapshot
   */
  protected generateKey(packageName: string, commitHash: string): string {
    const safeName = packageName.replace(/[@/]/g, '_');
    return `${safeName}_${commitHash}.api.json`;
  }

  /**
   * Generate a metadata key for a package snapshot
   */
  protected generateMetadataKey(packageName: string, commitHash: string): string {
    const safeName = packageName.replace(/[@/]/g, '_');
    return `${safeName}_${commitHash}.metadata.json`;
  }

  /**
   * Validate snapshot metadata
   */
  protected validateMetadata(metadata: SnapshotMetadata): void {
    const required = ['packageName', 'version', 'timestamp', 'commitHash', 'branch'];
    for (const field of required) {
      if (!metadata[field as keyof SnapshotMetadata]) {
        throw new Error(`Missing required metadata field: ${field}`);
      }
    }
  }

  /**
   * Calculate file checksum for integrity verification
   */
  protected async calculateChecksum(filePath: string): Promise<string> {
    const crypto = await import('crypto');
    const fs = await import('fs-extra');

    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
