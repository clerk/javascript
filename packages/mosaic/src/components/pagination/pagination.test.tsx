import * as stylex from '@stylexjs/stylex';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { rtl } from '../../utils/rtl.styles';
import { Pagination } from './pagination';
import { styles } from './pagination.styles';

const atoms = stylex.create({
  spaced: { marginTop: '8px' },
});

function controls(): ReturnType<typeof within> {
  const element = document.querySelector('.cl-pagination-controls');
  if (!(element instanceof HTMLElement)) {
    throw new Error('Pagination controls did not render');
  }
  return within(element);
}

describe('Mosaic Pagination', () => {
  it('renders the item range, page count, and styling contract', () => {
    render(
      <Pagination
        page={3}
        totalItems={44}
        pageSize={10}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toHaveClass('cl-pagination');
    expect(screen.getByText('21–30 of 44')).toHaveClass('cl-pagination-range');
    expect(screen.getByText('3/5')).toHaveClass('cl-pagination-page-label');
  });

  it('uses the label prop as the accessible name', () => {
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
        label='Invoices'
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Invoices' })).toBeInTheDocument();
  });

  it('retains the sibling count styling contract', () => {
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
        siblingCount={2}
      />,
    );
    expect(screen.getByRole('navigation')).toHaveAttribute('data-sibling-count', '2');
  });

  it('moves with the first, previous, next, and last controls', async () => {
    const onChange = vi.fn();
    render(
      <Pagination
        page={5}
        totalItems={100}
        pageSize={10}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'First page' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenLastCalledWith(6);
    await userEvent.click(screen.getByRole('button', { name: 'Last page' }));
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('moves by step and clamps at the ends', async () => {
    const onChange = vi.fn();
    render(
      <Pagination
        page={9}
        totalItems={100}
        pageSize={10}
        step={5}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('disables backward controls on the first page and forward controls on the last', () => {
    const { rerender } = render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
      />,
    );
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();

    rerender(
      <Pagination
        page={10}
        totalItems={100}
        pageSize={10}
      />,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
  });

  it('can omit the first and last controls', () => {
    render(
      <Pagination
        page={5}
        totalItems={100}
        pageSize={10}
        hasFirstLast={false}
      />,
    );
    expect(screen.queryByRole('button', { name: 'First page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Last page' })).not.toBeInTheDocument();
  });

  it('disables every control when disabled', () => {
    render(
      <Pagination
        page={5}
        totalItems={100}
        pageSize={10}
        disabled
      />,
    );
    expect(screen.getByRole('navigation')).toHaveAttribute('data-disabled', '');
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('shows and changes the page size', async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: /Results per page/ });
    expect(trigger).toHaveTextContent('10');
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('option', { name: '20' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('uses custom visible and accessible labels', () => {
    render(
      <Pagination
        page={2}
        totalItems={100}
        pageSize={10}
        rangeLabel='{start} à {end} sur {total}'
        pageSizeLabel='Rows per page'
        pageSizeLabelCompact='Rows'
        firstPageLabel='Start'
        previousPageLabel='Back'
        nextPageLabel='Forward'
        lastPageLabel='End'
      />,
    );
    expect(screen.getByText('11 à 20 sur 100')).toHaveClass('cl-pagination-range');
    expect(screen.getByText('Rows per page')).toBeInTheDocument();
    expect(screen.getByText('Rows')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Rows per page/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'End' })).toBeInTheDocument();
  });

  it('mirrors the direction-aware control icons under rtl', () => {
    render(
      <Pagination
        page={2}
        totalItems={100}
        pageSize={10}
      />,
    );
    const mirror = stylex.props(rtl.mirror).className ?? '';
    for (const name of ['First page', 'Previous page', 'Next page', 'Last page']) {
      expect(screen.getByRole('button', { name }).querySelector('svg')).toHaveClass(mirror);
    }
  });

  it('uses small outlined navigation controls', () => {
    render(
      <Pagination
        page={2}
        totalItems={100}
        pageSize={10}
      />,
    );
    for (const button of controls().getAllByRole('button')) {
      expect(button).toHaveAttribute('data-size', 'sm');
      expect(button).toHaveAttribute('data-variant', 'outline');
    }
  });

  it('offers valid given page sizes plus the current one', async () => {
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={15}
        pageSizeOptions={[20, 20, 0, 12.7, Number.NaN]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['12', '15', '20']);
    expect(screen.getByRole('option', { name: '15' })).toHaveClass(stylex.props(styles.pageSizeOption).className ?? '');
  });

  it('renders an empty range as a single disabled page', () => {
    render(
      <Pagination
        page={1}
        totalItems={0}
        pageSize={10}
      />,
    );
    expect(screen.getByText('0–0 of 0')).toBeInTheDocument();
    expect(screen.getByText('1/1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('merges xstyle atoms after the slot atoms', () => {
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
        xstyle={atoms.spaced}
      />,
    );
    expect(screen.getByRole('navigation')).toHaveClass('cl-pagination', stylex.props(atoms.spaced).className ?? '');
  });
});
