import fs from 'fs-extra';
import path from 'path';

import {
  type BaselineSnapshot,
  BaseStorageBackend,
  type SnapshotMetadata,
  type StorageConfig,
} from './base-storage.js';

export interface GcsStorageOptions {
  prefix?: string;
  enableVersioning?: boolean;
  lifecycle?: {
    enabled: boolean;
    deleteAfterDays?: number;
    archiveAfterDays?: number;
  };
  multiRegion?: boolean;
  storageClass?: 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE';
}

/**
 * Google Cloud Storage Backend
 *
 * Production-optimized storage solution for API snapshots using Google Cloud Storage.
 * Designed for high reliability, global accessibility, and cost efficiency.
 *
 * Features:
 * - Multi-regional replication for high availability
 * - Automatic lifecycle management and archiving
 * - Cost optimization with storage classes
 * - Batch operations for efficiency
 * - Object versioning for safety
 * - Built-in caching and compression
 * - IAM integration for security
 *
 * Benefits for Production:
 * - 99.95% availability SLA
 * - Global edge caching
 * - Automatic encryption at rest
 * - Fine-grained access control
 * - Seamless scaling
 */
export class GcsStorageBackend extends BaseStorageBackend {
  private storage: any;
  private bucket: any;
  private options: GcsStorageOptions;
  private projectId: string;
  private bucketName: string;

  constructor(config: StorageConfig) {
    super(config);
    this.options = config.options as GcsStorageOptions;

    // Get projectId from config or environment variable
    this.projectId = process.env.GCS_PROJECT_ID || '';
    if (!this.projectId) {
      throw new Error('GCS Project ID must be provided via GCS_PROJECT_ID environment variable');
    }

    // Get bucket from config or environment variable
    this.bucketName = process.env.GCS_BUCKET || '';
    if (!this.bucketName) {
      throw new Error('GCS Bucket must be provided via GCS_BUCKET environment variable');
    }

    console.log(`🪣 Using GCS: Project=${this.projectId}, Bucket=${this.bucketName}`);
  }

  async store(packageName: string, snapshotPath: string, metadata: SnapshotMetadata): Promise<string> {
    this.validateMetadata(metadata);
    await this.ensureStorage();

    const key = this.generateKey(packageName, metadata.commitHash);
    const metadataKey = this.generateMetadataKey(packageName, metadata.commitHash);

    // Calculate file stats
    const stats = await fs.stat(snapshotPath);
    metadata.fileSize = stats.size;
    metadata.checksum = await this.calculateChecksum(snapshotPath);

    try {
      // Upload files in parallel for better performance
      const [snapshotResult, _metadataResult] = await Promise.all([
        this.uploadFile(key, snapshotPath, metadata),
        this.uploadMetadata(metadataKey, metadata),
      ]);

      console.log(`✅ Stored snapshot for ${packageName} in GCS (${this.formatFileSize(metadata.fileSize)})`);
      return snapshotResult.name;
    } catch (error) {
      throw new Error(`Failed to store snapshot in GCS: ${error}`);
    }
  }

  async retrieve(packageName: string, commitHash: string): Promise<string | null> {
    await this.ensureStorage();

    const key = this.generateKey(packageName, commitHash);
    const file = this.bucket.file(key);

    try {
      const [exists] = await file.exists();
      if (!exists) {
        return null;
      }

      const localPath = path.join(
        process.cwd(),
        '.tmp',
        'retrieved-snapshots',
        `${packageName.replace(/[@/]/g, '_')}_${commitHash}.api.json`,
      );

      await fs.ensureDir(path.dirname(localPath));
      await file.download({ destination: localPath });

      return localPath;
    } catch (error) {
      console.warn(`Failed to retrieve snapshot from GCS:`, error);
      return null;
    }
  }

