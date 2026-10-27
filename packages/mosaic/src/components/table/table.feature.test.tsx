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

describe('Mosaic Table expand button', () => {
  it.each([
    ['ltr', 'collapsed', 'none'],
    ['ltr', 'expanded', 'matrix(0, 1, -1, 0, 0, 0)'],
    ['rtl', 'collapsed', 'matrix(-1, 0, 0, 1, 0, 0)'],
    ['rtl', 'expanded', 'matrix(0, 1, -1, 0, 0, 0)'],
  ] as const)('points the %s chevron for a %s row', (dir, state, transform) => {
    render(
      <MosaicProvider>
        <div dir={dir}>
          <Table.Root
            aria-label='Tree'
            defaultExpanded={state === 'expanded' ? ['parent'] : []}
          >
            <Table.Header>
              <Table.Column>Name</Table.Column>
            </Table.Header>
            <Table.Body
              items={[{ id: 'parent', children: [{ id: 'child', children: [] }] }]}
              itemToStringValue={item => item.id}
              itemToChildren={item => item.children}
            >
              {item => (
                <Table.Row expandable={item.children.length > 0}>
                  <Table.Cell>
                    {item.children.length > 0 && <Table.ExpandButton aria-label={`Expand ${item.id}`} />}
                    {item.id}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>
      </MosaicProvider>,
    );
    const icon = screen.getByRole('button', { name: 'Expand parent' }).querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon && getComputedStyle(icon).transform).toBe(transform);
  });
});

describe('Mosaic Table sticky fade', () => {
  it.each([
    ['ltr', 'start', 'to right'],
    ['ltr', 'end', 'to left'],
    ['rtl', 'start', 'to left'],
    ['rtl', 'end', 'to right'],
  ] as const)('fades %s %s-pinned cells away from the pinned edge', (dir, side, gradient) => {
    render(
      <MosaicProvider>
        <div dir={dir}>
          <Table.Root aria-label='Keys'>
            <Table.Header>
              <Table.Column>Name</Table.Column>
            </Table.Header>
            <Table.Body
              items={['alpha']}
              itemToStringValue={item => item}
            >
              {() => (
                <Table.Row>
                  <Table.Cell sticky={side}>Alpha</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>
      </MosaicProvider>,
    );
    expect(getComputedStyle(screen.getByRole('cell', { name: 'Alpha' }), '::before').backgroundImage).toContain(
      `linear-gradient(${gradient}`,
    );
  });
});
