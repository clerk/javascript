import fs from 'fs-extra';
import path from 'path';
import { PackageDiscovery } from '../utils/package-discovery.js';
import { ApiExtractorRunner } from '../utils/api-extractor.js';
import { ApiDiffAnalyzer } from '../analyzers/api-diff.js';
import { GitManager } from '../utils/git-manager.js';
import { VersionAnalyzer } from '../analyzers/version-analyzer.js';
import { ReportGenerator } from '../reporters/markdown-reporter.js';
import { SuppressionManager } from '../utils/suppression-manager.js';
import type { Config, PackageInfo, AnalysisResult, PackageAnalysis } from '../types.js';

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

  constructor(private options: DetectorOptions) {
    this.packageDiscovery = new PackageDiscovery(options.workspaceRoot);
    this.apiExtractor = new ApiExtractorRunner(options.workspaceRoot);
    this.diffAnalyzer = new ApiDiffAnalyzer();
    this.gitManager = new GitManager(options.workspaceRoot);
    this.versionAnalyzer = new VersionAnalyzer();
    this.reportGenerator = new ReportGenerator();
    this.suppressionManager = new SuppressionManager(options.config.suppressedChanges);
    this.snapshotsDir = path.resolve(options.workspaceRoot, options.config.snapshotsDir);
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
    // Check if we should use Git-stored baselines (for CI)
    if (this.options.config.ci?.baselineStorage === 'git') {
      return this.loadGitStoredBaseline(packages);
    }

    // Check if cache is valid first
    if (await this.isBaselineCacheValid()) {
      console.log('  📦 Using cached baseline snapshots...');
      return this.loadCachedBaseline(packages);
    }

    console.log(`  🔄 Generating fresh baseline snapshots from ${this.options.config.mainBranch}...`);

    const snapshots = new Map<string, string>();
    const baselineDir = path.join(this.snapshotsDir, 'baseline');

    // Generate fresh baseline snapshots from main branch
    console.log(`  Checking out ${this.options.config.mainBranch} branch...`);
    const currentBranch = await this.gitManager.getCurrentBranch();

    try {
      await this.gitManager.checkoutBranch(this.options.config.mainBranch);

      // Discover packages in main branch (they might be different)
      const mainPackages = await this.discoverPackages();

      await fs.ensureDir(baselineDir);

      for (const pkg of mainPackages) {
        try {
          console.log(`  Generating baseline snapshot for ${pkg.name}...`);
          const snapshot = await this.apiExtractor.generateApiSnapshot({
            packageInfo: pkg,
            outputDir: baselineDir,
          });
          snapshots.set(pkg.name, snapshot.apiJsonPath);
        } catch (error) {
          console.warn(`  ⚠️ Failed to generate baseline snapshot for ${pkg.name}:`, error);
        }
      }

      // Cache the baseline metadata
      await this.cacheBaselineMetadata();
    } finally {
      // Switch back to original branch
      await this.gitManager.checkoutBranch(currentBranch);
    }

    return snapshots;
  }

  private async loadGitStoredBaseline(packages: PackageInfo[]): Promise<Map<string, string>> {
    console.log('  📦 Loading Git-stored baseline snapshots...');
    const snapshots = new Map<string, string>();
    const baselineDir = this.options.config.ci?.baselinePath || path.join(this.snapshotsDir, 'baseline');

    for (const pkg of packages) {
      const snapshotPath = path.join(baselineDir, `${pkg.name.replace('/', '__')}.api.json`);
      if (await fs.pathExists(snapshotPath)) {
        snapshots.set(pkg.name, snapshotPath);
        console.log(`    ✅ Found baseline for ${pkg.name}`);
      } else {
        console.log(`    ⚠️ No baseline found for ${pkg.name} (new package?)`);
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

  private async isBaselineCacheValid(): Promise<boolean> {
    const cacheFile = path.join(this.snapshotsDir, '.baseline-cache.json');

    if (!(await fs.pathExists(cacheFile))) {
      return false;
    }

    try {
      const cache = await fs.readJson(cacheFile);
      const lastCommit = await this.gitManager.getLastCommit(this.options.config.mainBranch);

      return cache.lastCommit === lastCommit && cache.timestamp > Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    } catch {
      return false;
    }
  }

  private async loadCachedBaseline(packages: PackageInfo[]): Promise<Map<string, string>> {
    const snapshots = new Map<string, string>();
    const baselineDir = path.join(this.snapshotsDir, 'baseline');

    for (const pkg of packages) {
      const snapshotPath = path.join(baselineDir, `${pkg.name.replace('/', '__')}.api.json`);
      if (await fs.pathExists(snapshotPath)) {
        snapshots.set(pkg.name, snapshotPath);
      }
    }

    return snapshots;
  }

  private async cacheBaselineMetadata(): Promise<void> {
    const cacheFile = path.join(this.snapshotsDir, '.baseline-cache.json');
    const lastCommit = await this.gitManager.getLastCommit(this.options.config.mainBranch);

    await fs.writeJson(cacheFile, {
      lastCommit,
      timestamp: Date.now(),
      branch: this.options.config.mainBranch,
    });
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
    } catch (error) {
      console.warn('⚠️ Cleanup failed:', error);
    }
  }
}
