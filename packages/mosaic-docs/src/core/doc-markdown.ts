import type { Doc, PropDocs } from './doc.ts';
import { type DocSection, docSections } from './doc-sections.ts';

export function docToMarkdown(doc: Doc, hrefFor: (name: string) => string | undefined): string {
  const blocks = [
    `# ${doc.name}`,
    doc.description,
    ...docSections(doc).flatMap(section => [`## ${section.title}`, ...sectionBlocks(section, hrefFor)]),
  ];
  return `${blocks.join('\n\n')}\n`;
}

function sectionBlocks(section: DocSection, hrefFor: (name: string) => string | undefined): string[] {
  switch (section.id) {
    case 'usage':
      return [list(section.items)];
    case 'best-practices':
      return [list(section.practices.map(practice => `${practice.do ? 'Do' : "Don't"}: ${practice.text}`))];
    case 'parts':
      return [list(section.parts.map(part => `${codeSpan(part.name)}: ${part.description}`))];
    case 'api':
      return section.parts.flatMap(part => [
        `### ${part.name}`,
        part.description,
        ...(part.slot ? [`Slot: ${codeSpan(part.slot)}`] : []),
        ...(part.props ? [propTable(part.props)] : []),
      ]);
    case 'options':
    case 'returns':
      return [propTable(section.props)];
    case 'examples':
      return section.examples.flatMap(example => [`### ${example.title}`, codeFence(example.code.trim(), 'tsx')]);
    case 'related':
      return [
        list(
          section.names.map(name => {
            const href = hrefFor(name);
            return href ? `[${name}](${href})` : codeSpan(name);
          }),
        ),
      ];
  }
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
