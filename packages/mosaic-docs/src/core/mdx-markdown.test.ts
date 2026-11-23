import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mdxToMarkdown } from './mdx-markdown.ts';

void test('drops Steps wrapper lines and keeps the steps', () => {
  const source = '# Setup\n\n<Steps>\n\n## Install\n\nRun it.\n\n</Steps>\n\n## Verify\n';
  assert.equal(mdxToMarkdown(source), '# Setup\n\n## Install\n\nRun it.\n\n## Verify\n');
});

void test('keeps Steps inside a code fence', () => {
  const source = '```mdx\n<Steps>\n\n## Install\n\n</Steps>\n```\n';
  assert.equal(mdxToMarkdown(source), source);
});