  async getBaseline(packageName: string, branch: string = 'main'): Promise<BaselineSnapshot | null> {
    await this.ensureStorage();

    try {
      // List all snapshots for the package from the main branch
      const snapshots = await this.listSnapshots(packageName, { limit: 50, branch });

      if (snapshots.length === 0) {
        return null;
      }

      // Get the most recent snapshot
      const latest = snapshots[0]; // Already sorted by timestamp in listSnapshots
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
      console.warn(`Failed to get baseline from GCS:`, error);
      return null;
    }
  }

  async listSnapshots(packageName: string, options?: { limit?: number; branch?: string }): Promise<SnapshotMetadata[]> {
    await this.ensureStorage();

    const prefix = this.getPackagePrefix(packageName);

    try {
      const [files] = await this.bucket.getFiles({
        prefix: `${prefix}/`,
        maxResults: (options?.limit || 100) * 2, // Get more files to account for .metadata.json files
      });

      const snapshots: SnapshotMetadata[] = [];

      // Process metadata files in parallel
      const metadataFiles = files.filter((file: any) => file.name.endsWith('.metadata.json'));
      const metadataPromises = metadataFiles.slice(0, options?.limit || 100).map(async (file: any) => {
        try {
          const [content] = await file.download();
          const metadata: SnapshotMetadata = JSON.parse(content.toString());

          // Filter by branch if specified
          if (!options?.branch || metadata.branch === options.branch) {
            return metadata;
          }
        } catch (error) {
          console.warn(`Failed to read metadata from ${file.name}:`, error);
        }
        return null;
      });

      const results = await Promise.all(metadataPromises);
      snapshots.push(...(results.filter(Boolean) as SnapshotMetadata[]));

      // Sort by timestamp (newest first)
      return snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.warn(`Failed to list snapshots from GCS:`, error);
      return [];
    }
  }

  async cleanup(retentionDays: number): Promise<void> {
    await this.ensureStorage();

    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    try {
      // Use lifecycle management if enabled
      if (this.options.lifecycle?.enabled) {
        await this.configureLifecycle(retentionDays);
        console.log(`✅ Configured GCS lifecycle management for ${retentionDays} day retention`);
        return;
      }

      // Manual cleanup for fine-grained control
      const [files] = await this.bucket.getFiles({
        prefix: this.getPrefix(),
      });

      // Process files in batches for better performance
      const batchSize = 100;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);

        const deletePromises = batch.map(async (file: any) => {
          if (file.name.endsWith('.metadata.json')) {
            try {
              const [content] = await file.download();
              const metadata: SnapshotMetadata = JSON.parse(content.toString());
              const snapshotDate = new Date(metadata.timestamp);

              if (snapshotDate < cutoffDate) {
                const snapshotFileName = file.name.replace('.metadata.json', '.api.json');
                const snapshotFile = this.bucket.file(snapshotFileName);

                // Delete both metadata and snapshot files
                await Promise.all([
                  file.delete(),
                  snapshotFile.delete().catch(() => {}), // Ignore if snapshot file doesn't exist
                ]);

                return 1;
              }
            } catch (error) {
              console.warn(`Failed to process file ${file.name}:`, error);
            }
          }
          return 0;
        });

        const results = await Promise.all(deletePromises);
        cleanedCount += results.reduce((sum, count) => sum + count, 0);
      }

