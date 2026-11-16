import { codeToHtml } from 'shiki';

import { CopyButton } from './CopyButton';

/** A highlighted code block: a gray frame with an optional title bar around a white code card. */
export async function CodeBlock({ code, lang = 'tsx', title }: { code: string; lang?: string; title?: string }) {
  const html = await codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  }).catch(() =>
    codeToHtml(code.trimEnd(), {
      lang: 'text',
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    }),
  );

  return (
    <figure className='not-prose relative my-6 rounded-xl bg-gray-950/[0.035] p-1 ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10'>
      {title ? (
        <figcaption className='flex items-center justify-between py-1.5 pl-3 pr-1.5 font-mono text-xs font-medium text-gray-950 dark:text-white'>
          {title}
          <CopyButton code={code} />
        </figcaption>
      ) : (
        <div className='absolute right-2.5 top-2.5 z-10'>
          <CopyButton code={code} />
        </div>
      )}
      <div
        className='shiki-frame max-h-[28rem] overflow-auto rounded-lg bg-white font-mono text-[0.8125rem]/6 ring-1 ring-gray-950/5 dark:bg-gray-950 dark:ring-white/10'
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
