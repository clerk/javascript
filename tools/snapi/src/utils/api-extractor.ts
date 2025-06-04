import { Extractor, ExtractorConfig, ExtractorLogLevel } from '@microsoft/api-extractor';
import fs from 'fs-extra';
import { globby } from 'globby';
import path from 'path';

import type { ApiSnapshot, PackageInfo } from '../types.js';

export interface ExtractorOptions {
  packageInfo: PackageInfo;
  outputDir: string;
  tempDir?: string;
}

/**
 * Handles API Extractor operations for generating .api.json files
 */
export class ApiExtractorRunner {
  private tempConfigDir: string;

  constructor(private workspaceRoot: string) {
    this.tempConfigDir = path.join(workspaceRoot, '.tmp/api-extractor');
  }

  async generateApiSnapshot(options: ExtractorOptions): Promise<ApiSnapshot> {
    const { packageInfo, outputDir } = options;

    await fs.ensureDir(outputDir);
    await fs.ensureDir(this.tempConfigDir);

    const configPath = await this.createExtractorConfig(packageInfo);
    const apiJsonPath = path.join(outputDir, `${packageInfo.name.replace('/', '__')}.api.json`);

    try {
      const extractorConfig = ExtractorConfig.loadFileAndPrepare(configPath);
      const extractorResult = Extractor.invoke(extractorConfig, {
        localBuild: true,
        showVerboseMessages: false,
        messageCallback: message => {
          // Filter out common warnings that aren't actionable
          if (message.logLevel === ExtractorLogLevel.Warning) {
            // Log warnings but don't fail the build
            console.warn(`API Extractor [${packageInfo.name}]:`, message.text);
          }
        },
      });

      if (!extractorResult.succeeded) {
        throw new Error(`API Extractor failed for ${packageInfo.name}`);
      }

      // Move the generated .api.json to our desired location
      const generatedApiJsonPath = path.join(packageInfo.path, 'temp', `${path.basename(packageInfo.name)}.api.json`);

      console.log(`  Looking for generated file at: ${generatedApiJsonPath}`);
      if (await fs.pathExists(generatedApiJsonPath)) {
        console.log(`  Moving file to: ${apiJsonPath}`);
        await fs.ensureDir(path.dirname(apiJsonPath));
        await fs.move(generatedApiJsonPath, apiJsonPath, { overwrite: true });
        console.log(`  File moved successfully`);

        // Verify the file exists after move
        if (await fs.pathExists(apiJsonPath)) {
          console.log(`  ✅ File verified at destination: ${apiJsonPath}`);
        } else {
          console.error(`  ❌ File missing after move: ${apiJsonPath}`);
        }
      } else {
        console.warn(`  Generated API file not found at: ${generatedApiJsonPath}`);
      }

      return {
        packageName: packageInfo.name,
        version: packageInfo.version,
        timestamp: new Date().toISOString(),
        apiJsonPath,
        extractorConfigPath: configPath,
      };
    } catch (error) {
      throw new Error(`Failed to generate API snapshot for ${packageInfo.name}: ${error}`);
    }
  }

  private async createExtractorConfig(packageInfo: PackageInfo): Promise<string> {
    const configFileName = `api-extractor-${packageInfo.name.replace('/', '__')}.json`;
    const configPath = path.join(this.tempConfigDir, configFileName);

    // Find the main entrypoint (prioritize index.ts or the first entrypoint)
    const mainEntrypoint = this.findMainEntrypoint(packageInfo.entrypoints);

    if (!mainEntrypoint) {
      throw new Error(`No valid entrypoint found for ${packageInfo.name}`);
    }

    // Generate TypeScript declaration first if needed
    const dtsPath = await this.ensureDeclarationFile(packageInfo, mainEntrypoint);

    const config = {
      $schema: 'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json',

      projectFolder: packageInfo.path,

      mainEntryPointFilePath: dtsPath,

      bundledPackages: [],

      compiler: {
        tsconfigFilePath: await this.findTsConfig(packageInfo.path),
      },

      apiReport: {
        enabled: false, // We only need the .api.json file
      },

      docModel: {
        enabled: true,
        apiJsonFilePath: path.join(packageInfo.path, 'temp', `${path.basename(packageInfo.name)}.api.json`),
      },

      dtsRollup: {
        enabled: false, // Not needed for our use case
      },

      tsdocMetadata: {
        enabled: false,
      },

      messages: {
        compilerMessageReporting: {
          default: {
            logLevel: 'warning',
          },
        },
        extractorMessageReporting: {
          default: {
            logLevel: 'warning',
          },
          'ae-missing-release-tag': {
            logLevel: 'none', // Too noisy for our use case
          },
          'ae-unresolved-link': {
            logLevel: 'none', // Common in monorepos
          },
        },
        tsdocMessageReporting: {
          default: {
            logLevel: 'none', // Focus on API changes, not docs
          },
        },
      },
    };

    await fs.writeJson(configPath, config, { spaces: 2 });
    return configPath;
  }

