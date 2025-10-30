// @ts-check
import { ReflectionKind, RendererEvent } from 'typedoc';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {import('typedoc').DeclarationReflection & { target?: import('typedoc').DeclarationReflection }} ReferenceReflection
 * @typedef {{ [key: string]: { [key: string]: ExportInfo } }} OutputData
 * @typedef {{ type: 'function' | 'class', importPath: string, deprecated?: boolean, experimental?: boolean, beta?: boolean, methods?: string[], dependencies?: Array<{package: string, type: string}> }} ExportInfo
 */

/**
 * TypeDoc plugin to generate a JSON file containing exported functions and classes from each SDK package.
 *
 * Output format:
 * {
 *   "@clerk/clerk-react": {
 *     "useAuth": {
 *       "type": "function",
 *       "importPath": "@clerk/clerk-react"
 *     },
 *     "useSignInSignal": {
 *       "type": "function",
 *       "importPath": "@clerk/clerk-react/experimental",
 *       "experimental": true
 *     }
 *   },
 *   "@clerk/backend": {
 *     "User": {
 *       "type": "class",
 *       "importPath": "@clerk/backend",
 *       "methods": ["fullName", "primaryEmailAddress"]
 *     },
 *     "verifyToken": {
 *       "type": "function",
 *       "importPath": "@clerk/backend"
 *     },
 *     "verifyWebhook": {
 *       "type": "function",
 *       "importPath": "@clerk/backend/webhooks"
 *     }
 *   },
 *   "@clerk/shared": {
 *     "LocalStorageBroadcastChannel": {
 *       "type": "class",
 *       "importPath": "@clerk/shared",
 *       "deprecated": true
 *     }
 *   }
 * }
 */

/**
 * Check if a reflection is a reference (re-export)
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {reflection is ReferenceReflection}
 */
function isReference(reflection) {
  // Kind 16777216 is Reference - this is when a package re-exports something from another package
  return reflection.kind === /** @type {*} */ (16777216);
}

/**
 * Check if a reflection is a function or class that should be included in the output
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {boolean}
 */
