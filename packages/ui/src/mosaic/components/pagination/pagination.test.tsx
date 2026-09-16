import * as stylex from '@stylexjs/stylex';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { getPageItems } from './page-items';
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

describe('getPageItems', () => {
  it('shows every page when they all fit', () => {
    expect(getPageItems(1, 2, 1)).toEqual([1, 2]);
    expect(getPageItems(2, 3, 1)).toEqual([1, 2, 3]);
    expect(getPageItems(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageItems(1, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps the sequence the same length as the page moves', () => {
    expect(getPageItems(1, 10, 1)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10]);
    expect(getPageItems(10, 10, 1)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10]);
  });

  it('keeps the current page, its siblings, and both ends', () => {
    expect(getPageItems(5, 10, 1)).toEqual([1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10]);
    expect(getPageItems(5, 10, 2)).toEqual([1, 2, 3, 4, 5, 6, 7, 'end-ellipsis', 10]);
  });

  it('shows the page instead of an ellipsis that would hide only one', () => {
    expect(getPageItems(4, 10, 1)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10]);
    expect(getPageItems(7, 10, 1)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10]);
  });

  it('renders a single page', () => {
    expect(getPageItems(1, 1, 1)).toEqual([1]);
  });
});

describe('Mosaic Pagination', () => {
  it('renders a labelled nav with the styling contract', () => {
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toHaveClass('cl-pagination');
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

  it('derives the page count from totalItems and pageSize', () => {
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
      />,
    );
    const pages = controls()
      .getAllByRole('button')
      .map(button => button.textContent)
      .filter(Boolean);
    expect(pages).toEqual(['1', '2', '3', '4', '5', '10']);
  });

  it('marks the current page', () => {
    render(
      <Pagination
        page={3}
        totalItems={100}
        pageSize={10}
      />,
    );
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '2' })).not.toHaveAttribute('aria-current');
  });

  it('calls onChange with the clicked page', async () => {
    const onChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('moves by step from the previous and next buttons', async () => {
    const onChange = vi.fn();
    render(
      <Pagination
        page={5}
        totalItems={100}
        pageSize={10}
        step={2}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenLastCalledWith(7);
  });

  it('clamps a step that would overshoot the ends', async () => {
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
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
      />,
    );
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
  });

  it('renders first and last buttons only when asked', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Pagination
        page={5}
        totalItems={100}
        pageSize={10}
        onChange={onChange}
      />,
    );
    expect(screen.queryByRole('button', { name: 'First page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Last page' })).not.toBeInTheDocument();

    rerender(
      <Pagination
        page={5}
        totalItems={100}
        pageSize={10}
        onChange={onChange}
        hasFirstLast
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'First page' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole('button', { name: 'Last page' }));
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('disables every control when disabled', () => {
    render(
      <Pagination
        page={5}
        totalItems={100}
        pageSize={10}
        hasFirstLast
        disabled
      />,
    );
    expect(screen.getByRole('navigation')).toHaveAttribute('data-disabled', '');
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('shows the page size in the results-per-page select', () => {
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={25}
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Results per page 25' })).toBeInTheDocument();
  });

  it('calls onPageSizeChange with the chosen page size', async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '50' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('sizes the page size options to match the trigger', async () => {
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={10}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: '10' })).toHaveClass(stylex.props(styles.pageSizeOption).className ?? '');
  });

  it('offers the given page sizes plus the current one', async () => {
    render(
      <Pagination
        page={1}
        totalItems={100}
        pageSize={15}
        pageSizeOptions={[10, 20]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['10', '15', '20']);
  });

  it('treats a page size below one as one', async () => {
    const onChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalItems={5}
        pageSize={0}
        onChange={onChange}
      />,
    );
    const pages = controls()
      .getAllByRole('button')
      .map(button => button.textContent)
      .filter(Boolean);
    expect(pages).toEqual(['1', '2', '3', '4', '5']);
    await userEvent.click(controls().getByRole('button', { name: '5' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('treats a step below one as one', async () => {
    const onChange = vi.fn();
    render(
      <Pagination
        page={2}
        totalItems={100}
        pageSize={10}
        step={0}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('treats a negative sibling count as zero', () => {
    render(
      <Pagination
        page={5}
        totalItems={100}
        pageSize={10}
        siblingCount={-2}
      />,
    );
    expect(controls().getByRole('button', { name: '5' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders one page when there are no items', () => {
    render(
      <Pagination
        page={1}
        totalItems={0}
        pageSize={10}
      />,
    );
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
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
