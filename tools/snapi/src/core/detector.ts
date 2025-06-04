import fs from 'fs-extra';
import path from 'path';

import { ApiDiffAnalyzer } from '../analyzers/api-diff.js';
import { VersionAnalyzer } from '../analyzers/version-analyzer.js';
import { ReportGenerator } from '../reporters/markdown-reporter.js';
import { StorageManager, type StorageManagerConfig } from '../storage/storage-manager.js';
import type { AnalysisResult, Config, PackageAnalysis, PackageInfo } from '../types.js';
import { ApiExtractorRunner } from '../utils/api-extractor.js';
import { GitManager } from '../utils/git-manager.js';
import { PackageDiscovery } from '../utils/package-discovery.js';
import { SuppressionManager } from '../utils/suppression-manager.js';

export interface DetectorOptions {
  workspaceRoot: string;
  config: Config;
  prBranch?: string;
  baseBranch?: string;
  skipCleanup?: boolean;
}

/**
 * Main orchestrator for API breaking changes detection
 */
export class BreakingChangesDetector {
  private packageDiscovery: PackageDiscovery;
  private apiExtractor: ApiExtractorRunner;
  private diffAnalyzer: ApiDiffAnalyzer;
  private gitManager: GitManager;
  private versionAnalyzer: VersionAnalyzer;
  private reportGenerator: ReportGenerator;
  private suppressionManager: SuppressionManager;
  private snapshotsDir: string;
  private storageManager?: StorageManager;

  constructor(private options: DetectorOptions) {
    this.packageDiscovery = new PackageDiscovery(options.workspaceRoot);
    this.apiExtractor = new ApiExtractorRunner(options.workspaceRoot);
    this.diffAnalyzer = new ApiDiffAnalyzer();
    this.gitManager = new GitManager(options.workspaceRoot);
    this.versionAnalyzer = new VersionAnalyzer();
    this.reportGenerator = new ReportGenerator();
    this.suppressionManager = new SuppressionManager(options.config.suppressedChanges);
    this.snapshotsDir = path.resolve(options.workspaceRoot, options.config.snapshotsDir);

    // Initialize storage manager if storage config is provided
    if (this.options.config.storage) {
      this.storageManager = new StorageManager(this.options.config.storage as StorageManagerConfig);
    }
  }

  async detectBreakingChanges(): Promise<AnalysisResult> {
    console.log('🔍 Starting API breaking changes detection...');

    try {
      // 1. Discover packages in the monorepo
      const packages = await this.discoverPackages();
      console.log(`📦 Found ${packages.length} packages to analyze`);

      // 2. Generate current API snapshots
      console.log('📸 Generating current API snapshots...');
      const currentSnapshots = await this.generateCurrentSnapshots(packages);

      // 3. Get baseline snapshots from main branch
      console.log('🌿 Fetching baseline snapshots from main branch...');
      const baselineSnapshots = await this.getBaselineSnapshots(packages);

      // 4. Compare snapshots and detect changes
      console.log('🔄 Analyzing API changes...');
      const packageAnalyses = await this.analyzePackageChanges(packages, currentSnapshots, baselineSnapshots);

      // 5. Apply suppressions
      const suppressedAnalyses = this.applySuppressions(packageAnalyses);

      // 6. Generate final result
      const result = this.buildAnalysisResult(suppressedAnalyses);

      console.log('✅ API breaking changes detection completed');
      return result;
    } catch (error) {
      console.error('❌ API breaking changes detection failed:', error);
      throw error;
    } finally {
      // Cleanup temporary files
      await this.cleanup();
    }
  }

  async discoverPackages(): Promise<PackageInfo[]> {
    return this.packageDiscovery.discoverPackages(this.options.config.packages, this.options.config.excludePackages);
  }

  async generateCurrentSnapshots(packages: PackageInfo[]): Promise<Map<string, string>> {
    const snapshots = new Map<string, string>();
    const currentDir = path.join(this.snapshotsDir, 'current');
    await fs.ensureDir(currentDir);

    for (const pkg of packages) {
      try {
        console.log(`  Generating snapshot for ${pkg.name}...`);
        const snapshot = await this.apiExtractor.generateApiSnapshot({
          packageInfo: pkg,
          outputDir: currentDir,
        });
        snapshots.set(pkg.name, snapshot.apiJsonPath);
      } catch (error) {
        console.warn(`  ⚠️ Failed to generate snapshot for ${pkg.name}:`, error);
      }
    }

    return snapshots;
  }

  private async getBaselineSnapshots(packages: PackageInfo[]): Promise<Map<string, string>> {
    // Always use storage-based baselines
    if (!this.storageManager) {
      throw new Error('Storage manager must be configured to use baseline snapshots');
    }

    console.log('  📦 Loading storage-based baseline snapshots...');
    const snapshots = new Map<string, string>();

    for (const pkg of packages) {
      try {
        const baseline = await this.storageManager.getBaseline(pkg.name, this.options.config.mainBranch);
        if (baseline) {
          snapshots.set(pkg.name, baseline.filePath);
          console.log(`    ✅ Found baseline for ${pkg.name}`);
        } else {
          console.log(`    ⚠️ No baseline found for ${pkg.name} (new package?)`);
        }
      } catch (error) {
        console.warn(`    ⚠️ Failed to load baseline for ${pkg.name}:`, error);
      }
    }

    return snapshots;
  }