function isExportableFunction(reflection) {
  // Include functions and classes
  if (reflection.kind === ReflectionKind.Function || reflection.kind === ReflectionKind.Class) {
    return true;
  }

  // Include ALL variables - these are often const functions like:
  // export const auth = async () => {}
  // or React components like:
  // export const UserButton = () => {}
  // TypeDoc treats these as Variables even though they're callable
  if (reflection.kind === ReflectionKind.Variable) {
    return true;
  }

  // Include References (re-exports)
  // e.g., export { UserButton } from '@clerk/clerk-react'
  if (isReference(reflection)) {
    // Check if the target is a function or class
    const target = reflection.target;
    if (target) {
      if (
        target.kind === ReflectionKind.Function ||
        target.kind === ReflectionKind.Class ||
        target.kind === ReflectionKind.Variable
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the type of export (function or class)
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {'function' | 'class'}
 */
function getExportType(reflection) {
  // Handle References (re-exports) by checking the target
  if (isReference(reflection) && reflection.target) {
    if (reflection.target.kind === ReflectionKind.Class) {
      return 'class';
    }
    return 'function';
  }

  if (reflection.kind === ReflectionKind.Class) {
    return 'class';
  }
  return 'function';
}

/**
 * Check if an export is deprecated
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {boolean}
 */
function isDeprecated(reflection) {
  // For References, check the target
  const target = isReference(reflection) ? reflection.target : reflection;
  if (!target) return false;

  // Check for @deprecated tag in comments
  if (target.comment?.blockTags?.some(/** @param {*} t */ t => t.tag === '@deprecated')) {
    return true;
  }
  // Also check the deprecated flag
  if (target.flags?.isDeprecated) {
    return true;
  }
  return false;
}

/**
 * Check if an export is experimental
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {boolean}
 */
function isExperimental(reflection) {
  const target = isReference(reflection) ? reflection.target : reflection;
  if (!target) return false;
  return target.comment?.blockTags?.some(/** @param {*} t */ t => t.tag === '@experimental') || false;
}

/**
 * Check if an export is in beta
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {boolean}
 */
function isBeta(reflection) {
  const target = isReference(reflection) ? reflection.target : reflection;
  if (!target) return false;
  return target.comment?.blockTags?.some(/** @param {*} t */ t => t.tag === '@beta') || false;
}

/**
 * Extract public methods and accessors from a class
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {string[]}
 */
function getClassMethods(reflection) {
  /** @type {string[]} */
  const methods = [];

  // For References, check the target
  const target = isReference(reflection) ? reflection.target : reflection;
  if (!target) return methods;

  if (target.kind !== ReflectionKind.Class || !target.children) {
    return methods;
  }

  for (const child of target.children) {
    // Include both methods and accessors (getters/setters)
    // Methods: 2048, Accessors: 262144
    if (child.kind === ReflectionKind.Method || child.kind === ReflectionKind.Accessor) {
      // Skip private methods
      if (child.flags?.isPrivate) {
        continue;
      }

      methods.push(child.name);
    }
  }

  return methods.sort();
}

/**
 * Build the import path for a reflection
 * @param {import('typedoc').DeclarationReflection} reflection
 * @returns {string | null}
 */
function getImportPath(reflection) {
  const pathParts = [];
  let current = reflection.parent;

  // Traverse up the parent chain
  while (current) {
    const name = current.name;

    // If we hit the package name (starts with @clerk/)
    if (name && name.startsWith('@clerk/')) {
      pathParts.unshift(name);
      break;
    }

    // Collect module names that indicate subpaths
    // These are typically folders like "server", "experimental", "errors", "webhooks"
    if (current.kind === ReflectionKind.Module || current.kind === ReflectionKind.Namespace) {
      // Skip generic module names or source file paths
      if (name && !name.includes('/') && name !== 'index' && !name.startsWith('packages/')) {
        pathParts.push(name);
      }
    }

    current = current.parent;
  }

  if (pathParts.length === 0) {
    return null;
  }

  // Build the import path
  // First element is the package name, rest are subpaths
  const packageName = pathParts[0];
  const subPaths = pathParts.slice(1).filter(p => {
    // Filter out common non-import-path module names
    const skip = ['src', 'components', 'hooks', 'types', 'utils', 'internal'];
    return !skip.includes(p);
  });

  if (subPaths.length > 0) {
    return `${packageName}/${subPaths.join('/')}`;
  }

  return packageName;
}

/**
 * Parse exports from a TypeScript file (recursively follows re-export chains)
 * @param {string} filePath - Path to the TypeScript file
 * @param {Set<string>} visited - Set of visited paths to prevent infinite loops
 * @returns {{name: string, isReExport: boolean}[]} - Array of export info
 */
function parseExportsFromFile(filePath, visited = new Set()) {
  if (!fs.existsSync(filePath) || visited.has(filePath)) {
    return [];
  }
  visited.add(filePath);

  const content = fs.readFileSync(filePath, 'utf-8');
  const exports = [];

  // Match: export { Something, AnotherThing } from '...' (re-exports)
  // Only mark as re-export if it's from an external @clerk package
  const namedExportRegex = /export\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    const names = match[1]
      .split(',')
      .map(n => {
        const trimmed = n.trim();
        // Handle aliases: "Something as Alias" -> extract "Alias"
        const aliasMatch = trimmed.match(/(\w+)\s+as\s+(\w+)/);
        return aliasMatch ? aliasMatch[2] : trimmed;
      })
      .filter(Boolean);
    const source = match[2];
    const isExternalReExport = source.startsWith('@clerk/');

    exports.push(
      ...names.map(name => ({
        name,
        isReExport: isExternalReExport,
      })),
    );
  }

  // Match: export const Something = SomeModule.Something (re-exports from imported module)
  // But we need to check if the module is from an external package, not a local file
  const moduleReExportRegex = /export\s+const\s+(\w+)\s*=\s*(\w+)\.(\w+)/g;
  while ((match = moduleReExportRegex.exec(content)) !== null) {
    const exportName = match[1];
    const moduleName = match[2];
    const moduleProp = match[3];

    // Check if this module is imported from an external package
    // Look for: import * as ModuleName from '@clerk/...'
    const externalImportRegex = new RegExp(`import\\s+\\*\\s+as\\s+${moduleName}\\s+from\\s+['"](@clerk/[^'"]+)['"]`);
    const importMatch = content.match(externalImportRegex);

    // If the names match AND it's imported from an external @clerk package, it's a re-export
    if (exportName === moduleProp && importMatch) {
      exports.push({ name: exportName, isReExport: true });
    } else {
      // Otherwise, treat as local export
      if (!exports.find(e => e.name === exportName)) {
        exports.push({ name: exportName, isReExport: false });
      }
    }
  }

  // Match: export const Something = ... (local exports, not already caught)
  const constExportRegex = /export\s+const\s+(\w+)\s*=\s*(?!\w+\.)/g;
  while ((match = constExportRegex.exec(content)) !== null) {
    const name = match[1];
    // Check if we already added this (from module re-export pattern)
    if (!exports.find(e => e.name === name)) {
      exports.push({ name, isReExport: false });
    }
  }

  // Match: export async function something() (local exports)
  const asyncFuncExportRegex = /export\s+async\s+function\s+(\w+)/g;
  while ((match = asyncFuncExportRegex.exec(content)) !== null) {
    exports.push({ name: match[1], isReExport: false });
  }

  // Match: export function something() (local exports)
  const funcExportRegex = /export\s+function\s+(\w+)/g;
  while ((match = funcExportRegex.exec(content)) !== null) {
    exports.push({ name: match[1], isReExport: false });
  }

  // Match: export * from './somewhere' (wildcard re-exports)
  const wildcardExportRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = wildcardExportRegex.exec(content)) !== null) {
    const sourceModule = match[1];
    const isExternalReExport = sourceModule.startsWith('@clerk/');

    if (!isExternalReExport) {
      // Follow the chain to local modules
      const modulePath = path.join(path.dirname(filePath), sourceModule);
      const possiblePaths = [
        `${modulePath}.ts`,
        `${modulePath}.tsx`,
        `${modulePath}/index.ts`,
        `${modulePath}/index.tsx`,
      ];

      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          // Recursively parse the referenced module
          const nestedExports = parseExportsFromFile(possiblePath, visited);
          for (const nestedExport of nestedExports) {
            // Avoid duplicates
            if (!exports.find(e => e.name === nestedExport.name)) {
              exports.push(nestedExport);
            }
          }
          break;
        }
      }
    }
  }

  return exports;
}

