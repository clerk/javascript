import fs from 'fs-extra';
import path from 'path';

import { ApiDiffAnalyzer } from '../analyzers/api-diff.js';
import { VersionAnalyzer, type VersionBumpAnalysis } from '../analyzers/version-analyzer.js';
import { ReportGenerator } from '../reporters/markdown-reporter.js';
import type { BaselineSnapshot, SnapshotMetadata } from '../storage/base-storage.js';
import { StorageManager } from '../storage/storage-manager.js';
import {
  type AnalysisResult,
  type ApiChange,
  type ApiSnapshot,
  ChangeSeverity,
  type Config,
  type PackageAnalysis,
  type PackageInfo,
} from '../types.js';
import { ApiExtractorRunner } from '../utils/api-extractor.js';
import { PackageDiscovery } from '../utils/package-discovery.js';
import { SuppressionManager } from '../utils/suppression-manager.js';

export interface BreakingChangesDetectorOptions {
  workspaceRoot: string;
  config: Config;
  skipCleanup?: boolean;
}

/**
 * Main orchestrator for API breaking changes detection
 */
export class BreakingChangesDetector {
  private packageDiscovery: PackageDiscovery;
  private extractorRunner: ApiExtractorRunner;
  private diffAnalyzer: ApiDiffAnalyzer;
  private versionAnalyzer: VersionAnalyzer;
  private suppressionManager: SuppressionManager;
  private storageManager?: StorageManager;
  private options: BreakingChangesDetectorOptions;
  private reportGenerator: ReportGenerator;

  constructor(options: BreakingChangesDetectorOptions) {
    this.options = options;
    this.packageDiscovery = new PackageDiscovery(options.workspaceRoot);
    this.extractorRunner = new ApiExtractorRunner(options.workspaceRoot);
    this.diffAnalyzer = new ApiDiffAnalyzer();
    this.versionAnalyzer = new VersionAnalyzer();
    this.suppressionManager = new SuppressionManager(options.config.suppressedChanges || []);
    this.reportGenerator = new ReportGenerator();

    if (options.config.storage) {
      this.storageManager = new StorageManager(options.config.storage);
    }
  }

