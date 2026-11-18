export function mdxToMarkdown(source: string): string {
  let fenced = false;
  const lines: string[] = [];
  let dropBlank = false;
  for (const line of source.split('\n')) {
    if (line.startsWith('```')) {
      fenced = !fenced;
    }
    if (!fenced && /^<\/?Steps>$/.test(line)) {
      dropBlank = true;
      continue;
    }
    if (dropBlank && line === '') {
      dropBlank = false;
      continue;
    }
    dropBlank = false;
    lines.push(line);
  }
  return lines.join('\n');
}
