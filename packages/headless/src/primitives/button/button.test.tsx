import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import { Button } from './index';

afterEach(() => cleanup());

describe('Button', () => {
  describe('native button', () => {
    it('renders a button with an explicit type', () => {
      render(<Button>Save</Button>);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('lets the consumer override the type', () => {
      render(<Button type='submit'>Save</Button>);

      expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
    });

    it('calls onClick when enabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Save</Button>);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('forwards its ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Save</Button>);

      expect(ref.current).toBe(screen.getByRole('button', { name: 'Save' }));
    });
  });

  describe('disabled', () => {
    it('sets the native disabled attribute', () => {
      render(<Button disabled>Save</Button>);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toBeDisabled();
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).toHaveAttribute('data-disabled');
    });

    it('is not reachable by keyboard', async () => {
      const user = userEvent.setup();
      render(<Button disabled>Save</Button>);

      await user.tab();

      expect(screen.getByRole('button', { name: 'Save' })).not.toHaveFocus();
    });
  });

  describe('focusableWhenDisabled', () => {
    it('marks the button aria-disabled instead of disabled', () => {
      render(
        <Button
          disabled
          focusableWhenDisabled
        >
          Save
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('data-disabled');
    });

    it('stays reachable by keyboard', async () => {
      const user = userEvent.setup();
      render(
        <Button
          disabled
          focusableWhenDisabled
        >
          Save
        </Button>,
      );

      await user.tab();

      expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    });

    it('keeps focus when it becomes disabled', () => {
      const { rerender } = render(<Button focusableWhenDisabled>Save</Button>);
      const button = screen.getByRole('button', { name: 'Save' });
      button.focus();

      rerender(
        <Button
          disabled
          focusableWhenDisabled
        >
          Save
        </Button>,
      );

      expect(button).toHaveFocus();
    });

    it('does not call onClick on click', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button
          disabled
          focusableWhenDisabled
          onClick={onClick}
        >
          Save
        </Button>,
      );

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not call onClick on Enter or Space', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button
          disabled
          focusableWhenDisabled
          onClick={onClick}
        >
          Save
        </Button>,
      );

      screen.getByRole('button', { name: 'Save' }).focus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not submit the surrounding form', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <Button
            type='submit'
            disabled
            focusableWhenDisabled
          >
            Save
          </Button>
        </form>,
      );

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('does not take focus on pointer interaction', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <input aria-label='Name' />
          <Button
            disabled
            focusableWhenDisabled
          >
            Save
          </Button>
        </div>,
      );

      const input = screen.getByRole('textbox', { name: 'Name' });
      input.focus();
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(input).toHaveFocus();
    });
  });

  describe('non-native button', () => {
    it('applies button semantics to the rendered element', () => {
      render(
        <Button
          nativeButton={false}
          render={<span />}
        >
          Save
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button.tagName).toBe('SPAN');
      expect(button).toHaveAttribute('tabindex', '0');
      expect(button).not.toHaveAttribute('type');
    });

    it('activates on Enter and Space', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button
          nativeButton={false}
          render={<span />}
          onClick={onClick}
        >
          Save
        </Button>,
      );

      screen.getByRole('button', { name: 'Save' }).focus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('activates a link once on Enter', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
      render(
        <Button
          nativeButton={false}
          // eslint-disable-next-line jsx-a11y/anchor-has-content -- the render element is a template; Button supplies the children
          render={<a href='#target' />}
          onClick={onClick}
        >
          Save
        </Button>,
      );

      screen.getByRole('button', { name: 'Save' }).focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('drops out of the tab order when disabled', () => {
      render(
        <Button
          nativeButton={false}
          render={<span />}
          disabled
        >
          Save
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).not.toHaveAttribute('tabindex');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('stays in the tab order when disabled and focusable', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button
          nativeButton={false}
          render={<span />}
          disabled
          focusableWhenDisabled
          onClick={onClick}
        >
          Save
        </Button>,
      );

      await user.tab();
      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations when disabled and focusable', async () => {
      const { container } = render(
        <Button
          disabled
          focusableWhenDisabled
        >
          Save
        </Button>,
      );

      const results = await axe(container);
      expect(results.violations).toEqual([]);
    });
  });
});
