import { type BundledLanguage, codeToHtml, codeToTokens, createCssVariablesTheme } from 'shiki';

const theme = createCssVariablesTheme({ name: 'docs' });

export function highlight(code: string, lang: BundledLanguage): Promise<string> {
  return codeToHtml(code, { lang, theme });
}

export interface HighlightToken {
  content: string;
  color: string | undefined;
}

export async function highlightTokens(line: string, lang: BundledLanguage): Promise<HighlightToken[]> {
  const { tokens } = await codeToTokens(line, { lang, theme });
  return tokens.flat().map(({ content, color }) => ({ content, color }));
}
