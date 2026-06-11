#!/usr/bin/env node
import path from 'node:path';
import { parseArgs } from 'node:util';

import { fixAuthProtection } from './fix-auth-protection';

function relative(filePath: string): string {
  return path.relative(process.cwd(), filePath) || filePath;
}

const HELP = `clerk-fix-auth-protection

Apply the @clerk/eslint-plugin \`require-auth-protection\` rule's
\`await auth.protect()\` suggestions across your project. Uses your existing
ESLint config (so the protected/public folder globs are honored).

Usage
  clerk-fix-auth-protection [patterns...] [options]

Arguments
  patterns            Files, directories, or globs to scan (default: ".")

Options
  --dry-run           Report what would change without writing any files
  -h, --help          Show this help

Examples
  clerk-fix-auth-protection
  clerk-fix-auth-protection "app/**" --dry-run
`;

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'dry-run': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  });

  if (values.help) {
    console.log(HELP);
    return 0;
  }

  const patterns = positionals.length > 0 ? positionals : ['.'];
  const dryRun = Boolean(values['dry-run']);
  const verb = dryRun ? 'Would protect' : 'Protected';

  console.log(`Scanning: ${patterns.join(', ')}`);

  const { fixed, unresolved } = await fixAuthProtection({
    patterns,
    dryRun,
    onConfigResolved(configFile) {
      console.log(`Config:   ${configFile ? relative(configFile) : '(resolved by ESLint from the working directory)'}`);
      console.log('');
      console.log('Scanning for unprotected resources…');
      console.log('This lints your whole project, so it can take a while on large codebases.');
    },
    onScanComplete(fileCount) {
      if (fileCount === 0) {
        return;
      }
      console.log('');
      console.log(`Found ${pluralize(fileCount, 'file')} to update. ${dryRun ? 'Previewing' : 'Applying'} fixes…`);
    },
    onFileFixed(file) {
      console.log(`  ${verb} ${relative(file.filePath)} (${pluralize(file.protections, 'resource')})`);
    },
  });

  if (fixed.length === 0 && unresolved.length === 0) {
    console.log('');
    console.log('No unprotected resources found. Nothing to do.');
    return 0;
  }

  if (unresolved.length > 0) {
    console.log('');
    console.log('Needs manual attention (no safe automatic fix):');
    for (const file of unresolved) {
      for (const issue of file.issues) {
        console.log(`  ${relative(file.filePath)}:${issue.line}:${issue.column} ${issue.message}`);
      }
    }
  }

  const totalProtections = fixed.reduce((sum, file) => sum + file.protections, 0);
  console.log('');
  console.log(
    `${verb} ${pluralize(totalProtections, 'resource')} across ${pluralize(fixed.length, 'file')}.` +
      (dryRun ? ' Run without --dry-run to apply.' : ''),
  );

  if (fixed.length > 0) {
    console.log('');
    console.log(
      'Warning: Adding `await auth.protect()` changes your application\u2019s runtime behavior \u2014 it enforces',
    );
    console.log('authentication where there potentially was none, or might override custom auth checks that were');
    console.log('already in place. Always review the changes and test your application.');
  }

  // Non-zero when there is still work to do (manual fixes, or pending changes in
  // a dry run) so CI can gate on it.
  return unresolved.length > 0 || (dryRun && fixed.length > 0) ? 1 : 0;
}

main()
  .then(code => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
