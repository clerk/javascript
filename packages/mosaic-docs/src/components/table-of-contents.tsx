'use client';

import { useEffect, useState } from 'react';

import type { TocHeading } from '@/lib/navigation';

const TRIGGER_OFFSET = 96;

function activeSlug(headings: TocHeading[]): string | undefined {
  const rendered = headings.flatMap(heading => {
    const element = document.getElementById(heading.slug);
    return element && element.getClientRects().length > 0 ? [{ slug: heading.slug, element }] : [];
  });
  const scrolledToBottom =
    window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
  if (scrolledToBottom) {
    return rendered.at(-1)?.slug;
  }
  let active = rendered[0]?.slug;
  for (const entry of rendered) {
    if (entry.element.getBoundingClientRect().top <= TRIGGER_OFFSET) {
      active = entry.slug;
    }
  }
  return active;
}

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(activeSlug(headings)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [headings]);

  return (
    <>
      <p className='text-foreground mb-3 text-sm font-semibold'>On this page</p>
      <ul className='m-0 list-none p-0'>
        {headings.map(heading => (
          <li
            key={heading.slug}
            style={{ paddingInlineStart: `${(heading.depth - 2) * 0.75}rem` }}
          >
            <a
              href={`#${heading.slug}`}
              aria-current={heading.slug === active ? 'location' : undefined}
              className='text-muted-foreground hover:text-foreground aria-[current=location]:text-foreground block py-1.5 transition-colors aria-[current=location]:font-medium'
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