  private async analyzePackageChanges(
    packages: PackageInfo[],
    currentSnapshots: Map<string, string>,
    baselineSnapshots: Map<string, string>,
  ): Promise<PackageAnalysis[]> {
    const analyses: PackageAnalysis[] = [];

    for (const pkg of packages) {
      const currentSnapshot = currentSnapshots.get(pkg.name);
      const baselineSnapshot = baselineSnapshots.get(pkg.name);

      if (!currentSnapshot) {
        console.warn(`  ⚠️ No current snapshot for ${pkg.name}, skipping`);
        continue;
      }

      try {
        console.log(`  Analyzing changes for ${pkg.name}...`);

        // Compare API snapshots
        const changes = baselineSnapshot
          ? await this.diffAnalyzer.compareApiModels(currentSnapshot, baselineSnapshot, pkg.name)
          : []; // New package - no baseline to compare

        // Get version information
        const versionInfo = await this.getVersionInfo(pkg);

        // Analyze version bump validity
        const analysis = await this.versionAnalyzer.analyzeVersionBump(
          changes,
          versionInfo.current,
          versionInfo.previous,
        );

        analyses.push({
          packageName: pkg.name,
          version: versionInfo,
          changes,
          hasBreakingChanges: changes.some(c => c.type === 'breaking'),
          recommendedVersionBump: analysis.recommendedBump,
          actualVersionBump: analysis.actualBump,
          isValidBump: analysis.isValid,
        });
      } catch (error) {
        console.warn(`  ⚠️ Failed to analyze changes for ${pkg.name}:`, error);
      }
    }

    return analyses;
  }

  private applySuppressions(analyses: PackageAnalysis[]): PackageAnalysis[] {
    return analyses.map(analysis => ({
      ...analysis,
      changes: analysis.changes.map(change => {
        const suppression = this.suppressionManager.getSuppression(analysis.packageName, change.id);

        if (suppression) {
          return {
            ...change,
            isSuppressed: true,
            suppressionReason: suppression.reason,
          };
        }

        return change;
      }),
    }));
  }

  private buildAnalysisResult(analyses: PackageAnalysis[]): AnalysisResult {
    const packagesWithChanges = analyses.filter(a => a.changes.length > 0);
    const unsuppressedChanges = analyses.flatMap(a => a.changes.filter(c => !c.isSuppressed));

    const breakingChanges = unsuppressedChanges.filter(c => c.type === 'breaking');
    const nonBreakingChanges = unsuppressedChanges.filter(c => c.type === 'non-breaking');
    const additions = unsuppressedChanges.filter(c => c.type === 'addition');

    const hasBreakingChanges = breakingChanges.length > 0;

    // Determine if CI should fail
    const ciShouldFail =
      this.options.config.checkVersionBump &&
      hasBreakingChanges &&
      analyses.some(a => a.hasBreakingChanges && !a.isValidBump);

    return {
      packages: analyses,
      hasBreakingChanges,
      ciShouldFail,
      summary: {
        totalPackages: analyses.length,
        packagesWithChanges: packagesWithChanges.length,
        breakingChanges: breakingChanges.length,
        nonBreakingChanges: nonBreakingChanges.length,
        additions: additions.length,
      },
    };
  }

  private async getVersionInfo(pkg: PackageInfo): Promise<{ current: string; previous: string }> {
    // Get current version from package.json
    const current = pkg.version;

    // Get previous version from main branch
    const currentBranch = await this.gitManager.getCurrentBranch();
    let previous = current;

    try {
      await this.gitManager.checkoutBranch(this.options.config.mainBranch);
      const mainPackageJson = path.join(pkg.path, 'package.json');

      if (await fs.pathExists(mainPackageJson)) {
        const mainPkg = await fs.readJson(mainPackageJson);
        previous = mainPkg.version || current;
      }
    } finally {
      await this.gitManager.checkoutBranch(currentBranch);
    }

    return { current, previous };
  }

  async generateReport(result: AnalysisResult, format: 'markdown' | 'json' = 'markdown'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(result, null, 2);
    }

    return this.reportGenerator.generateMarkdownReport(result);
  }

  async cleanup(): Promise<void> {
    if (this.options.skipCleanup) {
      console.log('🧹 Cleanup skipped due to --no-cleanup flag');
      return;
    }

    try {
      console.log('🧹 Starting cleanup...');
      await this.apiExtractor.cleanup();
      console.log('  API extractor cleanup completed');

      // Clean up current snapshots (keep baseline for caching)
      const currentDir = path.join(this.snapshotsDir, 'current');
      if (await fs.pathExists(currentDir)) {
        console.log(`  Removing current snapshots directory: ${currentDir}`);
        await fs.remove(currentDir);
        console.log('  Current snapshots directory removed');
      } else {
        console.log('  No current snapshots directory to clean up');
      }

      if (this.storageManager) {
        console.log('🧹 Cleaning up snapshots older than 30 days...');
        await this.storageManager.cleanup(30);
      }
    } catch (error) {
      console.warn('⚠️ Cleanup failed:', error);
    }
  }

  /**
   * Get storage health and statistics
   */
  async getStorageInfo(): Promise<{
    health: any[];
    stats: any;
  }> {
    if (!this.storageManager) {
      return {
        health: [],
        stats: { totalSize: 0, snapshotCount: 0, oldestSnapshot: '', newestSnapshot: '' },
      };
    }

    const [health, stats] = await Promise.all([this.storageManager.getHealthStatus(), this.storageManager.getStats()]);

    return { health, stats };
  }

  /**
   * Shutdown and cleanup resources
   */
  async shutdown(): Promise<void> {
    if (this.storageManager) {
      await this.storageManager.shutdown();
    }
  }
}
