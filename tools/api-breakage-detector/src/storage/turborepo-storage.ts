import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { PackageInfo } from '../types.js';

const execAsync = promisify(exec);

export interface TurborepoStorageOptions {
  workspaceRoot: string;
  remoteCache?: {
    enabled: boolean;
    teamId?: string;
    token?: string;
  };
}

/**
 * Storage adapter that uses Turborepo's remote caching to store API snapshots
 */
export class TurborepoStorage {
  constructor(private options: TurborepoStorageOptions) {}

  /**
   * Generate and cache API snapshots using Turborepo
   */
  async generateSnapshots(packages: PackageInfo[]): Promise<Map<string, string>> {
    console.log('📦 Generating API snapshots with Turborepo cache...');

    try {
      // Run the api:snapshot task for all packages
      const { stdout, stderr } = await execAsync('npx turbo run api:snapshot --filter="@clerk/*"', {
        cwd: this.options.workspaceRoot,
      });

      console.log('Turborepo output:', stdout);
      if (stderr) console.warn('Turborepo warnings:', stderr);

      // Collect generated snapshots
      return this.collectSnapshots(packages);
    } catch (error) {
      console.error('Failed to generate snapshots with Turborepo:', error);
      throw error;
    }
  }

  /**
   * Load baseline snapshots from Turborepo cache or generate them
   */
  async loadBaseline(packages: PackageInfo[], commitSha?: string): Promise<Map<string, string>> {
    console.log('🌿 Loading baseline snapshots from Turborepo cache...');

    // Try to restore from cache first
    const cacheKey = await this.getCacheKey(commitSha);
    const restored = await this.restoreFromCache(cacheKey);

    if (restored) {
      console.log('✅ Restored baseline from Turborepo cache');
      return this.collectSnapshots(packages, 'baseline');
    }

    // Generate baseline if not in cache
    console.log('🔄 Generating fresh baseline snapshots...');
    const snapshots = await this.generateBaseline(packages, commitSha);

    // Cache the baseline for future use
    await this.cacheBaseline(cacheKey);

    return snapshots;
  }

  /**
   * Generate baseline snapshots from a specific commit
   */
  private async generateBaseline(packages: PackageInfo[], commitSha?: string): Promise<Map<string, string>> {
    const originalHead = await this.getCurrentCommit();

    try {
      if (commitSha) {
        await execAsync(`git checkout ${commitSha}`, { cwd: this.options.workspaceRoot });
      }

      // Generate snapshots at this commit
      await execAsync('npx turbo run api:snapshot --filter="@clerk/*" --force', { cwd: this.options.workspaceRoot });

      // Move current snapshots to baseline
      const snapshotsDir = path.join(this.options.workspaceRoot, '.api-snapshots');
      const currentDir = path.join(snapshotsDir, 'current');
      const baselineDir = path.join(snapshotsDir, 'baseline');

      if (await fs.pathExists(currentDir)) {
        await fs.remove(baselineDir);
        await fs.move(currentDir, baselineDir);
      }

      return this.collectSnapshots(packages, 'baseline');
    } finally {
      // Always return to original commit
      await execAsync(`git checkout ${originalHead}`, { cwd: this.options.workspaceRoot });
    }
  }

  /**
   * Collect snapshot file paths for packages
   */
  private async collectSnapshots(
    packages: PackageInfo[],
    type: 'current' | 'baseline' = 'current',
  ): Promise<Map<string, string>> {
    const snapshots = new Map<string, string>();
    const snapshotsDir = path.join(this.options.workspaceRoot, '.api-snapshots', type);

    for (const pkg of packages) {
      const snapshotPath = path.join(snapshotsDir, `${pkg.name.replace('/', '__')}.api.json`);
      if (await fs.pathExists(snapshotPath)) {
        snapshots.set(pkg.name, snapshotPath);
      }
    }

    return snapshots;
  }

  /**
   * Generate cache key based on commit SHA and package contents
   */
  private async getCacheKey(commitSha?: string): Promise<string> {
    if (!commitSha) {
      commitSha = await this.getCurrentCommit();
    }

    // Turborepo will handle the actual cache key generation based on inputs
    return `api-snapshots-${commitSha}`;
  }

  /**
   * Try to restore snapshots from Turborepo cache
   */
  private async restoreFromCache(cacheKey: string): Promise<boolean> {
    try {
      // Check if cache exists (Turborepo will automatically restore if available)
      const { stdout } = await execAsync('npx turbo run api:snapshot --filter="@clerk/*" --dry-run', {
        cwd: this.options.workspaceRoot,
      });

      return stdout.includes('cache hit');
    } catch {
      return false;
    }
  }

  /**
   * Cache current baseline snapshots
   */
  private async cacheBaseline(cacheKey: string): Promise<void> {
    // Turborepo automatically caches outputs based on turbo.json configuration
    console.log(`📦 Baseline snapshots cached with key: ${cacheKey}`);
  }

  /**
   * Get current git commit SHA
   */
  private async getCurrentCommit(): Promise<string> {
    const { stdout } = await execAsync('git rev-parse HEAD', { cwd: this.options.workspaceRoot });
    return stdout.trim();
  }

  /**
   * Configure Turborepo remote cache
   */
  async configureRemoteCache(): Promise<void> {
    if (!this.options.remoteCache?.enabled) {
      return;
    }

    const { teamId, token } = this.options.remoteCache;

    if (teamId && token) {
      await execAsync(`npx turbo login --team=${teamId} --token=${token}`, {
        cwd: this.options.workspaceRoot,
      });
      console.log('✅ Turborepo remote cache configured');
    }
  }

  /**
   * Generate package-specific snapshots using Turborepo
   */
  async generatePackageSnapshot(pkg: PackageInfo): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`npx turbo run api:snapshot --filter="${pkg.name}"`, {
        cwd: this.options.workspaceRoot,
      });

      const snapshotPath = path.join(
        this.options.workspaceRoot,
        '.api-snapshots/current',
        `${pkg.name.replace('/', '__')}.api.json`,
      );

      return (await fs.pathExists(snapshotPath)) ? snapshotPath : null;
    } catch (error) {
      console.warn(`Failed to generate snapshot for ${pkg.name}:`, error);
      return null;
    }
  }
}
