import { type BundledLanguage, codeToHtml } from 'shiki';

export function highlight(code: string, lang: BundledLanguage): Promise<string> {
  return codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
}
