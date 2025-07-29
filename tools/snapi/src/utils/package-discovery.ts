import fs from 'fs-extra';
import { globby } from 'globby';
import path from 'path';

import type { PackageInfo } from '../types.js';

interface PackageJson {
  name: string;
  version: string;
  exports?: Record<string, any>;
  main?: string;
  module?: string;
  types?: string;
  private?: boolean;
}

/**
 * Discovers packages in the monorepo and extracts their public API entrypoints
 */
export class PackageDiscovery {
  constructor(private workspaceRoot: string) {}

  async discoverPackages(includePackages?: string[], excludePackages: string[] = []): Promise<PackageInfo[]> {
    const packagePaths = await this.findPackageDirectories();
    const packages: PackageInfo[] = [];

    for (const packagePath of packagePaths) {
      try {
        const packageInfo = await this.analyzePackage(packagePath);

        if (!packageInfo) continue;

        // Skip private packages
        if (await this.isPrivatePackage(packagePath)) continue;

        // Apply filters
        if (includePackages && !includePackages.includes(packageInfo.name)) continue;
        if (excludePackages.includes(packageInfo.name)) continue;

        packages.push(packageInfo);
      } catch (error) {
        console.warn(`Failed to analyze package at ${packagePath}:`, error);
      }
    }

    return packages;
  }

  private async findPackageDirectories(): Promise<string[]> {
    // Look for packages based on workspace configuration
    const workspacePatterns = await this.getWorkspacePatterns();
    const packageJsonPaths = await globby(
      workspacePatterns.map(pattern => `${pattern}/package.json`),
      { cwd: this.workspaceRoot, absolute: true },
    );

    return packageJsonPaths.map(p => path.dirname(p));
  }

  private async getWorkspacePatterns(): Promise<string[]> {
    // Check for pnpm-workspace.yaml
    const pnpmWorkspace = path.join(this.workspaceRoot, 'pnpm-workspace.yaml');
    if (await fs.pathExists(pnpmWorkspace)) {
      const yaml = await import('yaml');
      const content = await fs.readFile(pnpmWorkspace, 'utf8');
      const config = yaml.parse(content);
      return config.packages || [];
    }

    // Check for package.json workspaces
    const rootPackageJson = path.join(this.workspaceRoot, 'package.json');
    if (await fs.pathExists(rootPackageJson)) {
      const pkg = await fs.readJson(rootPackageJson);
      if (pkg.workspaces) {
        return Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces.packages || [];
      }
    }

    // Default fallback
    return ['packages/*'];
  }

  private async analyzePackage(packagePath: string): Promise<PackageInfo | null> {
    const packageJsonPath = path.join(packagePath, 'package.json');

    if (!(await fs.pathExists(packageJsonPath))) {
      return null;
    }

    const packageJson: PackageJson = await fs.readJson(packageJsonPath);

    if (!packageJson.name || !packageJson.version) {
      return null;
    }

    const entrypoints = await this.extractEntrypoints(packagePath, packageJson);

    if (entrypoints.length === 0) {
      return null; // No TypeScript entrypoints found
    }

    return {
      name: packageJson.name,
      version: packageJson.version,
      path: packagePath,
      entrypoints,
      hasExportsField: !!packageJson.exports,
    };
  }

  private async extractEntrypoints(packagePath: string, packageJson: PackageJson): Promise<string[]> {
    const entrypoints: string[] = [];

    // Priority 1: exports field (modern approach)
    if (packageJson.exports) {
      const exportEntrypoints = this.extractFromExports(packageJson.exports, packagePath);
      // Filter to ensure only strings are added
      entrypoints.push(...exportEntrypoints.filter(ep => typeof ep === 'string'));
    }

    // Priority 2: traditional fields (fallback)
    if (entrypoints.length === 0) {
      const traditionalEntrypoints = await this.extractTraditionalEntrypoints(packagePath, packageJson);
      // Filter to ensure only strings are added
      entrypoints.push(...traditionalEntrypoints.filter(ep => typeof ep === 'string'));
    }

    // Filter for TypeScript source files and validate they exist
    const validEntrypoints: string[] = [];

    for (const entrypoint of entrypoints) {
      // Double-check that entrypoint is a string
      if (typeof entrypoint === 'string') {
        const tsPath = await this.findTypeScriptSource(packagePath, entrypoint);
        if (tsPath) {
          validEntrypoints.push(tsPath);
        }
      }
    }

    return [...new Set(validEntrypoints)]; // Remove duplicates
  }

