// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Packages whose pages this script post-processes (Returns + Parameters extracted into sibling
 * `-return.mdx` / `-params.mdx` files). Pages under these packages get their nominal-type
 * parameter heading normalized back to the generic `## Parameters` before extraction — see
 * {@link normalizeNominalParametersHeading}.
 */
const EXTRACT_RETURNS_AND_PARAMS_PACKAGES = ['react'];

const LEGACY_HOOK_NAMES = new Set(['use-sign-in-1', 'use-sign-up-1']);

/**
 * `custom-theme.mjs` uniformly swaps a method's `## Parameters` heading to `` ## `TypeName` ``
 * when the sole argument is a nominal object type — so every parameters table in the docs uses
 * one code path. On the pages this script processes, callers still expect the sibling
 * `-params.mdx` extraction to find a section keyed on the literal `## Parameters` heading, so we
 * rename the nominal H2 heading back to `## Parameters` in place before extraction.
 *
 * Only H2 headings without parentheses are treated as params-type headings: `` ## `TypeName` `` ✔,
 * `` ## `methodName()` `` ✘ (that's a method name on an aggregator page). Rewrites the first match
 * only — hook/single-callable pages have at most one such heading per file.
 *
 * @param {string} content
 * @returns {string}
 */
function normalizeNominalParametersHeading(content) {
  return content.replace(/(^|\n)## `([A-Za-z_$][A-Za-z0-9_$]*)`(\s*)(\n|$)/, (_m, before, _name, trailing, after) => {
    return `${before}## Parameters${trailing}${after}`;
  });
}

/**
 * Returns legacy hook output info or null if not a legacy hook.
 * @param {string} filePath
 * @returns {{ outputDir: string; baseName: string } | null}
 */
function getLegacyHookTarget(filePath) {
  const fileName = path.basename(filePath, '.mdx');
  if (!LEGACY_HOOK_NAMES.has(fileName)) {
    return null;
  }
  const dirName = path.dirname(filePath);
  return {
    outputDir: path.join(dirName, 'legacy'),
    baseName: fileName.replace(/-1$/, ''),
  };
}

/**
 * Extracts the "## Returns" section from a markdown file and writes it to a separate file.
 * @param {string} filePath - The path to the markdown file
 * @param {string} content - The file content
 * @param {{ outputDir: string; baseName: string } | null} legacyTarget
 * @returns {boolean} True if a file was created
 */
