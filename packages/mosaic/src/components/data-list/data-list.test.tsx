import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { DataList } from './data-list';

function renderList(props?: { divided?: boolean }) {
  return render(
    <MosaicProvider>
      <DataList.Root {...props}>
        <DataList.Item>
          <DataList.Label>IP address</DataList.Label>
          <DataList.Value>2600:100e:b10b:787b</DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </MosaicProvider>,
  );
}

describe('DataList', () => {
  it('pairs each value with its label', () => {
    const { container } = renderList();

    const label = screen.getByText('IP address');
    const value = screen.getByText('2600:100e:b10b:787b');
    expect(label.tagName).toBe('DT');
    expect(value.tagName).toBe('DD');
    expect(container.querySelector('dl')).toContainElement(label);
  });

  it('carries the slot classes a theme targets', () => {
    const { container } = renderList();

    expect(container.querySelector('.cl-data-list')).toBeInTheDocument();
    expect(container.querySelector('.cl-data-list-item')).toBeInTheDocument();
    expect(screen.getByText('IP address')).toHaveClass('cl-data-list-label');
    expect(screen.getByText('2600:100e:b10b:787b')).toHaveClass('cl-data-list-value');
  });

  it('reflects whether the items are ruled', () => {
    const { container, unmount } = renderList();
    expect(container.querySelector('.cl-data-list')).toHaveAttribute('data-divided');
    unmount();

    const plain = renderList({ divided: false });
    expect(plain.container.querySelector('.cl-data-list')).not.toHaveAttribute('data-divided');
  });
});