/**
 * Get all entry points for a package by reading package.json exports field
 * @param {string} packagePath - Path to the package directory
 * @returns {string[]} - Array of entry point file paths
 */
function getPackageEntryPoints(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const entryPoints = [];

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (packageJson.exports) {
      for (const [key, value] of Object.entries(packageJson.exports)) {
        // Skip package.json export
        if (key === './package.json') continue;

        // Get the types field from the export
        let typesPath = null;
        if (typeof value === 'object' && value !== null) {
          if (value.import?.types) {
            typesPath = value.import.types;
          } else if (value.require?.types) {
            typesPath = value.require.types;
          } else if (value.types) {
            typesPath = value.types;
          }
        }

        if (typesPath) {
          // Convert dist path back to src path
          // e.g., "./dist/internal.d.ts" -> "src/internal.ts"
          // e.g., "./dist/jwt/index.d.ts" -> "src/jwt/index.ts"
          const srcPath = typesPath.replace(/^\.\/dist\//, 'src/').replace(/\.d\.ts$/, '.ts');

          const fullPath = path.join(packagePath, srcPath);
          if (fs.existsSync(fullPath)) {
            entryPoints.push(fullPath);
          }
        }
      }
    }
  } catch (err) {
    // If we can't read package.json, fall back to index.ts
  }

  // Always include main index if it exists and wasn't already added
  const mainIndex = path.join(packagePath, 'src', 'index.ts');
  if (fs.existsSync(mainIndex) && !entryPoints.includes(mainIndex)) {
    entryPoints.push(mainIndex);
  }

  return entryPoints;
}

/**
 * Parse a package's entry point files to find all exports
 * @param {string} packagePath - Path to the package directory
 * @returns {{name: string, isReExport: boolean}[]} - Array of export info
 */
function parsePackageExports(packagePath) {
  const entryPoints = getPackageEntryPoints(packagePath);
  const allExports = [];
  const seen = new Set();

  for (const entryPoint of entryPoints) {
    const exports = parseExportsFromFile(entryPoint);
    for (const exp of exports) {
      // Avoid duplicates
      if (!seen.has(exp.name)) {
        seen.add(exp.name);
        allExports.push(exp);
      }
    }
  }

  return allExports;
}

/**
 * Build a map of package names to folder names by reading package.json files
 * @param {string} packagesDir - Path to packages directory
 * @returns {{ [key: string]: string }} - Map of package name to folder name
 */
function buildPackageFolderMap(packagesDir) {
  /** @type {{ [key: string]: string }} */
  const map = {};
  try {
    const folders = fs.readdirSync(packagesDir);
    for (const folder of folders) {
      const packageJsonPath = path.join(packagesDir, folder, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (packageJson.name) {
          map[packageJson.name] = folder;
        }
      }
    }
  } catch (err) {
    // Ignore errors
  }
  return map;
}

