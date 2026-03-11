#!/usr/bin/env node
/**
 * Adds a changeset for the en-GB username placeholder fix.
 * Equivalent to: pnpm changeset add → select @clerk/localizations → patch → summary.
 * Run with: pnpm changeset:add-en-gb
 */
import { writeFileSync } from 'fs';
import { join } from 'path';

const summary = 'Add placeholder text "Enter your username" for username field in en-GB locale';

const content = `---
'@clerk/localizations': patch
---

${summary}
`;

const filename = 'fix-username-placeholder-en-gb.md';
const filepath = join(process.cwd(), '.changeset', filename);
writeFileSync(filepath, content, 'utf-8');
console.log(`🦋  Changeset added: .changeset/${filename}`);
console.log(`   Run "pnpm changeset add" in your terminal to add more, or commit this file.`);
