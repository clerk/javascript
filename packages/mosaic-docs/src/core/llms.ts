export interface LlmsSite {
  name: string;
  url: string;
  description: string;
  details: string;
}

export interface LlmsSection {
  title: string;
  pages: { title: string; href: string; description: string }[];
}

export interface LlmsPage {
  href: string;
  markdown: string;
}

export function llmsIndex(site: LlmsSite, sections: LlmsSection[]): string {
  const blocks = [header(site), site.details];
  for (const section of sections) {
    if (section.pages.length > 0) {
      blocks.push(
        `## ${section.title}`,
        section.pages.map(page => `- [${page.title}](${site.url}${page.href}.md): ${page.description}`).join('\n'),
      );
    }
  }
  blocks.push(
    '## Agent resources',
    [
      `- [llms-full.txt](${site.url}/llms-full.txt): The full Markdown of every page in one file.`,
      `- [Page Markdown](${site.url}/docs/setup.md): Append \`.md\` to any docs page URL to fetch that page as Markdown.`,
    ].join('\n'),
  );
  return `${blocks.join('\n\n')}\n`;
}

export function llmsFull(site: LlmsSite, pages: LlmsPage[]): string {
  const sections = pages.map(page => {
    const [heading, ...body] = page.markdown.trim().split('\n');
    return [heading, `Source: ${site.url}${page.href}`, ...body].join('\n');
  });
  return `${[header(site), sections.join('\n\n---\n\n')].join('\n\n')}\n`;
}

function header(site: LlmsSite): string {
  return `# ${site.name}\n\n> ${site.description}`;
}
