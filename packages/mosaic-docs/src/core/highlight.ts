import { type BundledLanguage, codeToHtml, createCssVariablesTheme } from 'shiki';

const theme = createCssVariablesTheme({ name: 'docs' });

export function highlight(code: string, lang: BundledLanguage): Promise<string> {
  return codeToHtml(code, { lang, theme });
}
