'use client';
import clsx from 'clsx';
import * as React from 'react';

type Feature = { title: string; description: string; icon: React.ReactNode };

const icon = (path: string) => (
  <svg
    viewBox='0 0 24 24'
    className='size-6'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <path d={path} />
  </svg>
);

const FEATURES: Feature[] = [
  {
    title: 'Composable',
    description: 'Rearrange, restyle and replace any part of a component without forking it.',
    icon: icon('M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM15.5 13v7M13 16.5h7'),
  },
  {
    title: 'Agent-native',
    description: 'A plain model, controller and view split that coding agents can read, extend and test.',
    icon: icon('m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14'),
  },
  {
    title: 'Themeable',
    description: 'Tokens, CSS slots and themes restyle every component, from one avatar to a whole account.',
    icon: icon(
      'M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-2 0-1.4-1-1.6-1-2.8 0-1 .8-1.7 2-1.7h2.2A3.8 3.8 0 0 0 21 8.7C21 5.4 17 3 12 3ZM7.5 12h.01M9 8h.01M14 7.5h.01',
    ),
  },
  {
    title: 'Powered by Clerk',
    description: 'Sessions, organizations and billing are wired to Clerk, so the UI is ready for production.',
    icon: icon('M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'),
  },
];

export function FeatureTabs() {
  const [active, setActive] = React.useState(0);

  return (
    <div className='mt-16'>
      <div
        role='tabpanel'
        aria-label={FEATURES[active].title}
        className='bg-foreground/[0.04] relative aspect-[1216/600] w-full overflow-hidden rounded-md max-md:hidden lg:aspect-auto lg:h-[600px]'
      />
      <div
        role='tablist'
        aria-label='Principles'
        className='mt-10 grid gap-y-10 max-md:mt-0 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[repeat(4,minmax(0,264px))] lg:gap-12'
      >
        {FEATURES.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.title}
              type='button'
              role='tab'
              aria-selected={selected}
              onClick={() => setActive(index)}
              className={clsx(
                'relative text-left outline-none [transition:opacity_200ms_ease,translate_300ms_cubic-bezier(0.23,1,0.32,1)] motion-reduce:[transition:opacity_200ms_ease] max-md:translate-y-0 max-md:opacity-100',
                selected ? 'opacity-100 md:-translate-y-2' : 'opacity-50 hover:opacity-75',
              )}
            >
              <span className='block size-6 text-gray-950 dark:text-white'>{item.icon}</span>
              <span className='mt-4 block text-[14px]/6 tracking-[-0.14px] text-gray-600 max-md:mt-6 dark:text-gray-400'>
                <span className='font-medium text-gray-950 dark:text-white'>{item.title}.</span> {item.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
