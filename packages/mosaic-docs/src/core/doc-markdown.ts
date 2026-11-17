import type { Doc, PropDocs } from './doc.ts';

export function docToMarkdown(doc: Doc, hrefFor: (name: string) => string | undefined): string {
  const blocks = [`# ${doc.name}`, doc.description, '## Use for', list(doc.useFor)];

  if (doc.practices?.length) {
    blocks.push(
      '## Practices',
      list(doc.practices.map(practice => `${practice.do ? 'Do' : "Don't"}: ${practice.text}`)),
    );
  }

  if ('parts' in doc) {
    blocks.push('## API reference');
    for (const [name, part] of Object.entries(doc.parts)) {
      blocks.push(`### ${name}`, part.description);
      if (part.slot) {
        blocks.push(`Slot: ${codeSpan(part.slot)}`);
      }
      if (part.props) {
        blocks.push(propTable(part.props));
      }
    }
  } else {
    if (doc.options && Object.keys(doc.options).length > 0) {
      blocks.push('## Options', propTable(doc.options));
    }
    blocks.push('## Returns', propTable(doc.returns));
  }

  if (doc.examples?.length) {
    blocks.push('## Examples');
    for (const example of doc.examples) {
      blocks.push(`### ${example.title}`, codeFence(example.code.trim(), 'tsx'));
    }
  }

  if (doc.related?.length) {
    blocks.push(
      '## Related',
      list(
        doc.related.map(name => {
          const href = hrefFor(name);
          return href ? `[${name}](${href}.md)` : codeSpan(name);
        }),
      ),
    );
  }

  return `${blocks.join('\n\n')}\n`;
}

function list(items: string[]): string {
  return items.map(item => `- ${item}`).join('\n');
}

function propTable(props: PropDocs): string {
  const rows = Object.entries(props).flatMap(([name, prop]) =>
    prop
      ? [
          [codeSpan(name), codeSpan(prop.type), prop.default ? codeSpan(prop.default) : '', prop.doc]
            .map(cell)
            .join(' | '),
        ]
      : [],
  );
  return [
    '| Prop | Type | Default | Description |',
    '| --- | --- | --- | --- |',
    ...rows.map(row => `| ${row} |`),
  ].join('\n');
}

function cell(text: string): string {
  return text.replace(/\s*\n\s*/g, ' ').replace(/\\?\|/g, pipe => (pipe === '|' ? '\\|' : '\\\\\\|'));
}

function codeSpan(text: string): string {
  const ticks = '`'.repeat(longestRun(text, '`') + 1);
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
  return `${ticks}${pad}${text}${pad}${ticks}`;
}

function codeFence(code: string, language: string): string {
  const fence = '`'.repeat(Math.max(3, longestRun(code, '`') + 1));
  return `${fence}${language}\n${code}\n${fence}`;
}

function longestRun(text: string, char: string): number {
  let longest = 0;
  let current = 0;
  for (const c of text) {
    current = c === char ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return longest;
}
