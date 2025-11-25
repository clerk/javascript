// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extracts the "## Returns" section from a markdown file and writes it to a separate file.
 * @param {string} filePath - The path to the markdown file
 * @returns {boolean} True if a file was created
 */
function extractReturnsSection(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

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
  const dirName = path.dirname(filePath);
  const newFilePath = path.join(dirName, `${fileName}-return.mdx`);

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
 * @returns {boolean} True if a file was created
 */
function extractParametersSection(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.mdx');
  const dirName = path.dirname(filePath);

  // Always use -params suffix
  const suffix = '-params';
  const targetFileName = `${fileName}${suffix}.mdx`;
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
  const newFilePath = path.join(dirName, targetFileName);
  fs.writeFileSync(newFilePath, processedParams, 'utf-8');

  console.log(`[extract-returns] Created ${path.relative(process.cwd(), newFilePath)}`);
  return true;
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
 * Main function to process all clerk-react files
 */
function main() {
  const packages = ['clerk-react'];
  const dirs = packages.map(folder => path.join(__dirname, 'temp-docs', folder));

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
      // Extract Returns sections
      if (extractReturnsSection(filePath)) {
        returnsCount++;
      }

      // Extract Parameters sections
      if (extractParametersSection(filePath)) {
        paramsCount++;
      }
    }

    console.log(`[extract-returns] Extracted ${returnsCount} Returns sections`);
    console.log(`[extract-returns] Extracted ${paramsCount} Parameters sections`);
  }
}

main();
