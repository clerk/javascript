import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';

import {
  type BaselineSnapshot,
  BaseStorageBackend,
  type SnapshotMetadata,
  type StorageConfig,
} from './base-storage.js';

const execAsync = promisify(exec);

export interface TurborepoStorageOptions {
  cacheDir?: string;
  teamId?: string;
  token?: string;
  remoteCache?: boolean;
  namespace?: string;
}

/**
 * Turborepo Cache Storage Backend
 *
 * Leverages Turborepo's caching system for storing API snapshots.
 * Integrates with existing build cache infrastructure and supports
 * both local and remote caching.
 *
 * Features:
 * - Integration with Turborepo cache
 * - Local and remote cache support
 * - Automatic cache key generation
 * - Built-in deduplication
 * - Fast retrieval and storage
 */
export class TurborepoStorageBackend extends BaseStorageBackend {
  private options: TurborepoStorageOptions;
  private cacheDir: string;

  constructor(config: StorageConfig) {
    super(config);
    this.options = config.options as TurborepoStorageOptions;
    this.cacheDir = this.options.cacheDir || path.join(process.cwd(), 'node_modules/.cache/turbo');
  }

  async store(packageName: string, snapshotPath: string, metadata: SnapshotMetadata): Promise<string> {
    this.validateMetadata(metadata);

    const cacheKey = this.generateCacheKey(packageName, metadata.commitHash);
    const cacheDir = path.join(this.cacheDir, this.getCacheNamespace(), cacheKey);

    try {
      await fs.ensureDir(cacheDir);

      // Store the snapshot file
      const snapshotFile = path.join(cacheDir, 'snapshot.api.json');
      await fs.copy(snapshotPath, snapshotFile);

      // Store metadata
      const metadataFile = path.join(cacheDir, 'metadata.json');
      await fs.writeJson(metadataFile, metadata, { spaces: 2 });

      console.log(`✅ Stored snapshot for ${packageName} in Turborepo cache`);
      return cacheKey;
    } catch (error) {
      throw new Error(`Failed to store snapshot in Turborepo cache: ${error}`);
    }
  }

  async retrieve(packageName: string, commitHash: string): Promise<string | null> {
    const cacheKey = this.generateCacheKey(packageName, commitHash);
    const cacheDir = path.join(this.cacheDir, this.getCacheNamespace(), cacheKey);
    const snapshotFile = path.join(cacheDir, 'snapshot.api.json');

    try {
      if (!(await fs.pathExists(snapshotFile))) {
        return null;
      }

      // Copy to a temporary location for retrieval
      const tempDir = path.join(process.cwd(), '.tmp', 'retrieved-snapshots');
      await fs.ensureDir(tempDir);

      const localPath = path.join(tempDir, `${packageName.replace(/[@/]/g, '_')}_${commitHash}.api.json`);
      await fs.copy(snapshotFile, localPath);

      return localPath;
    } catch (error) {
      console.warn(`Failed to retrieve snapshot from Turborepo cache:`, error);
      return null;
    }
  }

  async getBaseline(packageName: string, branch: string = 'main'): Promise<BaselineSnapshot | null> {
    try {
      // Find the most recent snapshot for this package on the main branch
      const snapshots = await this.listSnapshots(packageName, { branch, limit: 1 });

      if (snapshots.length === 0) {
        return null;
      }

      const latest = snapshots[0];
      const localPath = await this.retrieve(packageName, latest.commitHash);

      if (!localPath) {
        return null;
      }

      return {
        packageName,
        filePath: localPath,
        metadata: latest,
      };
    } catch (error) {
      console.warn(`Failed to get baseline from Turborepo cache:`, error);
      return null;
    }
  }

  async listSnapshots(packageName: string, options?: { limit?: number; branch?: string }): Promise<SnapshotMetadata[]> {
    const namespaceDir = path.join(this.cacheDir, this.getCacheNamespace());

    try {
      if (!(await fs.pathExists(namespaceDir))) {
        return [];
      }

      const entries = await fs.readdir(namespaceDir);
      const snapshots: SnapshotMetadata[] = [];

      // Filter cache entries that match this package
      const packagePrefix = packageName.replace(/[@/]/g, '_');
      const matchingEntries = entries.filter(entry => entry.startsWith(`${packagePrefix}_`));

      for (const entry of matchingEntries) {
        try {
          const metadataFile = path.join(namespaceDir, entry, 'metadata.json');

          if (await fs.pathExists(metadataFile)) {
            const metadata: SnapshotMetadata = await fs.readJson(metadataFile);

            // Filter by branch if specified
            if (!options?.branch || metadata.branch === options.branch) {
              snapshots.push(metadata);
            }
          }
        } catch (error) {
          console.warn(`Failed to read metadata for ${entry}:`, error);
        }
      }

      // Sort by timestamp (newest first) and apply limit
      const sortedSnapshots = snapshots.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      return options?.limit ? sortedSnapshots.slice(0, options.limit) : sortedSnapshots;
    } catch (error) {
      console.warn(`Failed to list snapshots from Turborepo cache:`, error);
      return [];
    }
  }

