import type { ReactNode } from 'react';

import type { TocHeading } from '@/core/toc';

export function PageOutline({ headings, children }: { headings: TocHeading[]; children?: ReactNode }) {
  return (
    <details className='not-prose rounded-docs border-border group mb-8 border xl:hidden'>
      <summary className='text-foreground flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden'>
        On this page
        <svg
          aria-hidden
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180'
        >
          <path d='m6 9 6 6 6-6' />
        </svg>
      </summary>
      {headings.length > 0 && (
        <ul className='border-border m-0 list-none border-t p-2'>
          {headings.map(heading => (
            <li
              key={heading.slug}
              style={{ paddingInlineStart: `${(heading.depth - 2) * 0.75}rem` }}
            >
              <a
                href={`#${heading.slug}`}
                className='text-muted-foreground hover:text-foreground block rounded-md px-2 py-1.5 text-sm transition-colors'
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      )}
      {children ? <div className='border-border border-t px-4 py-2'>{children}</div> : null}
    </details>
  );
}
