import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import { describe, expect, it } from 'vitest';

import { buildTocFromHeadings, extractToc, slugify } from '../extract-toc.mjs';

describe('slugify', () => {
  it('converts text to a URL-safe slug', () => {
    expect(slugify('Getting Started')).toBe('getting-started');
  });

  it('handles special characters', () => {
    expect(slugify('`useAuth()` hook')).toBe('useauth-hook');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('foo---bar')).toBe('foo-bar');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('--hello-world--')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('buildTocFromHeadings', () => {
  it('extracts headings at levels 2-4', () => {
    const headings = [
      { node: mockTextNode('Overview'), depth: 2 },
      { node: mockTextNode('Installation'), depth: 3 },
      { node: mockTextNode('Deep Detail'), depth: 4 },
    ];

    const toc = buildTocFromHeadings(headings);

    expect(toc).toEqual([
      { title: 'Overview', slug: 'overview', level: 2 },
      { title: 'Installation', slug: 'installation', level: 3 },
      { title: 'Deep Detail', slug: 'deep-detail', level: 4 },
    ]);
  });

  it('filters out headings outside the 2-4 range', () => {
    const headings = [
      { node: mockTextNode('Page Title'), depth: 1 },
      { node: mockTextNode('Section'), depth: 2 },
      { node: mockTextNode('Too Deep'), depth: 5 },
    ];

    const toc = buildTocFromHeadings(headings);

    expect(toc).toEqual([{ title: 'Section', slug: 'section', level: 2 }]);
  });

  it('filters out empty headings', () => {
    const headings = [
      { node: mockTextNode(''), depth: 2 },
      { node: mockTextNode('Valid'), depth: 2 },
    ];

    const toc = buildTocFromHeadings(headings);

    expect(toc).toEqual([{ title: 'Valid', slug: 'valid', level: 2 }]);
  });

  it('uses custom heading IDs from MDX annotations', () => {
    const headings = [
      {
        node: {
          type: 'heading',
          children: [
            { type: 'text', value: 'My Heading' },
            {
              type: 'mdxTextExpression',
              data: {
                estree: {
                  body: [
                    {
                      type: 'ExpressionStatement',
                      expression: {
                        properties: [
                          {
                            key: { name: 'id' },
                            value: { value: 'custom-anchor' },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        depth: 2,
      },
    ];

    const toc = buildTocFromHeadings(headings);

    expect(toc).toEqual([{ title: 'My Heading', slug: 'custom-anchor', level: 2 }]);
  });
});

describe('extractToc remark plugin', () => {
  it('adds toc to frontmatter for a document with headings', async () => {
    const input = `---
title: Test Page
description: A test page
---

## Getting Started

Some intro text.

### Installation

Install the package.

### Configuration

Configure the package.

## API Reference

API details here.
`;

    const result = await remark().use(remarkFrontmatter).use(extractToc()).process(input);

    const output = String(result);

    expect(output).toContain('toc:');
    expect(output).toContain('title: "Getting Started"');
    expect(output).toContain('slug: "getting-started"');
    expect(output).toContain('level: 2');
    expect(output).toContain('title: "Installation"');
    expect(output).toContain('slug: "installation"');
    expect(output).toContain('level: 3');
    expect(output).toContain('title: "Configuration"');
    expect(output).toContain('title: "API Reference"');
  });

  it('does not modify frontmatter when there are no headings', async () => {
    const input = `---
title: Empty Page
---

Just some text without headings.
`;

    const result = await remark().use(remarkFrontmatter).use(extractToc()).process(input);

    const output = String(result);

    expect(output).not.toContain('toc:');
  });

  it('skips h1 headings (only includes h2-h4)', async () => {
    const input = `---
title: Test
---

# Main Title

## Section One

### Subsection

#### Detail
`;

    const result = await remark().use(remarkFrontmatter).use(extractToc()).process(input);

    const output = String(result);

    expect(output).toContain('title: "Section One"');
    expect(output).toContain('title: "Subsection"');
    expect(output).toContain('title: "Detail"');
    expect(output).not.toContain('title: "Main Title"');
  });

  it('respects custom minDepth and maxDepth options', async () => {
    const input = `---
title: Test
---

## Level 2

### Level 3

#### Level 4
`;

    const result = await remark()
      .use(remarkFrontmatter)
      .use(extractToc({ minDepth: 2, maxDepth: 3 }))
      .process(input);

    const output = String(result);

    expect(output).toContain('title: "Level 2"');
    expect(output).toContain('title: "Level 3"');
    expect(output).not.toContain('title: "Level 4"');
  });

  it('works with MDX content', async () => {
    const input = `---
title: MDX Test
---

## Overview

<MyComponent />

### Props

Some props description.
`;

    const result = await remark().use(remarkFrontmatter).use(remarkMdx).use(extractToc()).process(input);

    const output = String(result);

    expect(output).toContain('title: "Overview"');
    expect(output).toContain('title: "Props"');
  });

  it('escapes double quotes in heading titles', async () => {
    const input = `---
title: Test
---

## The "best" approach
`;

    const result = await remark().use(remarkFrontmatter).use(extractToc()).process(input);

    const output = String(result);

    expect(output).toContain('title: "The \\"best\\" approach"');
  });

  it('does not add toc when frontmatter is missing', async () => {
    const input = `## Heading Without Frontmatter

Some content.
`;

    const result = await remark().use(remarkFrontmatter).use(extractToc()).process(input);

    const output = String(result);

    expect(output).not.toContain('toc:');
  });
});

function mockTextNode(text: string) {
  return {
    type: 'heading',
    children: [{ type: 'text', value: text }],
  };
}
