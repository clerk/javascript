import type { BaselineSnapshot, SnapshotMetadata, SnapshotStorageBackend, StorageConfig } from './base-storage.js';
import { GcsStorageBackend } from './gcs-storage.js';
import { TurborepoStorageBackend } from './turborepo-storage.js';

export interface StorageManagerConfig {
  primary: StorageConfig;
  fallback?: StorageConfig[];
  healthCheckInterval?: number; // minutes
  retryAttempts?: number;
  retryDelay?: number; // milliseconds
}

export interface StorageHealth {
  backend: string;
  healthy: boolean;
  lastCheck: Date;
  error?: string;
  latency?: number;
}

/**
 * Storage Manager
 *
 * Orchestrates GCS and Turborepo storage backends with intelligent failover, health monitoring,
 * and optimized routing. Designed for production reliability with GCS as the primary
 * storage solution and Turborepo for local caching.
 *
 * Features:
 * - Automatic failover between GCS and Turborepo
 * - Health monitoring and recovery
 * - Intelligent routing based on performance
 * - Retry logic with exponential backoff
 * - Metrics and monitoring
 * - Cost optimization strategies
 */
export class StorageManager {
  private primaryBackend: SnapshotStorageBackend;
  private fallbackBackends: SnapshotStorageBackend[] = [];
  private healthStatus: Map<string, StorageHealth> = new Map();
  private config: StorageManagerConfig;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: StorageManagerConfig) {
    this.config = {
      healthCheckInterval: 15, // 15 minutes
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.primaryBackend = this.createBackend(config.primary);

    if (config.fallback) {
      this.fallbackBackends = config.fallback.map(cfg => this.createBackend(cfg));
    }

    this.startHealthMonitoring();
  }

  /**
   * Store a snapshot with automatic failover
   */
  async store(packageName: string, snapshotPath: string, metadata: SnapshotMetadata): Promise<string> {
    const backends = [this.primaryBackend, ...this.fallbackBackends];

    for (const backend of backends) {
      if (await this.isBackendHealthy(backend)) {
        try {
          const result = await this.executeWithRetry(
            () => backend.store(packageName, snapshotPath, metadata),
            `store ${packageName}`,
          );

          // Update health status on success
          this.updateHealthStatus(backend, true);
          return result;
        } catch (error) {
          console.warn(`Storage backend failed for ${packageName}:`, error);
          this.updateHealthStatus(backend, false, error as Error);
        }
      }
    }

    throw new Error(`All storage backends failed for ${packageName}`);
  }

  /**
   * Retrieve a snapshot with automatic failover
   */
  async retrieve(packageName: string, commitHash: string): Promise<string | null> {
    const backends = [this.primaryBackend, ...this.fallbackBackends];

    for (const backend of backends) {
      if (await this.isBackendHealthy(backend)) {
        try {
          const result = await this.executeWithRetry(
            () => backend.retrieve(packageName, commitHash),
            `retrieve ${packageName}@${commitHash}`,
          );

          if (result) {
            this.updateHealthStatus(backend, true);
            return result;
          }
        } catch (error) {
          console.warn(`Failed to retrieve ${packageName}@${commitHash}:`, error);
          this.updateHealthStatus(backend, false, error as Error);
        }
      }
    }

    return null;
  }

  /**
   * Get baseline snapshot with smart backend selection
   */
  async getBaseline(packageName: string, branch?: string): Promise<BaselineSnapshot | null> {
    const backends = [this.primaryBackend, ...this.fallbackBackends];

    for (const backend of backends) {
      if (await this.isBackendHealthy(backend)) {
        try {
          const result = await this.executeWithRetry(
            () => backend.getBaseline(packageName, branch),
            `getBaseline ${packageName}@${branch}`,
          );

          if (result) {
            this.updateHealthStatus(backend, true);
            return result;
          }
        } catch (error) {
          console.warn(`Failed to get baseline for ${packageName}:`, error);
          this.updateHealthStatus(backend, false, error as Error);
        }
      }
    }

    return null;
  }

  /**
   * List snapshots from the healthiest backend
   */
  async listSnapshots(packageName: string, options?: { limit?: number; branch?: string }): Promise<SnapshotMetadata[]> {
    const backend = await this.selectBestBackend();

    try {
      const result = await this.executeWithRetry(
        () => backend.listSnapshots(packageName, options),
        `listSnapshots ${packageName}`,
      );

      this.updateHealthStatus(backend, true);
      return result;
    } catch (error) {
      console.warn(`Failed to list snapshots for ${packageName}:`, error);
      this.updateHealthStatus(backend, false, error as Error);
      return [];
    }
  }

  /**
   * Clean up old snapshots across all backends
   */
  async cleanup(retentionDays: number): Promise<void> {
    const backends = [this.primaryBackend, ...this.fallbackBackends];

    const cleanupPromises = backends.map(async backend => {
      if (await this.isBackendHealthy(backend)) {
        try {
          await this.executeWithRetry(() => backend.cleanup(retentionDays), `cleanup`);
          this.updateHealthStatus(backend, true);
        } catch (error) {
          console.warn(`Cleanup failed for backend:`, error);
          this.updateHealthStatus(backend, false, error as Error);
        }
      }
    });

    await Promise.allSettled(cleanupPromises);
  }

  /**
   * Get comprehensive health status for all backends
   */
  async getHealthStatus(): Promise<StorageHealth[]> {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Get aggregated statistics from all backends
   */
  async getStats(): Promise<{
    totalSize: number;
    snapshotCount: number;
    oldestSnapshot: string;
    newestSnapshot: string;
    backendStats: Array<{
      backend: string;
      stats: any;
      healthy: boolean;
    }>;
  }> {
    const backends = [this.primaryBackend, ...this.fallbackBackends];

    let totalSize = 0;
    let snapshotCount = 0;
    let oldestDate = new Date();
    let newestDate = new Date(0);
    const backendStats: Array<{ backend: string; stats: any; healthy: boolean }> = [];

    for (const backend of backends) {
      const isHealthy = await this.isBackendHealthy(backend);

      if (isHealthy) {
        try {
          const stats = await backend.getStats();
          backendStats.push({
            backend: this.getBackendName(backend),
            stats,
            healthy: true,
          });

          totalSize += stats.totalSize;
          snapshotCount += stats.snapshotCount;

          if (stats.oldestSnapshot) {
            const oldestBackendDate = new Date(stats.oldestSnapshot);
            if (oldestBackendDate < oldestDate) {
              oldestDate = oldestBackendDate;
            }
          }

          if (stats.newestSnapshot) {
            const newestBackendDate = new Date(stats.newestSnapshot);
            if (newestBackendDate > newestDate) {
              newestDate = newestBackendDate;
            }
          }
        } catch (error) {
          backendStats.push({
            backend: this.getBackendName(backend),
            stats: null,
            healthy: false,
          });
        }
      } else {
        backendStats.push({
          backend: this.getBackendName(backend),
          stats: null,
          healthy: false,
        });
      }
    }

    return {
      totalSize,
      snapshotCount,
      oldestSnapshot: snapshotCount > 0 ? oldestDate.toISOString() : '',
      newestSnapshot: snapshotCount > 0 ? newestDate.toISOString() : '',
      backendStats,
    };
  }

  /**
   * Force health check for all backends
   */
  async performHealthCheck(): Promise<void> {
    const backends = [this.primaryBackend, ...this.fallbackBackends];

    const healthPromises = backends.map(async backend => {
      const start = Date.now();
      try {
        const healthy = await backend.healthCheck();
        const latency = Date.now() - start;

        this.healthStatus.set(this.getBackendName(backend), {
          backend: this.getBackendName(backend),
          healthy,
          lastCheck: new Date(),
          latency,
        });
      } catch (error) {
        this.healthStatus.set(this.getBackendName(backend), {
          backend: this.getBackendName(backend),
          healthy: false,
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    await Promise.allSettled(healthPromises);
  }

  /**
   * Create production GCS configuration
   */
  static createGcsConfig(
    options: {
      prefix?: string;
      multiRegion?: boolean;
      enableLifecycle?: boolean;
    } = {},
  ): StorageManagerConfig {
    const gcsConfig: StorageConfig = {
      type: 'gcs',
      options: {
        prefix: options.prefix || 'api-snapshots',
        multiRegion: options.multiRegion ?? true,
        enableVersioning: true,
        lifecycle: {
          enabled: options.enableLifecycle ?? true,
          deleteAfterDays: 90,
          archiveAfterDays: 30,
        },
        storageClass: 'STANDARD',
      },
    };

    return {
      primary: gcsConfig,
      fallback: [], // Add fallback backends as needed
      healthCheckInterval: 10,
      retryAttempts: 3,
      retryDelay: 1000,
    };
  }

  /**
   * Create hybrid configuration with GCS primary and Turborepo fallback
   */
  static createHybridConfig(
    options: {
      gcs?: {
        prefix?: string;
        multiRegion?: boolean;
        enableLifecycle?: boolean;
      };
      turborepo?: {
        cacheDir?: string;
        remoteCache?: boolean;
        teamId?: string;
        token?: string;
      };
    } = {},
  ): StorageManagerConfig {
    const gcsConfig = this.createGcsConfig(options.gcs);

    if (options.turborepo) {
      gcsConfig.fallback = [
        {
          type: 'turborepo',
          options: {
            cacheDir: options.turborepo.cacheDir,
            remoteCache: options.turborepo.remoteCache || false,
            teamId: options.turborepo.teamId,
            token: options.turborepo.token,
            namespace: 'api-snapshots',
          },
        },
      ];
    }

    return gcsConfig;
  }

  /**
   * Clean shutdown
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }

  private createBackend(config: StorageConfig): SnapshotStorageBackend {
    switch (config.type) {
      case 'gcs':
        return new GcsStorageBackend(config);
      case 'turborepo':
        return new TurborepoStorageBackend(config);
      default:
        throw new Error(`Unsupported storage backend: ${config.type}`);
    }
  }

  private async isBackendHealthy(backend: SnapshotStorageBackend): Promise<boolean> {
    const backendName = this.getBackendName(backend);
    const health = this.healthStatus.get(backendName);

    if (!health) {
      // No health data, assume healthy for first attempt
      return true;
    }

    // Check if health data is recent (within 2x health check interval)
    const maxAge = (this.config.healthCheckInterval || 15) * 2 * 60 * 1000;
    const age = Date.now() - health.lastCheck.getTime();

    if (age > maxAge) {
      // Health data is stale, perform fresh check
      try {
        const healthy = await backend.healthCheck();
        this.updateHealthStatus(backend, healthy);
        return healthy;
      } catch (error) {
        this.updateHealthStatus(backend, false, error as Error);
        return false;
      }
    }

    return health.healthy;
  }

  private async selectBestBackend(): Promise<SnapshotStorageBackend> {
    const backends = [this.primaryBackend, ...this.fallbackBackends];

    // Prefer primary if healthy
    if (await this.isBackendHealthy(this.primaryBackend)) {
      return this.primaryBackend;
    }

    // Find the best fallback (lowest latency)
    let bestBackend = backends[0];
    let bestLatency = Infinity;

    for (const backend of backends) {
      if (await this.isBackendHealthy(backend)) {
        const health = this.healthStatus.get(this.getBackendName(backend));
        const latency = health?.latency || Infinity;

        if (latency < bestLatency) {
          bestLatency = latency;
          bestBackend = backend;
        }
      }
    }

    return bestBackend;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, description: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retryAttempts!; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.retryAttempts! - 1) {
          const delay = this.config.retryDelay! * Math.pow(2, attempt);
          console.warn(`${description} failed (attempt ${attempt + 1}), retrying in ${delay}ms:`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`${description} failed after ${this.config.retryAttempts} attempts: ${lastError?.message}`);
  }

  private updateHealthStatus(backend: SnapshotStorageBackend, healthy: boolean, error?: Error): void {
    const backendName = this.getBackendName(backend);

    this.healthStatus.set(backendName, {
      backend: backendName,
      healthy,
      lastCheck: new Date(),
      error: error?.message,
    });
  }

  private getBackendName(backend: SnapshotStorageBackend): string {
    if (backend instanceof GcsStorageBackend) return 'gcs';
    if (backend instanceof TurborepoStorageBackend) return 'turborepo';
    return 'unknown';
  }

  private startHealthMonitoring(): void {
    if (this.config.healthCheckInterval && this.config.healthCheckInterval > 0) {
      this.healthCheckTimer = setInterval(() => this.performHealthCheck(), this.config.healthCheckInterval * 60 * 1000);

      // Perform initial health check
      setTimeout(() => this.performHealthCheck(), 5000);
    }
  }
}