  private findMainEntrypoint(entrypoints: string[]): string | null {
    // Priority: index.ts > index.tsx > first available
    const priorities = ['index.ts', 'index.tsx'];

    for (const priority of priorities) {
      const found = entrypoints.find(ep => ep.endsWith(priority));
      if (found) return found;
    }

    return entrypoints[0] || null;
  }

  private async ensureDeclarationFile(packageInfo: PackageInfo, entrypoint: string): Promise<string> {
    // Check if we already have a .d.ts file
    const dtsFile = entrypoint.replace(/\.tsx?$/, '.d.ts');
    if (await fs.pathExists(dtsFile)) {
      return dtsFile;
    }

    // For source files, we'll need to generate declarations
    // This is a simplified approach - in practice, you might want to run tsc
    const relativePath = path.relative(packageInfo.path, entrypoint);
    const tempDtsPath = path.join(packageInfo.path, 'temp', relativePath.replace(/\.tsx?$/, '.d.ts'));

    await fs.ensureDir(path.dirname(tempDtsPath));

    // Generate a minimal .d.ts file by running TypeScript compiler
    await this.generateDeclarations(packageInfo.path, entrypoint, tempDtsPath);

    return tempDtsPath;
  }

  private async generateDeclarations(packagePath: string, sourceFile: string, outputFile: string): Promise<void> {
    const { execSync } = await import('child_process');

    try {
      // Run TypeScript compiler to generate declarations
      const tsconfigPath = await this.findTsConfig(packagePath);
      const command = `npx tsc --declaration --emitDeclarationOnly --outDir ${path.dirname(outputFile)} ${sourceFile} --project ${tsconfigPath}`;

      execSync(command, {
        cwd: packagePath,
        stdio: 'pipe', // Suppress output unless there's an error
      });
    } catch {
      // Fallback: create a basic declaration file
      console.warn(`Failed to generate declarations for ${sourceFile}, creating fallback`);
      await fs.writeFile(outputFile, `// Generated declaration file\nexport * from '${sourceFile}';\n`);
    }
  }

  private async findTsConfig(packagePath: string): Promise<string> {
    const candidates = [
      'tsconfig.json',
      'tsconfig.build.json',
      '../tsconfig.json', // Check parent directory
      '../../tsconfig.json', // Check workspace root
    ];

    for (const candidate of candidates) {
      const tsconfigPath = path.resolve(packagePath, candidate);
      if (await fs.pathExists(tsconfigPath)) {
        return tsconfigPath;
      }
    }

    // Create a minimal tsconfig.json as fallback
    const fallbackPath = path.join(packagePath, 'tsconfig.temp.json');
    const fallbackConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
        declaration: true,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ['src/**/*', '*.ts', '*.tsx'],
      exclude: ['node_modules', 'dist', 'build'],
    };

    await fs.writeJson(fallbackPath, fallbackConfig, { spaces: 2 });
    return fallbackPath;
  }

  async cleanup(): Promise<void> {
    // Clean up temporary configuration files
    if (await fs.pathExists(this.tempConfigDir)) {
      await fs.remove(this.tempConfigDir);
    }

    // Clean up temp directories in packages using globby
    const tempDirs = await globby('packages/*/temp', {
      cwd: this.workspaceRoot,
      absolute: true,
      onlyDirectories: true,
    });

    for (const tempDir of tempDirs) {
      await fs.remove(tempDir);
    }
  }
}
