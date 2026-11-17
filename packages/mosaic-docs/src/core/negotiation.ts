const markdownTypes = new Set(['text/markdown', 'text/x-markdown', 'text/plain']);
const htmlTypes = new Set(['text/html', 'text/*', '*/*']);

export function prefersMarkdown(accept: string | null): boolean {
  let markdown = 0;
  let html = 0;
  for (const { type, quality } of parseAccept(accept ?? '')) {
    if (markdownTypes.has(type)) {
      markdown = Math.max(markdown, quality);
    } else if (htmlTypes.has(type)) {
      html = Math.max(html, quality);
    }
  }
  return markdown > 0 && markdown >= html;
}

function parseAccept(accept: string): { type: string; quality: number }[] {
  return accept.split(',').flatMap(range => {
    const [type = '', ...params] = range.split(';').map(part => part.trim().toLowerCase());
    if (!type) {
      return [];
    }
    const q = params.find(param => param.startsWith('q='));
    const quality = q ? Number.parseFloat(q.slice(2)) : 1;
    return [{ type, quality: Number.isNaN(quality) ? 1 : quality }];
  });
}
