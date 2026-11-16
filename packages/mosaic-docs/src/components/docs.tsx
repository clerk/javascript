import Link from 'next/link';

import { CodeBlock } from '@/components/CodeBlock';
import { itemHref, type Prop } from '@/lib/content';

export function Example({ name, code }: { name: string; code?: string }) {
  if (!code) {
    return null;
  }
  return (
    <CodeBlock
      title={name.replace(/([a-z])([A-Z])/g, '$1 $2')}
      lang='tsx'
      code={code}
    />
  );
}

export function PropsTable({ props }: { props: Array<Prop> | null }) {
  if (!props?.length) {
    return null;
  }
  return (
    <div className='not-prose my-6 overflow-x-auto rounded-xl border border-gray-950/10 dark:border-white/10'>
      <table className='w-full text-left text-sm'>
        <thead className='bg-gray-50 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400'>
          <tr>
            <th className='px-4 py-2 font-medium'>Prop</th>
            <th className='px-4 py-2 font-medium'>Type</th>
            <th className='px-4 py-2 font-medium'>Default</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-950/5 dark:divide-white/5'>
          {props.map(prop => (
            <tr
              key={prop.name}
              className='align-top'
            >
              <td className='whitespace-nowrap px-4 py-2.5 font-mono text-[0.8125rem] font-medium text-purple-600 dark:text-purple-300'>
                {prop.name}
              </td>
              <td className='px-4 py-2.5 font-mono text-[0.8125rem] text-gray-700 dark:text-gray-300'>{prop.type}</td>
              <td className='px-4 py-2.5 font-mono text-[0.8125rem] text-gray-500 dark:text-gray-400'>
                {prop.default ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PrevNext({
  prev,
  next,
}: {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}) {
  return (
    <nav className='mt-16 flex items-center justify-between gap-4 border-t border-gray-950/5 pt-6 text-sm dark:border-white/10'>
      {prev ? (
        <Link
          href={prev.href}
          className='group flex flex-col'
        >
          <span className='text-xs text-gray-500'>Previous</span>
          <span className='font-medium text-gray-950 group-hover:text-purple-600 dark:text-white'>{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className='group flex flex-col text-right'
        >
          <span className='text-xs text-gray-500'>Next</span>
          <span className='font-medium text-gray-950 group-hover:text-purple-600 dark:text-white'>{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function ItemGrid({ section, entries }: { section: string; entries: Array<{ slug: string; title: string }> }) {
  return (
    <ul className='mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      {entries.map(entry => (
        <li key={entry.slug}>
          <Link
            href={itemHref(section, entry.slug)}
            className='block h-full rounded-xl border border-gray-950/10 p-4 transition-colors hover:border-gray-950/20 hover:bg-gray-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5'
          >
            <span className='text-sm font-medium text-gray-950 dark:text-white'>{entry.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
