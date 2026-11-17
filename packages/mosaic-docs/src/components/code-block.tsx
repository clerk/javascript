import type { BundledLanguage } from 'shiki';

import { highlight } from '@/lib/highlight';

import { CopyButton } from './copy-button';

export async function CodeBlock({ code, lang }: { code: string; lang: BundledLanguage }) {
  const html = await highlight(code, lang);
  return (
    <figure className='code-block'>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <CopyButton
        text={code}
        className='absolute right-2 top-2'
      />
    </figure>
  );
}
