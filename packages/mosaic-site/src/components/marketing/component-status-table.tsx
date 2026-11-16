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
  return (
    <section
      aria-labelledby='component-status'
      className='relative z-10'
    >
      <Container className='pb-32'>
        <h2
          id='component-status'
          className='heading-4 sm:heading-3 font-normal!'
        >
          Component support
        </h2>
        <p className='body-2 mt-2 max-w-xl text-balance text-neutral-600 dark:text-neutral-400'>
          Not all blocks and configurations are supported yet. Here’s how the beta compares to Clerk’s current
          components.
        </p>
        <div className='mt-8 overflow-x-auto'>
          <table className='w-full min-w-[56rem] text-left'>
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
                <th
                  scope='col'
                  className='w-[30%] py-3 pl-4 font-normal'
                >
                  Notes
                </th>
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
                    {row.beta && row.renamedTo ? (
                      <>
                        <s>
                          <code className='code-inline'>{`<${row.beta} />`}</code>
                        </s>{' '}
                        renamed <code className='code-inline'>{`<${row.renamedTo} />`}</code>
                      </>
                    ) : row.beta ? (
                      <code className='code-inline'>{`<${row.beta} />`}</code>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className='whitespace-nowrap py-3 pl-4'>
                    <Badge className='w-fit gap-1.5 font-normal'>
                      {STATUS[row.status].icon}
                      {STATUS[row.status].label}
                    </Badge>
                  </td>
                  <td className='body-3 min-w-[16rem] py-3 pl-4 text-neutral-600 dark:text-neutral-400'>
                    {row.notes && <InlineCode text={row.notes} />}
                  </td>
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