  async detectBreakingChanges(): Promise<AnalysisResult> {
    console.log('[SNAPI] 🔍 Starting API breaking changes detection...');

    try {
      const packages = await this.discoverPackages();
      console.log(`[SNAPI] 📦 Found ${packages.length} packages to analyze`);

      console.log('[SNAPI] 📸 Generating current API snapshots...');
      const currentSnapshots = await this.generateCurrentSnapshots(packages);

      console.log('[SNAPI] 🌿 Fetching baseline snapshots...');
      const baselineSnapshots = await this.getBaselineSnapshots(packages);

      console.log('[SNAPI] 🔄 Analyzing API changes...');
      const packageAnalyses = await this.analyzePackageChanges(packages, currentSnapshots, baselineSnapshots);

      const suppressedAnalyses = this.applySuppressions(packageAnalyses);
      const result = this.buildAnalysisResult(suppressedAnalyses);

      console.log('[SNAPI] ✅ API breaking changes detection completed');
      return result;
    } catch (error) {
      console.error('[SNAPI] ❌ API breaking changes detection failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async discoverPackages(): Promise<PackageInfo[]> {
    return this.packageDiscovery.discoverPackages(this.options.config.packages, this.options.config.excludePackages);
  }

  async generateCurrentSnapshots(packages: PackageInfo[]): Promise<Map<string, string>> {
    const snapshotsDir = path.join(
      this.options.workspaceRoot,
      this.options.config.snapshotsDir || '.api-snapshots',
      'current',
    );
    await fs.ensureDir(snapshotsDir);
    const snapshots = new Map<string, string>();

    for (const pkg of packages) {
      try {
        const snapshotResult: ApiSnapshot = await this.extractorRunner.generateApiSnapshot({
          packageInfo: pkg,
          outputDir: snapshotsDir,
        });
        snapshots.set(pkg.name, snapshotResult.apiJsonPath);
        console.log(`[SNAPI] Generated current snapshot for ${pkg.name} at ${snapshotResult.apiJsonPath}`);
      } catch (error) {
        console.warn(
          `[SNAPI] Failed to generate snapshot for ${pkg.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    return snapshots;
  }

  async getBaselineSnapshots(packages: PackageInfo[]): Promise<Map<string, BaselineSnapshot>> {
    const baselineSnapshots = new Map<string, BaselineSnapshot>();
    console.log('[SNAPI] Loading baseline snapshots...');

    for (const pkg of packages) {
      let baseline: BaselineSnapshot | null = null;

      if (this.storageManager) {
        try {
          console.log(`[SNAPI] Attempting to load baseline for ${pkg.name} from StorageManager...`);
          baseline = await this.storageManager.getBaseline(pkg.name, this.options.config.mainBranch);
          if (baseline) {
            console.log(`[SNAPI] Successfully loaded baseline for ${pkg.name} from StorageManager.`);
          } else {
            console.log(`[SNAPI] StorageManager returned no baseline for ${pkg.name}.`);
          }
        } catch (error) {
          console.warn(
            `[SNAPI] Failed to get baseline for ${pkg.name} from StorageManager: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      if (!baseline) {
        console.log(
          `[SNAPI] Attempting to load baseline for ${pkg.name} directly from filesystem: ${path.join(
            this.options.config.snapshotsDir || '.api-snapshots',
            'baseline',
          )}`,
        );
        const safePackageName = pkg.name.startsWith('@')
          ? `@${pkg.name.substring(1).replace(/\//g, '__')}`
          : pkg.name.replace(/\//g, '__');
        const baselinePath = path.join(
          this.options.workspaceRoot,
          this.options.config.snapshotsDir || '.api-snapshots',
          'baseline',
          `${safePackageName}.api.json`,
        );

        if (await fs.pathExists(baselinePath)) {
          try {
            const metadataPath = baselinePath.replace('.api.json', '.metadata.json');
            let metadata: SnapshotMetadata;

            if (await fs.pathExists(metadataPath)) {
              metadata = await fs.readJson(metadataPath);
            } else {
              console.warn(`[SNAPI] No .metadata.json found for ${baselinePath}, creating placeholder metadata.`);
              const fileStats = await fs.stat(baselinePath);
              metadata = {
                packageName: pkg.name,
                commitHash: 'unknown-artifact-baseline',
                timestamp: fileStats.mtime.toISOString(),
                branch: this.options.config.mainBranch || 'main',
                version: pkg.version,
                fileSize: fileStats.size,
                checksum: '',
              };
            }

            baseline = {
              packageName: pkg.name,
              filePath: baselinePath,
              metadata,
            };
            console.log(`[SNAPI] Successfully loaded baseline for ${pkg.name} from filesystem: ${baselinePath}`);
          } catch (error) {
            console.warn(
              `[SNAPI] Error loading baseline or metadata for ${pkg.name} from filesystem path ${baselinePath}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        } else {
          console.warn(`[SNAPI] No baseline snapshot found for ${pkg.name} at filesystem path: ${baselinePath}`);
        }
      }

      if (baseline) {
        baselineSnapshots.set(pkg.name, baseline);
        console.log(`[SNAPI] Baseline for ${pkg.name} (commit: ${baseline.metadata.commitHash}) ready.`);
      } else {
        console.warn(
          `[SNAPI] No baseline found for ${pkg.name} using any method. It will be treated as a new package or all its APIs as new.`,
        );
      }
    }

    if (baselineSnapshots.size === 0 && packages.length > 0) {
      console.warn(
        '[SNAPI] No baseline snapshots could be loaded for any package. All packages will be treated as new, or all APIs as new.',
      );
    }
    return baselineSnapshots;
  }

  private async analyzePackageChanges(
    packages: PackageInfo[],
    currentSnapshots: Map<string, string>,
    baselineSnapshots: Map<string, BaselineSnapshot>,
  ): Promise<PackageAnalysis[]> {
    const analyses: PackageAnalysis[] = [];
    for (const pkg of packages) {
      const currentSnapshotPath = currentSnapshots.get(pkg.name);
      const baseline = baselineSnapshots.get(pkg.name);

      if (!currentSnapshotPath) {
        console.warn(`[SNAPI] Current snapshot missing for package: ${pkg.name}. Skipping analysis.`);
        continue;
      }

      let changes: ApiChange[] = [];
      let versionAnalysisResult: VersionBumpAnalysis;

      if (baseline) {
        changes = await this.diffAnalyzer.compareApiModels(currentSnapshotPath, baseline.filePath, pkg.name);
        if (this.options.config.checkVersionBump && baseline.metadata.version) {
          versionAnalysisResult = await this.versionAnalyzer.analyzeVersionBump(
            changes,
            pkg.version,
            baseline.metadata.version,
          );
        } else {
          versionAnalysisResult = {
            recommendedBump: this.versionAnalyzer.calculateRecommendedBump(changes),
            actualBump: undefined,
            isValid: true,
            reasons: ['Version bump check skipped or baseline version unavailable'],
          };
        }
      } else {
        console.warn(
          `[SNAPI] No baseline for ${pkg.name}, treating as new. Change detection for new packages may be incomplete.`,
        );
        changes = [];
        versionAnalysisResult = {
          recommendedBump: ChangeSeverity.MINOR,
          actualBump: undefined,
          isValid: true,
          reasons: ['New package, defaulting to minor bump recommendation'],
        };
      }

      const hasBreakingChanges = changes.some(c => c.severity === ChangeSeverity.MAJOR && !c.isSuppressed);

      analyses.push({
        packageName: pkg.name,
        version: {
          current: pkg.version,
          previous: baseline?.metadata.version || 'N/A',
        },
        changes,
        hasBreakingChanges,
        recommendedVersionBump: versionAnalysisResult.recommendedBump,
        actualVersionBump: versionAnalysisResult.actualBump,
        isValidBump: versionAnalysisResult.isValid,
      });
    }
    return analyses;
  }

  applySuppressions(packageAnalyses: PackageAnalysis[]): PackageAnalysis[] {
    return packageAnalyses.map(analysis => {
      const newChanges = analysis.changes.map(change => {
        const suppression = this.suppressionManager.getSuppression(analysis.packageName, change.id);
        if (suppression) {
          return { ...change, isSuppressed: true, suppressionReason: suppression.reason };
        }
        return change;
      });
      return {
        ...analysis,
        changes: newChanges,
        hasBreakingChanges: newChanges.some(c => c.severity === ChangeSeverity.MAJOR && !c.isSuppressed),
      };
    });
  }

  buildAnalysisResult(packageAnalyses: PackageAnalysis[]): AnalysisResult {
    let totalBreakingChanges = 0;
    let totalNonBreakingChanges = 0;
    let totalAdditions = 0;
    let packagesWithChanges = 0;

    for (const analysis of packageAnalyses) {
      if (analysis.changes.length > 0) packagesWithChanges++;
      for (const change of analysis.changes) {
        if (change.isSuppressed) continue;
        if (change.severity === ChangeSeverity.MAJOR) totalBreakingChanges++;
        else if (change.type === 'addition') totalAdditions++;
        else totalNonBreakingChanges++;
      }
    }

    const overallHasBreakingChanges = packageAnalyses.some(p => p.hasBreakingChanges);
    const ciShouldFail =
      (this.options.config.ci?.failOnBreakingChanges && overallHasBreakingChanges) ||
      packageAnalyses.some(p => this.options.config.checkVersionBump && p.isValidBump === false);

    return {
      packages: packageAnalyses,
      hasBreakingChanges: overallHasBreakingChanges,
      ciShouldFail,
      summary: {
        totalPackages: packageAnalyses.length,
        packagesWithChanges,
        breakingChanges: totalBreakingChanges,
        nonBreakingChanges: totalNonBreakingChanges,
        additions: totalAdditions,
      },
    };
  }

  async generateReport(result: AnalysisResult, format: 'markdown' | 'json' = 'markdown'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(result, null, 2);
    }
    return this.reportGenerator.generateMarkdownReport(result);
  }

  async cleanup(): Promise<void> {
    if (this.options.skipCleanup) {
      console.log('[SNAPI] Skipping cleanup of temporary files.');
      return;
    }
    const currentSnapshotsDir = path.join(
      this.options.workspaceRoot,
      this.options.config.snapshotsDir || '.api-snapshots',
      'current',
    );

    try {
      console.log(`[SNAPI] Attempting to remove current snapshots directory: ${currentSnapshotsDir}`);
      await fs.remove(currentSnapshotsDir);
      if (typeof this.extractorRunner.cleanup === 'function') {
        await this.extractorRunner.cleanup();
      }
      console.log('[SNAPI] Temporary files and current snapshots cleaned up.');
    } catch (error) {
      console.warn(`[SNAPI] Error during cleanup: ${error instanceof Error ? error.message : String(error)}`);
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
