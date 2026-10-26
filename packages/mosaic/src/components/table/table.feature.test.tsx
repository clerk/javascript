import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { Table } from './table';

function renderNarrowTable(minWidth: string) {
  return render(
    <MosaicProvider>
      <div style={{ width: '200px' }}>
        <Table.Root
          aria-label='Keys'
          layout='fixed'
          minWidth={minWidth}
        >
          <Table.Header>
            <Table.Column>Name</Table.Column>
            <Table.Column width='9rem'>Created</Table.Column>
          </Table.Header>
          <Table.Body
            items={['alpha']}
            itemToStringValue={item => item}
          >
            {() => (
              <Table.Row>
                <Table.Cell>Alpha</Table.Cell>
                <Table.Cell>Today</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </div>
    </MosaicProvider>,
  );
}

const nameColumnWidth = () =>
  within(screen.getByRole('table', { name: 'Keys' }))
    .getByRole('columnheader', { name: 'Name' })
    .getBoundingClientRect().width;

describe('Mosaic Table', () => {
  it('keeps the flexible column open when given a minimum width', () => {
    renderNarrowTable('20rem');

    expect(nameColumnWidth()).toBe(176);
  });
});