/**
 * Find which package originally exports a given symbol
 * @param {string} exportName - The export name to find
 * @param {OutputData} allPackageData - All package metadata
 * @param {string} excludePackage - Package to exclude from search
 * @param {string} packagesDir - Path to packages directory
 * @param {{ [key: string]: string }} packageFolderMap - Map of package names to folder names
 * @returns {string | null} - The package name that originally exports this, or null
 */
function findOriginalExportPackage(exportName, allPackageData, excludePackage, packagesDir, packageFolderMap) {
  // First, check TypeDoc metadata
  for (const [packageName, exports] of Object.entries(allPackageData)) {
    if (packageName === excludePackage) continue;
    if (exports[exportName]) {
      // Make sure this isn't also a re-export (check if it has dependencies)
      const hasReExportDependency = exports[exportName].dependencies?.some(
        /** @param {{ type: string }} d */ d => d.type === 'reExport',
      );
      if (!hasReExportDependency) {
        return packageName;
      }
    }
  }

  // If not found in TypeDoc metadata, check source files
  // This catches exports that TypeDoc didn't document
  for (const packageName of Object.keys(allPackageData)) {
    if (packageName === excludePackage) continue;

    const packageFolderName = packageFolderMap[packageName];
    if (!packageFolderName) continue;

    const packagePath = path.join(packagesDir, packageFolderName);

    if (!fs.existsSync(packagePath)) {
      continue;
    }

    // Check if this export exists in the package's source files
    const srcPath = path.join(packagePath, 'src');
    if (fs.existsSync(srcPath)) {
      try {
        const files = getAllFiles(srcPath);
        for (const file of files) {
          if (file.match(/\.(ts|tsx|js|jsx)$/)) {
            const content = fs.readFileSync(file, 'utf-8');

            // Check if this file exports our symbol as a local export (not a re-export)
            const localExportRegex = new RegExp(
              `^export\\s+(?:const|function|class|async\\s+function)\\s+${exportName}\\b`,
              'm',
            );

            if (localExportRegex.test(content)) {
              // Make sure it's not a re-export by checking there's no "from" clause nearby
              const lines = content.split('\n');
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].match(new RegExp(`\\b${exportName}\\b`))) {
                  // Check this line and next few lines for "from"
                  const context = lines.slice(i, i + 3).join(' ');
                  if (
                    context.match(/export\s+(?:const|function|class|async\s+function)/) &&
                    !context.match(/from\s+['"]/)
                  ) {
                    return packageName;
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        // Ignore errors
      }
    }
  }

  return null;
}

/**
 * Check if an export is publicly available (re-exported from an entry point)
 * @param {string} packagePath - Path to the package directory
 * @param {string} exportName - The export name to check
 * @returns {boolean} - Whether this export is public
 */
function isPublicExport(packagePath, exportName) {
  const srcPath = path.join(packagePath, 'src');
  if (!fs.existsSync(srcPath)) {
    return false;
  }

  /**
   * Check if an entry point exports this symbol (recursively follows re-export chains)
   * @param {string} entryPointPath - Path to the entry point file
   * @param {Set<string>} visited - Set of visited paths to prevent infinite loops
   * @param {string} searchName - The export name to search for (defaults to exportName)
   * @returns {boolean}
   */
  const checkEntryPoint = (entryPointPath, visited = new Set(), searchName = exportName) => {
    if (!fs.existsSync(entryPointPath) || visited.has(entryPointPath)) {
      return false;
    }
    visited.add(entryPointPath);

    const content = fs.readFileSync(entryPointPath, 'utf-8');

    // Check for direct exports: export const/function/class ExportName
    const directExportRegex = new RegExp(`export\\s+(?:const|function|class|async\\s+function)\\s+${searchName}\\b`);
    if (directExportRegex.test(content)) {
      return true;
    }

    // Check for named exports without 'from': export { ExportName, ... }
    const namedExportWithoutFromRegex = new RegExp(
      `export\\s+\\{[^}]*(?:\\b${searchName}\\b|\\w+\\s+as\\s+${searchName}\\b)[^}]*\\}(?!\\s*from)`,
    );
    if (namedExportWithoutFromRegex.test(content)) {
      return true;
    }

    // Check for named re-exports with 'from': export { ExportName } from './somewhere'
    const namedReExportRegex = /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = namedReExportRegex.exec(content)) !== null) {
      const exportedNames = match[1];
      const sourceModule = match[2];

      // Split by comma and check each exported name
      const exports = exportedNames.split(',').map(n => n.trim());
      for (const exportSpec of exports) {
        // Handle "originalName as aliasName" or just "name"
        const aliasMatch = exportSpec.match(/(\w+)\s+as\s+(\w+)/);
        const sourceName = aliasMatch ? aliasMatch[1] : exportSpec;
        const exportedName = aliasMatch ? aliasMatch[2] : exportSpec;

        // Check if this matches our search target
        if (exportedName === searchName) {
          // If it's an external re-export (from another package), consider it public
          if (sourceModule.startsWith('@clerk/') || sourceModule.startsWith('@')) {
            return true;
          }

          // Follow the chain to the local source module, looking for the SOURCE name
          const modulePath = path.join(path.dirname(entryPointPath), sourceModule);
          const possiblePaths = [
            `${modulePath}.ts`,
            `${modulePath}.tsx`,
            `${modulePath}/index.ts`,
            `${modulePath}/index.tsx`,
          ];

          for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
              // Recursively check with the SOURCE name
              if (checkEntryPoint(possiblePath, visited, sourceName)) {
                return true;
              }
              break;
            }
          }
        }
      }
    }

    // Check for wildcard re-exports: export * from './somewhere'
    const wildcardRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
    while ((match = wildcardRegex.exec(content)) !== null) {
      const referencedModule = match[1];
      const modulePath = path.join(path.dirname(entryPointPath), referencedModule);

      const possiblePaths = [
        `${modulePath}.ts`,
        `${modulePath}.tsx`,
        `${modulePath}/index.ts`,
        `${modulePath}/index.tsx`,
      ];

      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          // Recursively check the wildcard re-export
          if (checkEntryPoint(possiblePath, visited)) {
            return true;
          }
          break;
        }
      }
    }

    return false;
  };

  // Check all entry points for this package
  const entryPoints = getPackageEntryPoints(packagePath);
  for (const entryPoint of entryPoints) {
    if (checkEntryPoint(entryPoint)) {
      return true;
    }
  }

  return false;
}

