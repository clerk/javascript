import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
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
          <table className='w-full min-w-[32rem] text-left'>
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
                  className='py-3 pr-4 font-normal'
                >
                  Clerk UI beta
                </th>
                <th
                  scope='col'
                  className='py-3 font-normal'
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPONENT_STATUS.map(row => (
                <tr
                  key={row.stable}
                  className='border-border label-3 border-b'
                >
                  <td className='py-3 pr-4'>
                    <code className='code-inline'>{`<${row.stable} />`}</code>
                  </td>
                  <td className='py-3 pr-4 text-neutral-600 dark:text-neutral-400'>
                    {row.beta ? <code className='code-inline'>{`<${row.beta} />`}</code> : '—'}
                  </td>
                  <td className='py-3'>
                    <Badge
                      tone={STATUS[row.status].tone}
                      className='w-fit'
                    >
                      {STATUS[row.status].label}
                    </Badge>
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
