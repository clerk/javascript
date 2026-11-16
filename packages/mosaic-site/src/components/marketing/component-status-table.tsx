'use client';

import { useState } from 'react';

import { ClerkUILogo } from '@/components/marketing/clerk-logo';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { InlineCode } from '@/components/ui/inline-code';
import { COMPONENT_STATUS, type ComponentStatus } from '@/lib/component-status';
import { cn } from '@/lib/utils';

const STATUS: Record<ComponentStatus, { label: string; icon: React.ReactNode }> = {
  done: { label: 'Done', icon: <StatusDot className='bg-green-500 dark:bg-green-400' /> },
  available: { label: 'Stable', icon: <StatusDot className='bg-blue-500 dark:bg-blue-400' /> },
  'in-progress': { label: 'In progress', icon: <HalfCircleIcon /> },
  'not-yet': { label: 'Not yet', icon: <StatusDot className='ring-1 ring-inset ring-gray-400 dark:ring-gray-500' /> },
};

export function ComponentStatusTable() {
  const [notesShown, setNotesShown] = useState(false);

  const showNote = (stable: string) => {
    setNotesShown(true);
    requestAnimationFrame(() => document.getElementById(noteId(stable))?.focus());
  };

  return (
    <section
      aria-labelledby='component-status'
      className='relative z-10'
    >
      <Container className='pb-32'>
        <h2
          id='component-status'
          className='heading-4 sm:heading-3'
        >
          Component support
        </h2>
        <div className='mt-2 flex flex-wrap items-end justify-between gap-4'>
          <p className='body-2 max-w-xl text-balance text-neutral-600 dark:text-neutral-400'>
            Not all blocks and configurations are supported yet. Here’s how the beta compares to Clerk’s current
            components.
          </p>
          <button
            type='button'
            aria-expanded={notesShown}
            aria-controls='component-status-table'
            onClick={() => setNotesShown(shown => !shown)}
            className='label-3 rounded-squircle-md bg-foreground/[0.06] hover:bg-foreground/10 focus-visible:outline-focus text-foreground inline-flex h-[1.625rem] shrink-0 items-center gap-1.5 px-2.5 font-normal transition-colors'
          >
            <NoteIcon />
            <span className='trim-cap'>{notesShown ? 'Hide detailed notes' : 'View detailed notes'}</span>
          </button>
        </div>
        <div className='mt-8 overflow-x-auto'>
          <table
            id='component-status-table'
            className={cn('w-full text-left', notesShown ? 'min-w-[56rem]' : 'min-w-[44rem]')}
          >
            <thead>
              <tr className='border-border body-3 border-b text-gray-600 dark:text-gray-400'>
                <th
                  scope='col'
                  className='py-3 pr-4 font-normal'
                >
                  Current component
                </th>
                <th
                  scope='col'
                  className='bg-foreground/[0.04] px-4 py-3 font-normal'
                >
                  <span className='text-foreground flex items-center gap-2'>
                    <ClerkUILogo
                      aria-hidden='true'
                      className='h-4'
                    />
                    <Badge
                      tone='purple'
                      className='font-normal'
                    >
                      Beta
                    </Badge>
                    <span className='sr-only'>Clerk UI beta</span>
                  </span>
                </th>
                <th
                  scope='col'
                  className='py-3 pl-4 font-normal'
                >
                  Status
                </th>
                {notesShown && (
                  <th
                    scope='col'
                    className='w-[30%] py-3 pl-4 font-normal'
                  >
                    Notes
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {COMPONENT_STATUS.map(row => (
                <tr
                  key={row.stable}
                  className='border-border label-3 border-b font-normal [&_code]:font-normal [&_strong]:font-normal'
                >
                  <td className='py-3 pr-4 text-neutral-600 dark:text-neutral-400'>
                    <code className='code-inline'>{`<${row.stable} />`}</code>
                  </td>
                  <td className='bg-foreground/[0.04] text-foreground px-4 py-3'>
                    <span className='flex items-center gap-1.5'>
                      {row.renamedTo ? (
                        <span>
                          <span className='body-3 text-gray-600 dark:text-gray-400'>Renamed to</span>{' '}
                          <code className='code-inline'>{`<${row.renamedTo} />`}</code>
                        </span>
                      ) : row.beta ? (
                        <code className='code-inline'>{`<${row.beta} />`}</code>
                      ) : (
                        <span className='body-3 text-gray-600 dark:text-gray-400'>—</span>
                      )}
                      {row.notes && !notesShown && (
                        <button
                          type='button'
                          aria-label={`Show the note for ${row.stable}`}
                          title='Show note'
                          onClick={() => showNote(row.stable)}
                          className='rounded-squircle-md hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-focus -my-1 flex size-6 shrink-0 items-center justify-center text-gray-500 transition-colors dark:text-gray-400'
                        >
                          <NoteIcon />
                        </button>
                      )}
                    </span>
                  </td>
                  <td className='whitespace-nowrap py-3 pl-4'>
                    <Badge className='w-fit gap-1.5 font-normal'>
                      {STATUS[row.status].icon}
                      {STATUS[row.status].label}
                    </Badge>
                  </td>
                  {notesShown && (
                    <td
                      id={noteId(row.stable)}
                      tabIndex={row.notes ? -1 : undefined}
                      className='body-3 min-w-[16rem] py-3 pl-4 text-neutral-600 outline-none dark:text-neutral-400'
                    >
                      {row.notes && <InlineCode text={row.notes} />}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}

function StatusDot({ className }: { className: string }) {
  return (
    <span
      aria-hidden='true'
      className={cn('size-1.5 shrink-0 rounded-full', className)}
    />
  );
}

function HalfCircleIcon() {
  return (
    <svg
      viewBox='0 0 10 10'
      aria-hidden='true'
      className='size-2.5 shrink-0 text-gray-400 dark:text-gray-500'
    >
      <circle
        cx='5'
        cy='5'
        r='4.25'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M5 2.5a2.5 2.5 0 0 1 0 5z'
        fill='currentColor'
      />
    </svg>
  );
}

function noteId(stable: string) {
  return `component-status-note-${stable}`;
}

function NoteIcon() {
  return (
    <svg
      viewBox='0 0 16 16'
      aria-hidden='true'
      className='size-3.5 shrink-0'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.25'
      strokeLinecap='round'
    >
      <rect
        x='2.625'
        y='2.625'
        width='10.75'
        height='10.75'
        rx='2.5'
      />
      <path d='M5.5 6h5M5.5 8h5M5.5 10h3' />
    </svg>
  );
}
