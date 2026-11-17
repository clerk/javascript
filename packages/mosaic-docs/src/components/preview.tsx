import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { examples } from '@/examples';
import { highlight } from '@/lib/highlight';

import { PreviewTabs } from './preview-tabs';

export async function Preview({ path }: { path: string }) {
  const Example = examples[path];
  if (!Example) {
    return null;
  }
  const code = (await readFile(join(process.cwd(), 'src/examples', `${path}.tsx`), 'utf8')).trim();
  const html = await highlight(code, 'tsx');
  return (
    <PreviewTabs
      code={code}
      preview={
        <div className='not-prose flex min-h-72 flex-wrap items-center justify-center gap-3 p-8'>
          <Example />
        </div>
      }
      source={<div dangerouslySetInnerHTML={{ __html: html }} />}
    />
  );
}
