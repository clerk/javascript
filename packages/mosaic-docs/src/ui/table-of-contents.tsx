'use client';

import { useEffect, useRef, useState } from 'react';

import { activeSlugs, type HeadingBox, type TocHeading } from '@/core/toc';

const HEADER_HEIGHT = 64;

interface Thumb {
  top: number;
  height: number;
}

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const list = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<{ slugs: string[]; thumb?: Thumb }>({ slugs: [] });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const slugs = activeSlugs(headingBoxes(headings), { top: HEADER_HEIGHT, bottom: window.innerHeight });
        const thumb = list.current ? thumbFor(list.current, slugs) : undefined;
        setActive(current =>
          current.slugs.join() === slugs.join() &&
          current.thumb?.top === thumb?.top &&
          current.thumb?.height === thumb?.height
            ? current
            : { slugs, thumb },
        );
      });
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

  if (headings.length === 0) {
    return null;
  }

  return (
    <div>
      <p className='text-foreground mb-3 text-sm font-semibold'>On this page</p>
      <div className='relative'>
        <div
          aria-hidden
          className='bg-border absolute inset-y-0 left-0 w-px'
        />
        {active.thumb && (
          <div
            aria-hidden
            className='bg-foreground absolute left-0 w-px transition-[top,height] duration-200 ease-out'
            style={{ top: active.thumb.top, height: active.thumb.height }}
          />
        )}
        <ul
          ref={list}
          className='m-0 list-none p-0'
        >
          {headings.map(heading => (
            <li
              key={heading.slug}
              data-slug={heading.slug}
              style={{ paddingInlineStart: `${0.75 + (heading.depth - 2) * 0.75}rem` }}
            >
              <a
                href={`#${heading.slug}`}
                aria-current={active.slugs.includes(heading.slug) ? 'location' : undefined}
                className='text-muted-foreground hover:text-foreground aria-[current=location]:text-foreground block py-1.5 transition-colors'
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function headingBoxes(headings: TocHeading[]): HeadingBox[] {
  return headings.flatMap(heading => {
    const element = document.getElementById(heading.slug);
    if (!element || element.getClientRects().length === 0) {
      return [];
    }
    const { top, bottom } = element.getBoundingClientRect();
    return [{ slug: heading.slug, top, bottom }];
  });
}

function thumbFor(list: HTMLUListElement, slugs: string[]): Thumb | undefined {
  const items = slugs.flatMap(slug => {
    const item = list.querySelector<HTMLElement>(`[data-slug="${CSS.escape(slug)}"]`);
    return item ? [item] : [];
  });
  const first = items.at(0);
  const last = items.at(-1);
  if (!first || !last) {
    return undefined;
  }
  return { top: first.offsetTop, height: last.offsetTop + last.offsetHeight - first.offsetTop };
}
