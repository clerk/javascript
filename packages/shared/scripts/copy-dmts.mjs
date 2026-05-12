import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(packageRoot, 'dist');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
      continue;
    }

    if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

const files = await walk(distDir);
const fileSet = new Set(files);
const declarationFiles = files.filter(file => file.endsWith('.d.ts'));

function toPosixPath(path) {
  return path.split('\\').join('/');
}

function resolveDeclarationSpecifier(sourceFile, specifier) {
  if (
    !specifier.startsWith('.') ||
    /\.(?:cjs|mjs|js|cts|mts|ts|jsx|tsx|json|d\.cts|d\.mts|d\.ts)$/.test(specifier)
  ) {
    return specifier;
  }

  const sourceDir = dirname(sourceFile);
  const targetFile = join(sourceDir, `${specifier}.d.ts`);
  const targetIndexFile = join(sourceDir, specifier, 'index.d.ts');

  if (fileSet.has(targetFile)) {
    return `${specifier}.d.mts`;
  }

  if (fileSet.has(targetIndexFile)) {
    return `${specifier}/index.d.mts`;
  }

  return specifier;
}

function rewriteDeclarationSpecifiers(sourceFile, contents) {
  return contents
    .replace(/\bfrom\s+(['"])(\.[^'"]+)\1/g, (statement, quote, specifier) => {
      return statement.replace(specifier, toPosixPath(resolveDeclarationSpecifier(sourceFile, specifier)));
    })
    .replace(/\bimport\s*\(\s*(['"])(\.[^'"]+)\1\s*\)/g, (statement, quote, specifier) => {
      return statement.replace(specifier, toPosixPath(resolveDeclarationSpecifier(sourceFile, specifier)));
    });
}

await Promise.all(
  declarationFiles.map(async sourceFile => {
    const targetFile = sourceFile.replace(/\.d\.ts$/, '.d.mts');
    const sourceMapFile = `${sourceFile}.map`;
    const targetMapFile = `${targetFile}.map`;
    const sourceMapName = basename(sourceMapFile);
    const targetMapName = basename(targetMapFile);

    let contents = await readFile(sourceFile, 'utf8');
    contents = contents.replace(`sourceMappingURL=${sourceMapName}`, `sourceMappingURL=${targetMapName}`);
    contents = rewriteDeclarationSpecifiers(sourceFile, contents);

    await mkdir(dirname(targetFile), { recursive: true });
    await writeFile(targetFile, contents);

    if (files.includes(sourceMapFile)) {
      const map = JSON.parse(await readFile(sourceMapFile, 'utf8'));
      map.file = relative(dirname(targetMapFile), targetFile);
      await writeFile(targetMapFile, `${JSON.stringify(map)}\n`);
    }
  }),
);
