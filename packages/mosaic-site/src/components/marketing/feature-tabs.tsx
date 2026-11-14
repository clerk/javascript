'use client';
import clsx from 'clsx';
import * as React from 'react';

import { PrinciplesScene, type SceneId } from '@/components/marketing/principles-scene';

type Feature = { id: SceneId; title: string; description: string; figure: string; icon: React.ReactNode };

const icon = (...paths: string[]) => (
  <svg
    viewBox='0 0 24 24'
    className='size-4'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    {paths.map(path => (
      <path
        key={path}
        d={path}
      />
    ))}
  </svg>
);

const FEATURES: Feature[] = [
  {
    id: 'composable',
    title: 'Composable',
    description: 'Rearrange, restyle, or replace any part of a component without forking.',
    figure: 'A user profile whose account sections can be dragged into a new order.',
    icon: icon(
      'M5.75 10.25H9.25C9.80228 10.25 10.25 9.80228 10.25 9.25V5.75C10.25 5.19772 9.80228 4.75 9.25 4.75H5.75C5.19772 4.75 4.75 5.19772 4.75 5.75V9.25C4.75 9.80228 5.19772 10.25 5.75 10.25Z',
      'M5.75 19.25H9.25C9.80228 19.25 10.25 18.8023 10.25 18.25V14.75C10.25 14.1977 9.80228 13.75 9.25 13.75H5.75C5.19772 13.75 4.75 14.1977 4.75 14.75V18.25C4.75 18.8023 5.19772 19.25 5.75 19.25Z',
      'M14.75 10.25H18.25C18.8023 10.25 19.25 9.80228 19.25 9.25V5.75C19.25 5.19772 18.8023 4.75 18.25 4.75H14.75C14.1977 4.75 13.75 5.19772 13.75 5.75V9.25C13.75 9.80228 14.1977 10.25 14.75 10.25Z',
      'M14.75 19.25H18.25C18.8023 19.25 19.25 18.8023 19.25 18.25V14.75C19.25 14.1977 18.8023 13.75 18.25 13.75H14.75C14.1977 13.75 13.75 14.1977 13.75 14.75V18.25C13.75 18.8023 14.1977 19.25 14.75 19.25Z',
    ),
  },
  {
    id: 'agent',
    title: 'Agent-native',
    description: 'Ask your agent for a change. It edits the view and leaves the logic alone.',
    figure: 'A user profile beside its source folders, each section split into model, controller, and view files.',
    icon: icon(
      'M10.75 10C13.5114 10 15 7.51142 15 4.75C15 7.51142 16.4886 10 19.25 10C16.4886 10 15 12.4886 15 15.25C15 12.4886 13.5114 10 10.75 10ZM4.75 16C6.40685 16 8 14.4069 8 12.75C8 14.4069 9.59315 16 11.25 16C9.59315 16 8 17.5931 8 19.25C8 17.5931 6.40685 16 4.75 16Z',
    ),
  },
  {
    id: 'theme',
    title: 'Themeable',
    description: 'Tokens, CSS slots, and themes restyle everything from avatar to account.',
    figure: 'A user profile with a theme picker that restyles it between Default, Workday, and After hours.',
    icon: icon(
      'M12.7889 8.73613L16.1973 5.32789C16.9168 4.60841 18.0541 4.57917 18.7375 5.26259C19.4209 5.94601 19.3917 7.08328 18.6722 7.80276L15.2375 11.2375',
      'M12.3335 8.33335L15.6665 11.6664C16.4153 12.4152 16.4507 13.6179 15.7471 14.4094L15 15.2499L8.75 8.99988L9.59053 8.25274C10.382 7.54921 11.5847 7.58456 12.3335 8.33335Z',
      'M9 10L4.75 12.75L11.25 19.25L14 15',
      'M7 15L8.25 13.75',
    ),
  },
  {
    id: 'clerk',
    title: 'Powered by Clerk',
    description: 'Sessions, organizations, and billing run on Clerk, ready for production.',
    figure: 'A user profile outlined by component, with the Clerk hooks each section uses.',
    icon: icon(
      'M4.75002 8L12 4.75L19.25 8C19.25 8 20 19.25 12 19.25C4.00002 19.25 4.75002 8 4.75002 8Z',
      'M9.75 12.75L11 14.25L14.25 9.75',
    ),
  },
];

export function FeatureTabs() {
  const [active, setActive] = React.useState(0);
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = React.useId();

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = FEATURES.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role='tabpanel'
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
        className='feature-glow focus-visible:outline-focus relative mt-16 h-[25rem] rounded-[24px] bg-gray-100 outline-none focus-visible:outline-offset-4 supports-[corner-shape:squircle]:rounded-[32px] supports-[corner-shape:squircle]:[corner-shape:squircle] max-xl:mx-[calc(50%-50vw)] max-xl:!rounded-none sm:h-[30rem] xl:-mx-8 2xl:mx-0 dark:bg-gray-900'
      >
        <div
          role='img'
          aria-label={FEATURES[active].figure}
          className='absolute inset-0'
        >
          <PrinciplesScene scene={FEATURES[active].id} />
        </div>
      </div>
      <div
        role='tablist'
        aria-label='Principles'
        className='mt-8 grid items-start gap-y-8 max-lg:mt-16 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-4 lg:gap-12'
      >
        {FEATURES.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.title}
              ref={element => {
                tabRefs.current[index] = element;
              }}
              type='button'
              role='tab'
              id={`${baseId}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              aria-labelledby={`${baseId}-title-${index}`}
              aria-describedby={`${baseId}-description-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={event => onKeyDown(event, index)}
              className={clsx(
                'focus-visible:outline-focus group relative rounded-lg text-left outline-none focus-visible:outline-offset-4',
              )}
            >
              <span className='grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1'>
                <span
                  className={clsx(
                    'mt-0.5 block size-4 transition-colors',
                    selected
                      ? 'text-gray-950 dark:text-white'
                      : 'text-gray-600 group-hover:text-gray-950 dark:text-gray-400 dark:group-hover:text-white',
                  )}
                >
                  {item.icon}
                </span>
                <span
                  id={`${baseId}-title-${index}`}
                  className={clsx(
                    'label-3 text-pretty transition-colors',
                    selected
                      ? 'text-gray-950 dark:text-white'
                      : 'text-gray-600 group-hover:text-gray-950 dark:text-gray-400 dark:group-hover:text-white',
                  )}
                >
                  {item.title}
                </span>
                <span
                  id={`${baseId}-description-${index}`}
                  className={clsx(
                    'body-3 col-start-2 text-pretty max-sm:max-w-[16rem]',
                    selected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400',
                  )}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
