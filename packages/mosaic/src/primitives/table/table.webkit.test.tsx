import { act, cleanup, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { Table } from './index';

afterEach(() => cleanup());

type Log = { id: string; message: string };

const LOGS: Log[] = [
  { id: 'a', message: 'Alpha' },
  { id: 'b', message: 'Bravo' },
  { id: 'c', message: 'Charlie' },
];

describe('Table in WebKit', () => {
  it('moves focus to the nearest row when the focused row is replaced by new rows', async () => {
    let replaceItems: (items: Log[]) => void = () => {};
    function Rows() {
      const [items, setItems] = useState(LOGS);
      replaceItems = setItems;
      return (
        <Table.Body
          items={items}
          itemToStringValue={log => log.id}
        >
          {log => (
            <Table.Row>
              <Table.Cell>{log.message}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      );
    }
    render(
      <Table.Root
        aria-label='Logs'
        selectionMode='single'
      >
        <Rows />
      </Table.Root>,
    );
    const row = (name: string) => screen.getByText(name).closest('tr');

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{End}');
    await expect.poll(() => document.activeElement).toBe(row('Charlie'));

    act(() =>
      replaceItems([
        { id: 'x', message: 'Xray' },
        { id: 'y', message: 'Yankee' },
      ]),
    );

    await expect.poll(() => document.activeElement).toBe(row('Yankee'));
  });
});