  private extractFromExports(exports: Record<string, any>, _packagePath: string): string[] {
    const entrypoints: string[] = [];

    const processExportValue = (value: any) => {
      if (typeof value === 'string') {
        entrypoints.push(value);
      } else if (typeof value === 'object' && value !== null) {
        // Handle conditional exports
        if (typeof value.types === 'string') entrypoints.push(value.types);
        if (typeof value.import === 'string') entrypoints.push(value.import);
        if (typeof value.require === 'string') entrypoints.push(value.require);
        if (typeof value.default === 'string') entrypoints.push(value.default);

        // For nested objects like { import: { types: "...", default: "..." } }
        if (typeof value.import === 'object' && value.import !== null) {
          if (typeof value.import.types === 'string') entrypoints.push(value.import.types);
          if (typeof value.import.default === 'string') entrypoints.push(value.import.default);
        }
        if (typeof value.require === 'object' && value.require !== null) {
          if (typeof value.require.types === 'string') entrypoints.push(value.require.types);
          if (typeof value.require.default === 'string') entrypoints.push(value.require.default);
        }
      }
    };

    Object.entries(exports).forEach(([key, value]) => {
      // Skip non-public exports
      if (key.startsWith('./internal') || key === './package.json') return;

      processExportValue(value);
    });

    return entrypoints;
  }

  private async extractTraditionalEntrypoints(_packagePath: string, packageJson: PackageJson): Promise<string[]> {
    const entrypoints: string[] = [];

    // Check traditional fields
    if (packageJson.types) entrypoints.push(packageJson.types);
    if (packageJson.main) entrypoints.push(packageJson.main);
    if (packageJson.module) entrypoints.push(packageJson.module);

    return entrypoints;
  }

  private async findTypeScriptSource(packagePath: string, entrypoint: string): Promise<string | null> {
    // Ensure entrypoint is a string (safety check)
    if (typeof entrypoint !== 'string') {
      console.warn(`Warning: Non-string entrypoint passed to findTypeScriptSource: ${typeof entrypoint}`, entrypoint);
      return null;
    }

    // Remove leading ./
    const cleanPath = entrypoint.replace(/^\.\//, '');

    // If it's already a .ts file
    if (cleanPath.endsWith('.ts') || cleanPath.endsWith('.tsx')) {
      const fullPath = path.join(packagePath, cleanPath);
      if (await fs.pathExists(fullPath)) {
        return fullPath;
      }
    }

    // Try to find corresponding TypeScript source
    const possibleSources = [
      cleanPath.replace(/\.d\.(m?ts)$/, '.$1'), // .d.ts -> .ts
      cleanPath.replace(/\.(m?js)$/, '.$1'), // .js -> .ts
      cleanPath.replace(/\.js$/, '.ts'),
      cleanPath.replace(/\.mjs$/, '.mts'),
      path.join('src', cleanPath.replace(/\.d\.(m?ts)$/, '.$1')),
      path.join('src', cleanPath.replace(/\.(m?js)$/, '.$1')),
      path.join('src', 'index.ts'),
    ];

    for (const sourcePath of possibleSources) {
      const fullPath = path.join(packagePath, sourcePath);
      if (await fs.pathExists(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  private async isPrivatePackage(packagePath: string): Promise<boolean> {
    try {
      const packageJson: PackageJson = await fs.readJson(path.join(packagePath, 'package.json'));
      return !!packageJson.private;
    } catch {
      return false;
    }
  }
}