      console.log(`✅ Cleaned up ${cleanedCount} old snapshots from GCS`);
    } catch (error) {
      console.warn(`Failed to cleanup snapshots from GCS:`, error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureStorage();

      // Test bucket access
      await this.bucket.getMetadata();

      // Test file operations with a small test file
      const testFile = this.bucket.file(`${this.getPrefix()}health-check-${Date.now()}.txt`);
      await testFile.save('health-check');
      await testFile.delete();

      return true;
    } catch (error) {
      console.error('GCS storage health check failed:', error);
      return false;
    }
  }

  async getStats(): Promise<{
    totalSize: number;
    snapshotCount: number;
    oldestSnapshot: string;
    newestSnapshot: string;
  }> {
    await this.ensureStorage();

    try {
      const [files] = await this.bucket.getFiles({
        prefix: this.getPrefix(),
      });

      let totalSize = 0;
      let snapshotCount = 0;
      let oldestDate = new Date();
      let newestDate = new Date(0);

      // Process metadata files to get accurate stats
      const metadataFiles = files.filter((file: any) => file.name.endsWith('.metadata.json'));

      const statsPromises = metadataFiles.map(async (file: any) => {
        try {
          const [content] = await file.download();
          const metadata: SnapshotMetadata = JSON.parse(content.toString());
          const snapshotDate = new Date(metadata.timestamp);

          return {
            fileSize: metadata.fileSize,
            timestamp: snapshotDate,
          };
        } catch (error) {
          console.warn(`Failed to read metadata from ${file.name}:`, error);
          return null;
        }
      });

      const results = await Promise.all(statsPromises);

      for (const result of results) {
        if (result) {
          totalSize += result.fileSize;
          snapshotCount++;

          if (result.timestamp < oldestDate) {
            oldestDate = result.timestamp;
          }
          if (result.timestamp > newestDate) {
            newestDate = result.timestamp;
          }
        }
      }

      return {
        totalSize,
        snapshotCount,
        oldestSnapshot: snapshotCount > 0 ? oldestDate.toISOString() : '',
        newestSnapshot: snapshotCount > 0 ? newestDate.toISOString() : '',
      };
    } catch (error) {
      console.warn(`Failed to get stats from GCS:`, error);
      return {
        totalSize: 0,
        snapshotCount: 0,
        oldestSnapshot: '',
        newestSnapshot: '',
      };
    }
  }

  private async ensureStorage(): Promise<void> {
    if (this.storage && this.bucket) {
      return;
    }

    try {
      // Dynamic import to handle optional dependency
      const { Storage } = await import('@google-cloud/storage').catch(() => {
        throw new Error('@google-cloud/storage is not installed. Install it with: pnpm install @google-cloud/storage');
      });

      const storageOptions: any = {
        projectId: this.projectId,
      };

      // Handle authentication via environment variables
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        // Use service account key from GOOGLE_SERVICE_ACCOUNT_KEY environment variable
        try {
          const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
          storageOptions.credentials = credentials;
          console.log('🔐 Using service account key from GOOGLE_SERVICE_ACCOUNT_KEY');
        } catch (error) {
          throw new Error(`Failed to parse service account key from GOOGLE_SERVICE_ACCOUNT_KEY: ${error}`);
        }
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Use service account key file from GOOGLE_APPLICATION_CREDENTIALS
        console.log('🔐 Using service account key file from GOOGLE_APPLICATION_CREDENTIALS');
      } else {
        // Use default application credentials (gcloud auth application-default login)
        console.log('🔐 Using default application credentials');
      }

      this.storage = new Storage(storageOptions);
      this.bucket = this.storage.bucket(this.bucketName);

      // Ensure bucket exists and is properly configured
      await this.ensureBucketConfiguration();
    } catch (error) {
      throw new Error(`Failed to initialize GCS client: ${error}`);
    }
  }

  private async ensureBucketConfiguration(): Promise<void> {
    try {
      const [exists] = await this.bucket.exists();

      if (!exists) {
        console.log(`Creating GCS bucket: ${this.bucketName}`);
        await this.bucket.create({
          location: this.options.multiRegion ? 'US' : 'US-CENTRAL1',
          storageClass: this.options.storageClass || 'STANDARD',
          versioning: {
            enabled: this.options.enableVersioning || true,
          },
        });
      }

      // Configure CORS for web access if needed
      await this.bucket.setCorsConfiguration([
        {
          maxAgeSeconds: 3600,
          method: ['GET', 'HEAD'],
          origin: ['*'],
          responseHeader: ['Content-Type', 'Content-Range', 'Content-Length'],
        },
      ]);

      // Set up lifecycle management if enabled
      if (this.options.lifecycle?.enabled) {
        await this.configureLifecycle(this.options.lifecycle.deleteAfterDays || 30);
      }
    } catch (error) {
      console.warn('Failed to configure bucket (may not have permissions):', error);
    }
  }

  private async configureLifecycle(retentionDays: number): Promise<void> {
    const lifecycleRules = [];

    // Delete old snapshots
    lifecycleRules.push({
      action: { type: 'Delete' },
      condition: {
        age: retentionDays,
        matchesPrefix: [this.getPrefix()],
      },
    });

    // Archive older snapshots if archiving is enabled
    if (this.options.lifecycle?.archiveAfterDays) {
      lifecycleRules.push({
        action: { type: 'SetStorageClass', storageClass: 'ARCHIVE' },
        condition: {
          age: this.options.lifecycle.archiveAfterDays,
          matchesPrefix: [this.getPrefix()],
          matchesStorageClass: ['STANDARD', 'NEARLINE', 'COLDLINE'],
        },
      });
    }

    await this.bucket.setMetadata({
      lifecycle: { rule: lifecycleRules },
    });
  }

  private async uploadFile(key: string, filePath: string, metadata: SnapshotMetadata): Promise<any> {
    const file = this.bucket.file(key);

    const uploadOptions: any = {
      metadata: {
        contentType: 'application/json',
        cacheControl: 'public, max-age=3600',
        metadata: {
          packageName: metadata.packageName,
          version: metadata.version,
          commitHash: metadata.commitHash,
          branch: metadata.branch,
          checksum: metadata.checksum,
        },
      },
    };

    // Enable compression for better performance and cost
    if (metadata.fileSize > 1024) {
      // Only compress files larger than 1KB
      uploadOptions.gzip = true;
    }

    await file.save(await fs.readFile(filePath), uploadOptions);
    return file;
  }

  private async uploadMetadata(key: string, metadata: SnapshotMetadata): Promise<any> {
    const file = this.bucket.file(key);

    await file.save(JSON.stringify(metadata, null, 2), {
      metadata: {
        contentType: 'application/json',
        cacheControl: 'public, max-age=3600',
      },
    });

    return file;
  }

  private getPackagePrefix(packageName: string): string {
    const prefix = this.getPrefix();
    const safeName = packageName.replace(/[@/]/g, '_');
    return `${prefix}snapshots/${safeName}`;
  }

  private getPrefix(): string {
    const prefix = this.options.prefix || '';
    return prefix ? `${prefix}/` : '';
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Get presigned URLs for direct browser uploads (useful for large files)
   */
  async getUploadUrl(packageName: string, commitHash: string, expiresIn: number = 3600): Promise<string> {
    await this.ensureStorage();

    const key = this.generateKey(packageName, commitHash);
    const file = this.bucket.file(key);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresIn * 1000,
      contentType: 'application/json',
    });

    return url;
  }

  /**
   * Get presigned URLs for direct browser downloads
   */
  async getDownloadUrl(packageName: string, commitHash: string, expiresIn: number = 3600): Promise<string> {
    await this.ensureStorage();

    const key = this.generateKey(packageName, commitHash);
    const file = this.bucket.file(key);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });

    return url;
  }

  /**
   * Batch upload multiple snapshots for efficiency
   */
  async storeBatch(
    snapshots: Array<{
      packageName: string;
      snapshotPath: string;
      metadata: SnapshotMetadata;
    }>,
  ): Promise<string[]> {
    await this.ensureStorage();

    const uploadPromises = snapshots.map(async ({ packageName, snapshotPath, metadata }) => {
      try {
        return await this.store(packageName, snapshotPath, metadata);
      } catch (error) {
        console.warn(`Failed to upload ${packageName}:`, error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(Boolean) as string[];
  }
}