/**
 * Detect if an export comes from a subpath entry point (like /server)
 * @param {string} packagePath - Path to the package directory
 * @param {string} exportName - The export name to analyze
 * @returns {string | null} - The subpath (e.g., "server", "internal", "webhooks") or null
 */
function detectSubpath(packagePath, exportName) {
  try {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (packageJson.exports) {
      for (const [key, value] of Object.entries(packageJson.exports)) {
        // Skip main export and package.json
        if (key === '.' || key === './package.json') continue;

        // Get the types field
        let typesPath = null;
        if (typeof value === 'object' && value !== null) {
          if (value.import?.types) {
            typesPath = value.import.types;
          } else if (value.require?.types) {
            typesPath = value.require.types;
          } else if (value.types) {
            typesPath = value.types;
          }
        }

        if (typesPath) {
          // Convert dist path to src path
          const srcPath = typesPath.replace(/^\.\/dist\//, 'src/').replace(/\.d\.ts$/, '.ts');

          const fullPath = path.join(packagePath, srcPath);
          if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            // Check if this entry point exports our symbol
            const exportRegex = new RegExp(
              `export\\s+(?:\\{[^}]*(?:\\b${exportName}\\b|\\w+\\s+as\\s+${exportName}\\b)[^}]*\\}|(?:const|function|class|async\\s+function)\\s+${exportName}\\b)`,
            );
            if (exportRegex.test(content)) {
              // Return the subpath without the leading "./"
              return key.replace(/^\.\//, '');
            }
          }
        }
      }
    }
  } catch (err) {
    // Ignore errors
  }

  return null;
}

/**
 * Analyze source code to find which @clerk packages this export depends on
 * @param {string} packagePath - Path to the package directory
 * @param {string} exportName - The export name to analyze
 * @returns {{package: string, type: 'reExport' | 'wrapper'}[]} - Array of dependencies with their types
 */
function analyzeExportDependencies(packagePath, exportName) {
  const dependencies = new Set();

  let sourceContent = '';
  const srcPath = path.join(packagePath, 'src');

  if (!fs.existsSync(srcPath)) {
    return [];
  }

  // Search all TypeScript/JavaScript files for the export
  try {
    const files = getAllFiles(srcPath);
    for (const file of files) {
      if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        const content = fs.readFileSync(file, 'utf-8');

        // Check if this file exports our symbol
        // Match: export const/function/class ExportName
        // Match: export const ExportName: ... = Object.assign
        // Match: export { ExportName } from '...'
        // Match: export { Something as ExportName } from '...'
        const exportRegex = new RegExp(
          `(?:export\\s+(?:const|function|class|async\\s+function)\\s+${exportName}\\b|` +
            `export\\s+const\\s+${exportName}\\s*:\\s*[^=]+=\\s*Object\\.assign|` +
            `export\\s+\\{[^}]*(?:\\b${exportName}\\b|\\w+\\s+as\\s+${exportName}\\b)[^}]*\\}\\s+from)`,
        );

        if (exportRegex.test(content)) {
          sourceContent = content;
          break;
        }
      }
    }
  } catch (err) {
    // Ignore errors
    return [];
  }

  if (!sourceContent) {
    return [];
  }

  // Check if this export is a pure re-export from an external @clerk package
  // Match: export { ExportName } from '@clerk/...'
  // Match: export { Something as ExportName } from '@clerk/...'
  const reExportRegex = new RegExp(
    `export\\s+\\{[^}]*(?:\\b${exportName}\\b|\\w+\\s+as\\s+${exportName}\\b)[^}]*\\}\\s+from\\s+['"](@clerk/[^'"]+)['"]`,
  );
  const reExportMatch = sourceContent.match(reExportRegex);

  if (reExportMatch) {
    // This is a pure re-export from an external package
    const pkg = reExportMatch[1].split('/').slice(0, 2).join('/');
    return [{ package: pkg, type: 'reExport' }];
  }

  // Find all imports/exports from @clerk packages
  // Match: import { Something } from '@clerk/package-name'
  // Match: import Something from '@clerk/package-name'
  // Match: import type { Something } from '@clerk/package-name'
  // Match: export { Something } from '@clerk/package-name' (re-exports in the same file)
  const importRegex =
    /(?:import|export)\s+(?:type\s+)?(?:{[^}]+}|[\w]+|\*\s+as\s+\w+)\s+from\s+['"](@clerk\/[^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(sourceContent)) !== null) {
    const importedPackage = match[1].split('/').slice(0, 2).join('/'); // Get base package
    dependencies.add(importedPackage);
  }

  // These are wrappers since they import/use (not directly re-export our specific symbol) from @clerk packages
  return Array.from(dependencies)
    .sort()
    .map(pkg => ({ package: pkg, type: 'wrapper' }));
}

