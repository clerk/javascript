#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import * as path from 'path';

import { BreakingChangesDetector } from './core/detector.js';
import { type Config, ConfigSchema } from './types.js';

const program = new Command();

program
  .name('snapi')
  .description('Snapshot API (SNAPI) - Detect breaking changes in TypeScript package APIs')
  .version('1.0.0');

program
  .command('detect')
  .description('Detect API breaking changes')
  .option('-c, --config <path>', 'Path to configuration file', 'snapi.config.json')
  .option('-o, --output <path>', 'Output path for report')
  .option('--format <format>', 'Output format (markdown|json)', 'markdown')
  .option('--workspace <path>', 'Workspace root path', process.cwd())
  .option('--main-branch <branch>', 'Main branch name', 'main')
  .option('--no-version-check', 'Skip version bump validation')
  .option('--fail-on-breaking', 'Exit with error code if breaking changes detected')
  .action(
    async (options: {
      config: string;
      output?: string;
      format: 'markdown' | 'json';
      workspace: string;
      mainBranch: string;
      noVersionCheck?: boolean;
      failOnBreaking?: boolean;
    }) => {
      try {
        const config = await loadConfig(options.config, options);
        const detector = new BreakingChangesDetector({
          workspaceRoot: options.workspace,
          config,
        });

        console.log(chalk.blue('🔍 Starting API breaking changes detection...'));

        const result = await detector.detectBreakingChanges();
        const report = await detector.generateReport(result, options.format);

        // Output report
        if (options.output) {
          await fs.writeFile(options.output, report);
          console.log(chalk.green(`📄 Report saved to ${options.output}`));
        } else {
          console.log('\n' + report);
        }

        // Exit codes
        if (options.failOnBreaking && result.hasBreakingChanges) {
          console.error(chalk.red('💥 Breaking changes detected!'));
          process.exit(1);
        }

        if (result.ciShouldFail) {
          console.error(chalk.red('❌ CI validation failed - version bumps required'));
          process.exit(1);
        }

        console.log(chalk.green('✅ API breaking changes detection completed successfully'));
      } catch (error) {
        console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    },
  );

program
  .command('snapshot')
  .description('Generate API snapshots without comparison')
  .option('-c, --config <path>', 'Path to configuration file', 'snapi.config.json')
  .option('-o, --output <path>', 'Output directory for snapshots')
  .option('--workspace <path>', 'Workspace root path', process.cwd())
  .option('--no-cleanup', 'Skip cleanup of temporary files (useful for caching)')
  .action(async (options: { config: string; output?: string; workspace: string; cleanup?: boolean }) => {
    try {
      const config = await loadConfig(options.config, {});

      // Override snapshots directory if provided
      if (options.output) {
        config.snapshotsDir = options.output;
      }

      const detector = new BreakingChangesDetector({
        workspaceRoot: options.workspace,
        config,
        skipCleanup: !options.cleanup,
      });

      console.log(chalk.blue('📸 Starting API snapshot generation...'));

      // Discover packages
      const packages = await detector.discoverPackages();
      console.log(chalk.blue(`📦 Found ${packages.length} packages to snapshot`));

      // Generate snapshots only
      const snapshots = await detector.generateCurrentSnapshots(packages);

      console.log(`DEBUG: options.cleanup = ${options.cleanup}`);
      console.log(`DEBUG: !options.cleanup = ${!options.cleanup}`);

      // Clean up temporary files unless --no-cleanup is specified
      if (options.cleanup) {
        console.log('DEBUG: Calling cleanup because options.cleanup is true');
        await detector.cleanup();
      } else {
        console.log('DEBUG: Skipping cleanup because options.cleanup is false (--no-cleanup was used)');
      }

      console.log(chalk.green(`✅ Generated ${snapshots.size} API snapshots`));

      // List what was created
      for (const [packageName, snapshotPath] of snapshots) {
        console.log(chalk.gray(`  📄 ${packageName}: ${snapshotPath}`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize configuration file')
  .option('-o, --output <path>', 'Output path for config file', 'snapi.config.json')
  .action(async (options: { output: string }) => {
    try {
      const defaultConfig: Config = {
        excludePackages: [],
        snapshotsDir: '.api-snapshots',
        mainBranch: 'main',
        checkVersionBump: true,
        suppressedChanges: [],
        enableLLMAnalysis: false,
        llmProvider: 'openai',
      };

      await fs.writeJson(options.output, defaultConfig, { spaces: 2 });
      console.log(chalk.green(`✅ Configuration file created at ${options.output}`));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('suppress')
  .description('Add a suppression for a specific change')
  .requiredOption('-p, --package <name>', 'Package name')
  .requiredOption('-i, --change-id <id>', 'Change ID to suppress')
  .requiredOption('-r, --reason <reason>', 'Reason for suppression')
  .option('-d, --days <days>', 'Days until suppression expires', '0')
  .option('-c, --config <path>', 'Path to configuration file', 'snapi.config.json')
  .action(async (options: { package: string; changeId: string; reason: string; days: string; config: string }) => {
    try {
      const configPath = path.resolve(options.config);
      let config: Config;

      if (await fs.pathExists(configPath)) {
        config = await fs.readJson(configPath);
      } else {
        console.log(chalk.yellow('⚠️ Config file not found, creating new one'));
        config = {
          excludePackages: [],
          snapshotsDir: '.api-snapshots',
          mainBranch: 'main',
          checkVersionBump: true,
          suppressedChanges: [],
          enableLLMAnalysis: false,
          llmProvider: 'openai',
        };
      }

      // Add suppression
      const expires =
        parseInt(options.days) > 0
          ? new Date(Date.now() + parseInt(options.days) * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

      config.suppressedChanges.push({
        package: options.package,
        changeId: options.changeId,
        reason: options.reason,
        expires,
      });

      await fs.writeJson(configPath, config, { spaces: 2 });
      console.log(chalk.green(`✅ Suppression added for ${options.package}:${options.changeId}`));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('cleanup')
  .description('Clean up expired suppressions and temporary files')
  .option('-c, --config <path>', 'Path to configuration file', 'snapi.config.json')
  .option('--workspace <path>', 'Workspace root path', process.cwd())
  .action(async (options: { config: string; workspace: string }) => {
    try {
      const configPath = path.resolve(options.config);

      if (await fs.pathExists(configPath)) {
        const config: Config = await fs.readJson(configPath);

        // Remove expired suppressions
        const now = new Date();
        const validSuppressions = config.suppressedChanges.filter((suppression: { expires?: string }) => {
          if (!suppression.expires) return true;
          return new Date(suppression.expires) > now;
        });

        const removedCount = config.suppressedChanges.length - validSuppressions.length;

        if (removedCount > 0) {
          config.suppressedChanges = validSuppressions;
          await fs.writeJson(configPath, config, { spaces: 2 });
          console.log(chalk.green(`✅ Removed ${removedCount} expired suppression(s)`));
        } else {
          console.log(chalk.blue('ℹ️ No expired suppressions found'));
        }
      }

      // Clean up snapshots
      const snapshotsDir = path.join(options.workspace, '.api-snapshots');
      if (await fs.pathExists(snapshotsDir)) {
        const currentDir = path.join(snapshotsDir, 'current');
        if (await fs.pathExists(currentDir)) {
          await fs.remove(currentDir);
          console.log(chalk.green('✅ Cleaned up temporary snapshots'));
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Add storage commands
program
  .command('storage')
  .description('Storage management commands')
  .addCommand(
    new Command('health')
      .description('Check storage backend health')
      .option('-c, --config <path>', 'Configuration file path', 'snapi.config.json')
      .action(async options => {
        try {
          const configPath = path.resolve(process.cwd(), options.config);
          const config = await loadConfig(configPath);

          if (!config.storage) {
            console.log('❌ No storage configuration found');
            process.exit(1);
          }

          const { StorageManager } = await import('./storage/storage-manager.js');
          const storageManager = new StorageManager(config.storage);

          console.log('🔍 Checking storage health...\n');

          const healthStatus = await storageManager.getHealthStatus();

          for (const health of healthStatus) {
            const status = health.healthy ? '✅' : '❌';
            const latency = health.latency ? ` (${health.latency}ms)` : '';
            console.log(`${status} ${health.backend}${latency}`);

            if (health.error) {
              console.log(`   Error: ${health.error}`);
            }

            if (health.lastCheck) {
              console.log(`   Last check: ${health.lastCheck.toISOString()}`);
            }
          }

          await storageManager.shutdown();
        } catch (error) {
          console.error('❌ Storage health check failed:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('stats')
      .description('Get storage statistics')
      .option('-c, --config <path>', 'Configuration file path', 'snapi.config.json')
      .action(async options => {
        try {
          const configPath = path.resolve(process.cwd(), options.config);
          const config = await loadConfig(configPath);

          if (!config.storage) {
            console.log('❌ No storage configuration found');
            process.exit(1);
          }

          const { StorageManager } = await import('./storage/storage-manager.js');
          const storageManager = new StorageManager(config.storage);

          console.log('📊 Getting storage statistics...\n');

          const stats = await storageManager.getStats();

          console.log(`Total Size: ${formatBytes(stats.totalSize)}`);
          console.log(`Snapshot Count: ${stats.snapshotCount}`);
          console.log(`Oldest Snapshot: ${stats.oldestSnapshot || 'N/A'}`);
          console.log(`Newest Snapshot: ${stats.newestSnapshot || 'N/A'}\n`);

          console.log('Backend Details:');
          for (const backend of stats.backendStats) {
            const status = backend.healthy ? '✅' : '❌';
            console.log(`${status} ${backend.backend}`);

            if (backend.stats) {
              console.log(`   Size: ${formatBytes(backend.stats.totalSize)}`);
              console.log(`   Count: ${backend.stats.snapshotCount}`);
            }
          }

          await storageManager.shutdown();
        } catch (error) {
          console.error('❌ Failed to get storage stats:', error);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command('cleanup')
      .description('Clean up old snapshots')
      .option('-c, --config <path>', 'Configuration file path', 'snapi.config.json')
      .option('-d, --days <days>', 'Retention period in days', '30')
      .action(async options => {
        try {
          const configPath = path.resolve(process.cwd(), options.config);
          const config = await loadConfig(configPath);

          if (!config.storage) {
            console.log('❌ No storage configuration found');
            process.exit(1);
          }

          const { StorageManager } = await import('./storage/storage-manager.js');
          const storageManager = new StorageManager(config.storage);

          const days = parseInt(options.days);
          console.log(`🧹 Cleaning up snapshots older than ${days} days...`);

          await storageManager.cleanup(days);

          console.log('✅ Cleanup completed');
          await storageManager.shutdown();
        } catch (error) {
          console.error('❌ Cleanup failed:', error);
          process.exit(1);
        }
      }),
  );

async function loadConfig(
  configPath: string,
  cliOptions?: {
    mainBranch?: string;
    noVersionCheck?: boolean;
  },
): Promise<Config> {
  let config: Partial<Config> = {};

  // Load from file if it exists
  const resolvedConfigPath = path.resolve(configPath);
  if (await fs.pathExists(resolvedConfigPath)) {
    const fileConfig = await fs.readJson(resolvedConfigPath);
    config = { ...fileConfig };
  }

  // Override with CLI options if provided
  if (cliOptions?.mainBranch) {
    config.mainBranch = cliOptions.mainBranch;
  }
  if (cliOptions?.noVersionCheck) {
    config.checkVersionBump = false;
  }

  // Parse environment variables
  if (process.env.GITHUB_TOKEN) {
    config.githubToken = process.env.GITHUB_TOKEN;
  }
  if (process.env.OPENAI_API_KEY) {
    config.llmApiKey = process.env.OPENAI_API_KEY;
    config.enableLLMAnalysis = true;
  }
  if (process.env.ANTHROPIC_API_KEY) {
    config.llmApiKey = process.env.ANTHROPIC_API_KEY;
    config.llmProvider = 'anthropic';
    config.enableLLMAnalysis = true;
  }

  // Validate configuration
  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    throw new Error(`Invalid configuration: ${error instanceof Error ? error.message : error}`);
  }
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Run the CLI
program.parse();
