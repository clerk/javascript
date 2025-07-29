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
    const configFileName = `api-extractor-${packageInfo.name.replace(/\//g, '__')}.json`;
    const configPath = path.join(this.tempConfigDir, configFileName);

    const mainSourceEntrypoint = this.findMainEntrypoint(packageInfo.entrypoints);
    if (!mainSourceEntrypoint) {
      throw new Error(`No valid source entrypoint found for ${packageInfo.name}: ${mainSourceEntrypoint}`);
    }

    // Get the declaration file path - this is the path to our generated .d.ts
    const mainEntryDtsPath = await this.ensureDeclarationFile(packageInfo, mainSourceEntrypoint);
    console.log(`[SNAPI Debug] Temp DTS Path from declarations: ${mainEntryDtsPath}`);
    console.log(`[SNAPI Debug] Main Entry DTS Path for API Extractor: ${mainEntryDtsPath}`);

    // Ensure the path is correctly formatted for API Extractor
    // This is a full replacement of the normalization logic to address persistent issues
    // First, ensure the path is absolute and normalized
    const absolutePath = path.isAbsolute(mainEntryDtsPath)
      ? mainEntryDtsPath
      : path.join(packageInfo.path, mainEntryDtsPath);

    // Remove all extensions and add a single .d.ts
    let pathWithoutExt = absolutePath;
    const exts = ['.d.ts', '.ts', '.tsx', '.js', '.jsx'];

    // Remove any extensions we recognize
    for (const ext of exts) {
      if (pathWithoutExt.endsWith(ext)) {
        pathWithoutExt = pathWithoutExt.slice(0, -ext.length);
        break; // Stop after removing the first extension
      }
    }

    // Add a single .d.ts extension
    const normalizedPath = `${pathWithoutExt}.d.ts`;

    console.log(`[SNAPI Debug] Path without extension: ${pathWithoutExt}`);
    console.log(`[SNAPI Debug] Normalized Main Entry DTS Path: ${normalizedPath}`);

    // Check if we fixed the issue
    if (normalizedPath.includes('.d.d.ts')) {
      console.error(`[SNAPI Error] Failed to fix double .d.ts extension: ${normalizedPath}`);
    }

    const apiJsonOutputName = `${packageInfo.name.replace(/\//g, '__')}.api.json`;
    const apiJsonTempPathInPackage = path.join('temp', apiJsonOutputName); // Relative to packageInfo.path

    // Customize the message reporting based on the package name
    // For nextjs, we need to ignore wrong-input-file-type errors
    const extractorMessageReporting: Record<string, { logLevel: ExtractorLogLevel; addToApiReportFile?: boolean }> = {
      default: { logLevel: ExtractorLogLevel.Warning },
      'ae-missing-release-tag': { logLevel: ExtractorLogLevel.None },
      'ae-unresolved-link': { logLevel: ExtractorLogLevel.None },
    };

    // For nextjs package, suppress wrong-input-file-type errors
    if (packageInfo.name === '@clerk/nextjs') {
      console.log(`[SNAPI Debug] Adding special handling for @clerk/nextjs package`);
      extractorMessageReporting['ae-wrong-input-file-type'] = {
        logLevel: ExtractorLogLevel.None,
        addToApiReportFile: false,
      };
    } else {
      extractorMessageReporting['ae-wrong-input-file-type'] = {
        logLevel: ExtractorLogLevel.Error,
        addToApiReportFile: true,
      };
    }

    const config = {
      $schema: 'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json',
      projectFolder: packageInfo.path,
      mainEntryPointFilePath: normalizedPath,
      bundledPackages: [],

      compiler: {
        tsconfigFilePath: await this.findTsConfig(packageInfo.path),
      },

      apiReport: {
        enabled: false, // We only need the .api.json file
      },

      docModel: {
        enabled: true,
        apiJsonFilePath: apiJsonTempPathInPackage,
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
        extractorMessageReporting: extractorMessageReporting,
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

  private async ensureDeclarationFile(packageInfo: PackageInfo, sourceEntrypoint: string): Promise<string> {
    const tempDtsPath = await this.generateDeclarations(packageInfo, sourceEntrypoint);
    console.log(`[SNAPI Debug] Temp DTS Path from declarations: ${tempDtsPath}`);
    return tempDtsPath;
  }

  private async generateDeclarations(packageInfo: PackageInfo, sourceEntrypoint: string): Promise<string> {
    // First, try to find existing declarations in the dist directory
    const distDir = path.join(packageInfo.path, 'dist');
    const typesDir = path.join(packageInfo.path, 'dist', 'types');

    // Look for declarations in both dist and dist/types
    const possibleDirs = [distDir, typesDir];

    for (const dir of possibleDirs) {
      if (await fs.pathExists(dir)) {
        // Convert source entrypoint to a relative path if it's absolute
        const relativeEntrypoint = path.isAbsolute(sourceEntrypoint)
          ? path.relative(packageInfo.path, sourceEntrypoint)
          : sourceEntrypoint;

        // Remove any extensions to find the base name
        const baseName = relativeEntrypoint.replace(/\.(tsx?|d\.ts)$/i, '');

        // Look for the declaration file in the dist directory
        const possiblePaths = [
          path.join(dir, baseName + '.d.ts'),
          path.join(dir, baseName, 'index.d.ts'),
          path.join(dir, 'index.d.ts'),
        ];

        for (const possiblePath of possiblePaths) {
          if (await fs.pathExists(possiblePath)) {
            console.log(`[SNAPI] Found existing declaration file at: ${possiblePath}`);
            return possiblePath;
          }
        }
      }
    }

    // If no existing declarations are found, create a stub
    console.warn(`[SNAPI] No existing declaration files found for ${packageInfo.name}. Creating stub.`);

    const tempDtsRoot = path.join(packageInfo.path, 'temp', 'dts');
    await fs.ensureDir(tempDtsRoot);

    const relativeEntrypoint = path.isAbsolute(sourceEntrypoint)
      ? path.relative(packageInfo.path, sourceEntrypoint)
      : sourceEntrypoint;

    const sourceWithoutExtension = relativeEntrypoint.replace(/\.(tsx?|d\.ts)$/i, '');
    const outputEntryDtsPath = path.join(tempDtsRoot, sourceWithoutExtension + '.d.ts');

    await this.generateStubDtsFile(outputEntryDtsPath, sourceEntrypoint, packageInfo);

    if (await fs.pathExists(outputEntryDtsPath)) {
      console.log(`[SNAPI] ✅ Stub DTS created for ${packageInfo.name} at ${outputEntryDtsPath}`);
      return outputEntryDtsPath;
    }

    throw new Error(
      `[SNAPI] Failed to find or create declaration file for ${packageInfo.name}. Target ${outputEntryDtsPath} could not be created.`,
    );
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

  private async generateStubDtsFile(
    outputPath: string,
    sourceEntrypoint: string,
    packageInfo: PackageInfo,
  ): Promise<void> {
    // Ensure we're using a clean path with proper extension
    let finalOutputPath = outputPath;

    // Remove any existing .d.ts extension
    const exts = ['.d.ts', '.ts', '.tsx', '.js', '.jsx'];
    for (const ext of exts) {
      if (finalOutputPath.endsWith(ext)) {
        finalOutputPath = finalOutputPath.slice(0, -ext.length);
        break; // Stop after removing the first extension
      }
    }

    // Add a single .d.ts extension
    finalOutputPath += '.d.ts';

    console.log(`[SNAPI Debug] Creating stub declaration: ${finalOutputPath}`);
    await fs.ensureDir(path.dirname(finalOutputPath));

    // For the import, use a simpler approach that will work in most cases
    // Extract just the filename without any extension
    const sourceFileName = path.basename(sourceEntrypoint).replace(/\.(d\.ts|tsx?|jsx?)$/i, '');

    // Create a stub that doesn't rely on complex relative paths
    const stubContent = `// Fallback SNAPI generated declaration file for ${packageInfo.name}
// This is a minimal stub created because TypeScript declaration generation failed
export * from './${sourceFileName}';
export {}; // Ensures it's treated as a module
`;

    await fs.writeFile(finalOutputPath, stubContent);
    console.log(`[SNAPI Debug] Generated stub with content:\n${stubContent}`);
  }
}
