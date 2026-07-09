import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';

import { InlineAction } from '../InlineAction';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('InlineAction', () => {
  it('renders plain text when actionText is not found', async () => {
    const { wrapper } = await createFixtures();

    const screen = render(
      <InlineAction
        text='No match here'
        actionText='missing'
        onClick={() => {}}
        tooltipText='tooltip'
      />,
      { wrapper },
    );

    expect(screen.getByText('No match here')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders text before and after the interactive span', async () => {
    const { wrapper } = await createFixtures();

    const screen = render(
      <InlineAction
        text='Trust this example.com please.'
        actionText='example.com'
        onClick={() => {}}
        tooltipText='View full URL'
      />,
      { wrapper },
    );

    expect(screen.getByRole('button', { name: 'View full URL' })).toHaveTextContent('example.com');
    expect(screen.getByText(/Trust this/)).toBeInTheDocument();
    expect(screen.getByText(/please\./)).toBeInTheDocument();
  });

  it('wraps adjacent parentheses with the action span to prevent line-break separation', async () => {
    const { wrapper } = await createFixtures();

    const screen = render(
      <InlineAction
        text='Trust this (example.com). Be careful.'
        actionText='example.com'
        onClick={() => {}}
        tooltipText='View full URL'
      />,
      { wrapper },
    );

    expect(screen.getByRole('button', { name: 'View full URL' })).toHaveTextContent('example.com');
    expect(screen.getByText(/Trust this/)).toBeInTheDocument();
    expect(screen.getByText(/\. Be careful\./)).toBeInTheDocument();
  });

  it('fires onClick on click', async () => {
    const { wrapper } = await createFixtures();
    const handleClick = vi.fn();

    const screen = render(
      <InlineAction
        text='Click on example.com here'
        actionText='example.com'
        onClick={handleClick}
        tooltipText='View full URL'
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByRole('button', { name: 'View full URL' }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('fires onClick on Enter keypress', async () => {
    const { wrapper } = await createFixtures();
    const handleClick = vi.fn();

    const screen = render(
      <InlineAction
        text='Click on example.com here'
        actionText='example.com'
        onClick={handleClick}
        tooltipText='View full URL'
      />,
      { wrapper },
    );

    fireEvent.keyDown(screen.getByRole('button', { name: 'View full URL' }), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('fires onClick on Space keypress', async () => {
    const { wrapper } = await createFixtures();
    const handleClick = vi.fn();

    const screen = render(
      <InlineAction
        text='Click on example.com here'
        actionText='example.com'
        onClick={handleClick}
        tooltipText='View full URL'
      />,
      { wrapper },
    );

    fireEvent.keyDown(screen.getByRole('button', { name: 'View full URL' }), { key: ' ' });
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
