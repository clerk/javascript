import { ClerkUILogo } from '@/components/marketing/clerk-logo';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { InlineCode } from '@/components/ui/inline-code';
import { COMPONENT_STATUS, type ComponentStatus } from '@/lib/component-status';

const STATUS: Record<ComponentStatus, { label: string; tone: BadgeTone }> = {
  available: { label: 'Available', tone: 'beta' },
  'in-progress': { label: 'In progress', tone: 'neutral' },
  'not-yet': { label: 'Not yet', tone: 'neutral' },
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
          className='heading-4 sm:heading-3'
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
              <tr className='border-border body-3 border-b text-gray-500 dark:text-gray-400'>
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
                    <Badge tone='purple'>Beta</Badge>
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
                  className='border-border label-3 border-b'
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
                    <Badge
                      tone={STATUS[row.status].tone}
                      className='w-fit'
                    >
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