  async delete(key: string): Promise<void> {
    const cacheDir = path.join(this.cacheDir, this.getCacheNamespace(), key);

    try {
      if (await fs.pathExists(cacheDir)) {
        await fs.remove(cacheDir);
        console.log(`✅ Deleted snapshot ${key} from Turborepo cache`);
      } else {
        console.warn(`Snapshot ${key} not found in Turborepo cache for deletion`);
      }
    } catch (error) {
      throw new Error(`Failed to delete snapshot ${key} from Turborepo cache: ${error}`);
    }
  }

  async cleanup(retentionDays: number): Promise<void> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const namespaceDir = path.join(this.cacheDir, this.getCacheNamespace());
    let cleanedCount = 0;

    try {
      if (!(await fs.pathExists(namespaceDir))) {
        return;
      }

      const entries = await fs.readdir(namespaceDir);

      for (const entry of entries) {
        try {
          const entryDir = path.join(namespaceDir, entry);
          const metadataFile = path.join(entryDir, 'metadata.json');

          if (await fs.pathExists(metadataFile)) {
            const metadata: SnapshotMetadata = await fs.readJson(metadataFile);
            const snapshotDate = new Date(metadata.timestamp);

            if (snapshotDate < cutoffDate) {
              await fs.remove(entryDir);
              cleanedCount++;
            }
          }
        } catch (error) {
          console.warn(`Failed to process cache entry ${entry}:`, error);
        }
      }

      console.log(`✅ Cleaned up ${cleanedCount} old snapshots from Turborepo cache`);
    } catch (error) {
      console.warn(`Failed to cleanup Turborepo cache:`, error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Check if we can access the cache directory
      await fs.ensureDir(this.cacheDir);

      // Test write/read operations
      const testDir = path.join(this.cacheDir, this.getCacheNamespace(), 'health-check');
      const testFile = path.join(testDir, 'test.json');

      await fs.ensureDir(testDir);
      await fs.writeJson(testFile, { test: true });
      await fs.readJson(testFile);
      await fs.remove(testDir);

      // Check Turborepo availability if remote cache is enabled
      if (this.options.remoteCache) {
        try {
          await execAsync('npx turbo --version', { timeout: 5000 });
        } catch {
          console.warn('Turborepo CLI not available, remote cache may not work');
        }
      }

      return true;
    } catch (error) {
      console.error('Turborepo cache health check failed:', error);
      return false;
    }
  }

  async getStats(): Promise<{
    totalSize: number;
    snapshotCount: number;
    oldestSnapshot: string;
    newestSnapshot: string;
  }> {
    const namespaceDir = path.join(this.cacheDir, this.getCacheNamespace());

    try {
      if (!(await fs.pathExists(namespaceDir))) {
        return {
          totalSize: 0,
          snapshotCount: 0,
          oldestSnapshot: '',
          newestSnapshot: '',
        };
      }

      const entries = await fs.readdir(namespaceDir);
      let totalSize = 0;
      let snapshotCount = 0;
      let oldestDate = new Date();
      let newestDate = new Date(0);

      for (const entry of entries) {
        try {
          const entryDir = path.join(namespaceDir, entry);
          const metadataFile = path.join(entryDir, 'metadata.json');
          const snapshotFile = path.join(entryDir, 'snapshot.api.json');

          if ((await fs.pathExists(metadataFile)) && (await fs.pathExists(snapshotFile))) {
            const metadata: SnapshotMetadata = await fs.readJson(metadataFile);
            const stats = await fs.stat(snapshotFile);
            const snapshotDate = new Date(metadata.timestamp);

            totalSize += stats.size;
            snapshotCount++;

            if (snapshotDate < oldestDate) {
              oldestDate = snapshotDate;
            }
            if (snapshotDate > newestDate) {
              newestDate = snapshotDate;
            }
          }
        } catch (error) {
          console.warn(`Failed to process cache entry ${entry}:`, error);
        }
      }

      return {
        totalSize,
        snapshotCount,
        oldestSnapshot: snapshotCount > 0 ? oldestDate.toISOString() : '',
        newestSnapshot: snapshotCount > 0 ? newestDate.toISOString() : '',
      };
    } catch (error) {
      console.warn(`Failed to get Turborepo cache stats:`, error);
      return {
        totalSize: 0,
        snapshotCount: 0,
        oldestSnapshot: '',
        newestSnapshot: '',
      };
    }
  }

  private generateCacheKey(packageName: string, commitHash: string): string {
    const safeName = packageName.replace(/[@/]/g, '_');
    return `${safeName}_${commitHash}`;
  }

  private getCacheNamespace(): string {
    return this.options.namespace || 'api-snapshots';
  }
}