/**
 * Recursively get all files in a directory
 * @param {string} dirPath - Directory path
 * @returns {string[]} - Array of file paths
 */
function getAllFiles(dirPath) {
  const files = [];
  try {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (item !== 'node_modules' && item !== 'dist' && item !== '.next') {
          files.push(...getAllFiles(fullPath));
        }
      } else {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // Ignore errors
  }
  return files;
}

/**
 * @param {import('typedoc').Application} app
 */
export function load(app) {
  app.renderer.on(RendererEvent.END, event => {
    const project = event.project;
    /** @type {OutputData} */
    const outputData = {};

    // Iterate through ALL reflections and organize by base package
    for (const reflection of Object.values(project.reflections)) {
      // Cast to DeclarationReflection for type checking
      const decl = /** @type {import('typedoc').DeclarationReflection} */ (reflection);

      // Skip if not a function or class
      if (!isExportableFunction(decl)) {
        continue;
      }

      // Skip private
      if (decl.flags?.isPrivate) {
        continue;
      }

      // Get the import path for this export
      const importPath = getImportPath(decl);

      if (!importPath) {
        continue;
      }

      // Extract the base package name (e.g., "@clerk/backend" from "@clerk/backend/webhooks")
      const basePackage = importPath.split('/').slice(0, 2).join('/');

      // Get the type (function or class)
      const exportType = getExportType(decl);

      // Create the export metadata object (without the name since it's the key)
      /** @type {ExportInfo} */
      const exportData = {
        type: exportType,
        importPath: importPath,
      };

      // Add status flags
      const deprecated = isDeprecated(decl);
      const experimental = isExperimental(decl);
      const beta = isBeta(decl);

      if (deprecated) {
        exportData.deprecated = true;
      }
      if (experimental) {
        exportData.experimental = true;
      }
      if (beta) {
        exportData.beta = true;
      }

      // If it's a class, include its public methods (if any)
      if (exportType === 'class') {
        const methods = getClassMethods(decl);
        if (methods.length > 0) {
          exportData.methods = methods;
        }
      }

      // Group by base package
      if (!outputData[basePackage]) {
        outputData[basePackage] = {};
      }

      // Add to the package object (keyed by function name)
      // Avoid duplicates
      if (!outputData[basePackage][decl.name]) {
        outputData[basePackage][decl.name] = exportData;
      }
    }

    // Handle re-exports for ALL packages dynamically
    const repoRoot = path.resolve(__dirname, '..');
    const packagesDir = path.join(repoRoot, 'packages');
    const packageFolderMap = buildPackageFolderMap(packagesDir);

    let totalCopied = 0;
    let totalAdded = 0;
    let totalReExports = 0;

    // Process each package that has TypeDoc metadata
    for (const packageName of Object.keys(outputData)) {
      // Get the package folder name from the map
      const packageFolderName = packageFolderMap[packageName];
      if (!packageFolderName) continue;

      const packagePath = path.join(packagesDir, packageFolderName);

      // Skip if the package directory doesn't exist
      if (!fs.existsSync(packagePath)) {
        continue;
      }

      // Parse the source exports from this package
      const sourceExports = parsePackageExports(packagePath);

      if (sourceExports.length === 0) {
        continue;
      }

      app.logger.info(`[exports-json-plugin] Processing ${sourceExports.length} exports in ${packageName}`);

      let copiedCount = 0;
      let addedCount = 0;

      for (const { name: exportName, isReExport } of sourceExports) {
        // Don't overwrite if it already exists (it's already been documented by TypeDoc)
        if (outputData[packageName][exportName]) {
          // If it's a re-export, mark it as such and find the source
          if (isReExport) {
            const originalPackage = findOriginalExportPackage(
              exportName,
              outputData,
              packageName,
              packagesDir,
              packageFolderMap,
            );
            if (originalPackage) {
              // Initialize dependencies array if it doesn't exist
              if (!outputData[packageName][exportName].dependencies) {
                outputData[packageName][exportName].dependencies = [];
              }
              // Add the re-export relationship
              outputData[packageName][exportName].dependencies.push({
                package: originalPackage,
                type: 'reExport',
              });
              totalReExports++;
            }
          }
          continue;
        }

        // This export doesn't exist in TypeDoc metadata, we need to add it
        if (isReExport) {
          // It's a re-export, try to find it in other packages and copy metadata
          const originalPackage = findOriginalExportPackage(
            exportName,
            outputData,
            packageName,
            packagesDir,
            packageFolderMap,
          );

          if (originalPackage) {
            // Copy from the original package with updated import path
            const originalExport = outputData[originalPackage]?.[exportName];

            // Detect if this export is from a subpath (e.g., /server)
            const subpath = detectSubpath(packagePath, exportName);
            const fullImportPath = subpath ? `${packageName}/${subpath}` : packageName;

            if (originalExport) {
              // Original export has TypeDoc metadata, copy it
              // Don't copy the dependencies array - we'll set our own
              const { dependencies: _, ...exportMetadata } = originalExport;
              outputData[packageName][exportName] = {
                ...exportMetadata,
                importPath: fullImportPath,
                dependencies: [
                  {
                    package: originalPackage,
                    type: 'reExport',
                  },
                ],
              };
            } else {
              // Original export found via source scanning but no TypeDoc metadata
              outputData[packageName][exportName] = {
                type: 'function',
                importPath: fullImportPath,
                dependencies: [
                  {
                    package: originalPackage,
                    type: 'reExport',
                  },
                ],
              };
            }
            copiedCount++;
            totalReExports++;
          } else {
            // Couldn't find the original, add as generic function
            const subpath = detectSubpath(packagePath, exportName);
            const fullImportPath = subpath ? `${packageName}/${subpath}` : packageName;

            outputData[packageName][exportName] = {
              type: 'function',
              importPath: fullImportPath,
            };
            addedCount++;
          }
        } else {
          // It's a local export that TypeDoc didn't document, add as generic function
          const subpath = detectSubpath(packagePath, exportName);
          const fullImportPath = subpath ? `${packageName}/${subpath}` : packageName;

          outputData[packageName][exportName] = {
            type: 'function',
            importPath: fullImportPath,
          };
          addedCount++;
        }
      }

      if (copiedCount > 0 || addedCount > 0) {
        app.logger.info(
          `[exports-json-plugin] ${packageName}: copied ${copiedCount} re-exports, added ${addedCount} undocumented exports`,
        );
      }

      totalCopied += copiedCount;
      totalAdded += addedCount;
    }

    app.logger.info(
      `[exports-json-plugin] Summary: ${totalCopied} re-exports copied, ${totalAdded} undocumented exports added, ${totalReExports} re-export relationships documented`,
    );

    // Filter out non-public exports (internal exports not re-exported from entry points)
    app.logger.info(`[exports-json-plugin] Filtering out non-public exports...`);
    let removedCount = 0;

    for (const packageName of Object.keys(outputData)) {
      const packageFolderName = packageFolderMap[packageName];
      if (!packageFolderName) continue;

      const packagePath = path.join(packagesDir, packageFolderName);
      if (!fs.existsSync(packagePath)) continue;

      const exportsToRemove = [];

      for (const exportName of Object.keys(outputData[packageName])) {
        // Check if this export is publicly available
        if (!isPublicExport(packagePath, exportName)) {
          exportsToRemove.push(exportName);
          removedCount++;
        }
      }

      // Remove non-public exports
      for (const exportName of exportsToRemove) {
        delete outputData[packageName][exportName];
      }
    }

    app.logger.info(`[exports-json-plugin] Removed ${removedCount} non-public exports`);

    // Fix import paths for exports from subpaths (e.g., /server)
    app.logger.info(`[exports-json-plugin] Fixing import paths for subpath exports...`);
    let fixedPaths = 0;

    for (const packageName of Object.keys(outputData)) {
      const packageFolderName = packageFolderMap[packageName];
      if (!packageFolderName) continue;

      const packagePath = path.join(packagesDir, packageFolderName);
      if (!fs.existsSync(packagePath)) continue;

      for (const [exportName, exportData] of Object.entries(outputData[packageName])) {
        // Check if this export should have a subpath
        const subpath = detectSubpath(packagePath, exportName);
        if (subpath) {
          const expectedPath = `${packageName}/${subpath}`;
          if (exportData.importPath !== expectedPath) {
            exportData.importPath = expectedPath;
            fixedPaths++;
          }
        }
      }
    }

    app.logger.info(`[exports-json-plugin] Fixed ${fixedPaths} import paths for subpath exports`);

    // Analyze dependencies for all exports (check if they're built on top of other @clerk packages)
    app.logger.info(`[exports-json-plugin] Analyzing dependencies for all exports...`);
    let totalDependencies = 0;

    for (const packageName of Object.keys(outputData)) {
      const packageFolderName = packageFolderMap[packageName];
      if (!packageFolderName) continue;

      const packagePath = path.join(packagesDir, packageFolderName);

      if (!fs.existsSync(packagePath)) {
        continue;
      }

      for (const [exportName, exportData] of Object.entries(outputData[packageName])) {
        // Analyze the source code to find @clerk package dependencies
        const packageDependencies = analyzeExportDependencies(packagePath, exportName);

        if (packageDependencies.length > 0) {
          // Initialize dependencies array if it doesn't exist
          if (!exportData.dependencies) {
            exportData.dependencies = [];
          }

          // Add each dependency (with correct type from analysis)
          for (const dep of packageDependencies) {
            // Filter out self-references
            if (dep.package === packageName) {
              continue;
            }

            // Check if this dependency already exists
            const existing = exportData.dependencies.find(
              /** @param {{ package: string, type: string }} d */ d => d.package === dep.package,
            );
            if (!existing) {
              exportData.dependencies.push(dep);
            }
          }

          if (
            packageDependencies.some(/** @param {{ package: string, type: string }} d */ d => d.package !== packageName)
          ) {
            totalDependencies++;
          }
        }
      }
    }

    app.logger.info(`[exports-json-plugin] Found ${totalDependencies} exports built on top of other @clerk packages`);

    // Sort packages alphabetically and sort exports within each package
    /** @type {OutputData} */
    const result = {};
    const sortedPackages = Object.keys(outputData).sort();

    for (const packageName of sortedPackages) {
      const exports = outputData[packageName];
      /** @type {{ [key: string]: ExportInfo }} */
      const sortedExports = {};

      // Sort export names alphabetically
      const sortedNames = Object.keys(exports).sort();
      for (const name of sortedNames) {
        sortedExports[name] = exports[name];
      }

      result[packageName] = sortedExports;
    }

    // Write the JSON file to the output directory
    const outputPath = path.join(event.outputDirectory, 'functions.json');

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    app.logger.info(`[exports-json-plugin] Exported functions metadata to ${outputPath}`);
  });
}