function extractReturnsSection(filePath, content, legacyTarget) {
  // Find the "## Returns" section
  const returnsStart = content.indexOf('## Returns');

  if (returnsStart === -1) {
    return false; // No Returns section found
  }

  // Find the next heading after "## Returns" (or end of file)
  const afterReturns = content.slice(returnsStart + 10); // Skip past "## Returns"
  const nextHeadingMatch = afterReturns.match(/\n## /);
  const returnsEnd =
    nextHeadingMatch && typeof nextHeadingMatch.index === 'number'
      ? returnsStart + 10 + nextHeadingMatch.index
      : content.length;

  // Extract the Returns section and trim trailing whitespace
  const returnsContent = content.slice(returnsStart, returnsEnd).trimEnd();

  // Generate the new filename: use-auth.mdx -> use-auth-return.mdx
  const fileName = path.basename(filePath, '.mdx');
  let outputBaseName = `${fileName}-return`;
  let outputDir = path.dirname(filePath);
  // Legacy hooks: move into legacy/ and drop the -1
  if (legacyTarget) {
    outputBaseName = `${legacyTarget.baseName}-return`;
    outputDir = legacyTarget.outputDir;
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const newFilePath = path.join(outputDir, `${outputBaseName}.mdx`);

  // Write the extracted Returns section to the new file
  fs.writeFileSync(newFilePath, returnsContent, 'utf-8');

  console.log(`[extract-returns] Created ${path.relative(process.cwd(), newFilePath)}`);
  return true;
}

/**
 * Replaces generic type names in the parameters table with expanded types.
 * @param {string} content
 * @returns {string}
 */
function replaceGenericTypesInParamsTable(content) {
  // Replace Fetcher in the parameters table
  content = content.replace(
    /(\|\s*`fetcher`\s*\|\s*)`Fetcher`(\s*\|)/g,
    '$1`Fetcher extends (...args: any[]) => Promise<any>`$2',
  );
  return content;
}

/**
 * Extracts the "## Parameters" section from a markdown file and writes it to a separate file.
 * @param {string} filePath - The path to the markdown file
 * @param {string} content - The file content
 * @param {{ outputDir: string; baseName: string } | null} legacyTarget
 * @returns {boolean} True if a file was created
 */
function extractParametersSection(filePath, content, legacyTarget) {
  const fileName = path.basename(filePath, '.mdx');
  const dirName = path.dirname(filePath);
  let outputDir = dirName;
  let outputBaseName = fileName;

  if (legacyTarget) {
    outputDir = legacyTarget.outputDir;
    outputBaseName = legacyTarget.baseName;
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Always use -params suffix
  const suffix = '-params';
  const targetFileName = `${outputBaseName}${suffix}.mdx`;
  const propsFileName = `${fileName}-props.mdx`;

  // Delete any existing -props file (TypeDoc-generated)
  const propsFilePath = path.join(dirName, propsFileName);
  if (fs.existsSync(propsFilePath)) {
    fs.unlinkSync(propsFilePath);
    console.log(`[extract-returns] Deleted ${path.relative(process.cwd(), propsFilePath)}`);
  }

  // Find the "## Parameters" section
  const paramsStart = content.indexOf('## Parameters');

  if (paramsStart === -1) {
    return false; // No Parameters section found
  }

  // Find the next heading after "## Parameters" (or end of file)
  const afterParams = content.slice(paramsStart + 13); // Skip past "## Parameters"
  const nextHeadingMatch = afterParams.match(/\n## /);
  const paramsEnd =
    nextHeadingMatch && typeof nextHeadingMatch.index === 'number'
      ? paramsStart + 13 + nextHeadingMatch.index
      : content.length;

  // Extract the Parameters section and trim trailing whitespace
  const paramsContent = content.slice(paramsStart, paramsEnd).trimEnd();
  const processedParams = replaceGenericTypesInParamsTable(paramsContent);

  // Write to new file
  const newFilePath = path.join(outputDir, targetFileName);
  fs.writeFileSync(newFilePath, processedParams, 'utf-8');

  console.log(`[extract-returns] Created ${path.relative(process.cwd(), newFilePath)}`);
  return true;
}

/**
 * Moves legacy hook docs into a legacy/ folder and removes the -1 suffix
 * @param {string} filePath
 * @param {{ outputDir: string; baseName: string } | null} legacyTarget
 */
function moveLegacyHookDoc(filePath, legacyTarget) {
  if (!legacyTarget) {
    return;
  }

  const legacyDir = legacyTarget.outputDir;
  fs.mkdirSync(legacyDir, { recursive: true });
  const legacyPath = path.join(legacyDir, `${legacyTarget.baseName}.mdx`);

  if (fs.existsSync(legacyPath)) {
    fs.unlinkSync(legacyPath);
  }

  fs.renameSync(filePath, legacyPath);
  console.log(
    `[extract-returns] Moved ${path.relative(process.cwd(), filePath)} -> ${path.relative(process.cwd(), legacyPath)}`,
  );
}

/**
 * Recursively reads all .mdx files in a directory, excluding generated files
 * @param {string} dir - The directory to read
 * @returns {string[]} Array of file paths
 */
function getAllMdxFiles(dir) {
  /** @type {string[]} */
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      // Exclude generated files
      const isGenerated =
        entry.name.endsWith('-return.mdx') || entry.name.endsWith('-params.mdx') || entry.name.endsWith('-props.mdx');
      if (!isGenerated) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Main function to process all files from the react package
 */
function main() {
  const dirs = EXTRACT_RETURNS_AND_PARAMS_PACKAGES.map(folder => path.join(__dirname, 'temp-docs', folder));

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      console.log(`[extract-returns] ${dir} directory not found, skipping extraction`);
      continue;
    }

    const mdxFiles = getAllMdxFiles(dir);
    console.log(`[extract-returns] Processing ${mdxFiles.length} files in ${dir}/`);

    let returnsCount = 0;
    let paramsCount = 0;

    for (const filePath of mdxFiles) {
      const original = fs.readFileSync(filePath, 'utf-8');
      // Normalize the theme's uniform `` ## `TypeName` `` back to `## Parameters` so both the
      // sibling extraction below AND downstream consumers reading the page see the generic
      // heading. Persist the rewrite when it changed anything.
      const content = normalizeNominalParametersHeading(original);
      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
      }
      const legacyTarget = getLegacyHookTarget(filePath);

      // Extract Returns sections
      if (extractReturnsSection(filePath, content, legacyTarget)) {
        returnsCount++;
      }

      // Extract Parameters sections
      if (extractParametersSection(filePath, content, legacyTarget)) {
        paramsCount++;
      }

      // Move legacy hook docs after extraction
      moveLegacyHookDoc(filePath, legacyTarget);
    }

    console.log(`[extract-returns] Extracted ${returnsCount} Returns sections`);
    console.log(`[extract-returns] Extracted ${paramsCount} Parameters sections`);
  }
}

main();
