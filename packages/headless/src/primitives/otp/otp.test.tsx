import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import { Otp } from './index';

afterEach(() => cleanup());

/** A default composition driving the slots off the live slot list. */
function Harness(props: Partial<React.ComponentProps<typeof Otp.Root>> & { length?: number } = {}) {
  const { length = 4, children, ...rootProps } = props;
  return (
    <Otp.Root
      length={length}
      data-testid='otp-root'
      {...rootProps}
    >
      <Slots />
    </Otp.Root>
  );
}

function Slots() {
  const { slots } = Otp.useOtp();
  return (
    <>
      {slots.map(slot => (
        <Otp.Input
          key={slot.index}
          index={slot.index}
          data-testid='otp-input'
        />
      ))}
    </>
  );
}

function inputs() {
  return Array.from(document.querySelectorAll<HTMLInputElement>('[data-testid="otp-input"]'));
}

describe('Otp', () => {
  describe('slot attributes', () => {
    it('renders the root and one input per slot', () => {
      render(<Harness length={4} />);
      expect(document.querySelector('[data-testid="otp-root"]')).toBeInTheDocument();
      expect(inputs()).toHaveLength(4);
    });

    it('marks the root empty until a character is entered, then complete when full', async () => {
      const user = userEvent.setup();
      render(<Harness length={2} />);
      const root = document.querySelector('[data-testid="otp-root"]');
      expect(root).toHaveAttribute('data-empty', '');

      await user.type(inputs()[0], '1');
      expect(root).not.toHaveAttribute('data-empty');
      expect(root).not.toHaveAttribute('data-complete');

      await user.type(inputs()[1], '2');
      expect(root).toHaveAttribute('data-complete', '');
    });

    it('marks a filled input and the active input', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={3}
          defaultValue='1'
        />,
      );
      expect(inputs()[0]).toHaveAttribute('data-filled', '');
      expect(inputs()[1]).not.toHaveAttribute('data-filled');

      await user.click(inputs()[1]);
      expect(inputs()[1]).toHaveAttribute('data-active', '');
    });
  });

  describe('typing', () => {
    it('fills slots left to right and advances focus', async () => {
      const user = userEvent.setup();
      render(<Harness length={4} />);

      await user.click(inputs()[0]);
      await user.keyboard('12');

      expect(inputs()[0]).toHaveValue('1');
      expect(inputs()[1]).toHaveValue('2');
      expect(inputs()[2]).toHaveFocus();
    });

    it('reports each change through onValueChange', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Harness
          length={4}
          onValueChange={onValueChange}
        />,
      );

      await user.click(inputs()[0]);
      await user.keyboard('12');

      expect(onValueChange).toHaveBeenLastCalledWith('12');
    });

    it('rejects characters outside the pattern', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Harness
          length={4}
          pattern='numeric'
          onValueChange={onValueChange}
        />,
      );

      await user.click(inputs()[0]);
      await user.keyboard('a');

      expect(inputs()[0]).toHaveValue('');
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('deletes the current character on Backspace and moves back when empty', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={4}
          defaultValue='12'
        />,
      );

      await user.click(inputs()[2]);
      await user.keyboard('{Backspace}'); // slot 2 empty -> removes slot 1, focus slot 1
      expect(inputs()[1]).toHaveValue('');
      expect(inputs()[0]).toHaveValue('1');
      expect(inputs()[1]).toHaveFocus();

      await user.keyboard('{Backspace}'); // slot 1 empty -> removes slot 0, focus slot 0
      expect(inputs()[0]).toHaveValue('');
      expect(inputs()[0]).toHaveFocus();
    });

    it('moves focus with arrow keys', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={4}
          defaultValue='1234'
        />,
      );

      await user.click(inputs()[0]);
      await user.keyboard('{ArrowRight}');
      expect(inputs()[1]).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(inputs()[0]).toHaveFocus();

      await user.keyboard('{End}');
      expect(inputs()[3]).toHaveFocus();

      await user.keyboard('{Home}');
      expect(inputs()[0]).toHaveFocus();
    });

    it('does not let focus skip past the first empty slot', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={4}
          defaultValue='12'
        />,
      );

      // Clicking an empty slot beyond the first empty one snaps to slot 2.
      await user.click(inputs()[3]);
      expect(inputs()[2]).toHaveFocus();

      // Arrowing right from the first empty slot stays put.
      await user.keyboard('{ArrowRight}');
      expect(inputs()[2]).toHaveFocus();
    });

    it('treats ArrowUp/ArrowDown as first / last-entered slot', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={4}
          defaultValue='12'
        />,
      );

      await user.click(inputs()[0]);
      await user.keyboard('{ArrowDown}'); // last-entered = first empty slot (index 2)
      expect(inputs()[2]).toHaveFocus();

      await user.keyboard('{ArrowUp}'); // first slot
      expect(inputs()[0]).toHaveFocus();
    });

    it('jumps to the boundaries with Ctrl/Cmd + arrow keys', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={4}
          defaultValue='123'
        />,
      );

      await user.click(inputs()[0]);
      await user.keyboard('{Control>}{ArrowRight}{/Control}'); // last-entered (index 3)
      expect(inputs()[3]).toHaveFocus();

      await user.keyboard('{Control>}{ArrowLeft}{/Control}'); // first
      expect(inputs()[0]).toHaveFocus();
    });

    it('clears the whole value with Ctrl/Cmd + Backspace', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={4}
          defaultValue='1234'
        />,
      );

      await user.click(inputs()[2]);
      await user.keyboard('{Control>}{Backspace}{/Control}');

      expect(inputs().map(i => i.value)).toEqual(['', '', '', '']);
      expect(inputs()[0]).toHaveFocus();
    });

    it('swaps ArrowLeft/ArrowRight under dir="rtl"', async () => {
      const user = userEvent.setup();
      render(
        <div dir='rtl'>
          <Harness
            length={4}
            defaultValue='1234'
          />
        </div>,
      );

      await user.click(inputs()[1]);
      await user.keyboard('{ArrowLeft}'); // rtl: next slot
      expect(inputs()[2]).toHaveFocus();

      await user.keyboard('{ArrowRight}'); // rtl: previous slot
      expect(inputs()[1]).toHaveFocus();
    });

    it('swaps Ctrl/Cmd + arrows under dir="rtl"', async () => {
      const user = userEvent.setup();
      render(
        <div dir='rtl'>
          <Harness
            length={4}
            defaultValue='123'
          />
        </div>,
      );

      await user.click(inputs()[1]);
      await user.keyboard('{Control>}{ArrowLeft}{/Control}'); // rtl: last-entered (index 3)
      expect(inputs()[3]).toHaveFocus();

      await user.keyboard('{Control>}{ArrowRight}{/Control}'); // rtl: first
      expect(inputs()[0]).toHaveFocus();
    });
  });

  describe('clicking', () => {
    it('focuses the first input when the field is empty', async () => {
      const user = userEvent.setup();
      render(<Harness length={4} />);

      await user.click(inputs()[2]);
      expect(inputs()[0]).toHaveFocus();
    });

    it('focuses the clicked slot when the field is filled', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={4}
          defaultValue='1234'
        />,
      );

      await user.click(inputs()[2]);
      expect(inputs()[2]).toHaveFocus();
    });
  });

  describe('re-typing the same character', () => {
    it('advances focus even though the value is unchanged', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={4}
          defaultValue='12'
        />,
      );

      await user.click(inputs()[0]); // selects the "1"
      await user.keyboard('1'); // same character
      expect(inputs()[1]).toHaveFocus();
    });
  });

  describe('paste', () => {
    it('distributes a pasted code across the slots', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(
        <Harness
          length={4}
          onComplete={onComplete}
        />,
      );

      await user.click(inputs()[0]);
      await user.paste('1234');

      expect(inputs().map(i => i.value)).toEqual(['1', '2', '3', '4']);
      expect(onComplete).toHaveBeenCalledWith('1234');
    });

    it('strips disallowed characters from a paste', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          length={4}
          pattern='numeric'
        />,
      );

      await user.click(inputs()[0]);
      await user.paste('1-2-3-4');

      expect(inputs().map(i => i.value)).toEqual(['1', '2', '3', '4']);
    });
  });

  describe('onComplete', () => {
    it('fires once when the final character is typed', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(
        <Harness
          length={2}
          onComplete={onComplete}
        />,
      );

      await user.click(inputs()[0]);
      await user.keyboard('1');
      expect(onComplete).not.toHaveBeenCalled();

      await user.keyboard('2');
      expect(onComplete).toHaveBeenCalledExactlyOnceWith('12');
    });
  });

  describe('controlled', () => {
    it('reflects an externally controlled value', async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [value, setValue] = useState('');
        return (
          <Otp.Root
            length={4}
            value={value}
            onValueChange={setValue}
          >
            <Slots />
          </Otp.Root>
        );
      }
      render(<Controlled />);

      await user.click(inputs()[0]);
      await user.keyboard('99');
      expect(inputs()[0]).toHaveValue('9');
      expect(inputs()[1]).toHaveValue('9');
    });
  });

  describe('disabled', () => {
    it('disables every input and ignores typing', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Harness
          length={4}
          disabled
          onValueChange={onValueChange}
        />,
      );

      for (const input of inputs()) {
        expect(input).toBeDisabled();
      }
      expect(document.querySelector('[data-testid="otp-root"]')).toHaveAttribute('data-disabled', '');

      await user.type(inputs()[0], '1');
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('form integration', () => {
    it('submits the value through a hidden named input', () => {
      render(
        <Harness
          length={4}
          name='code'
          defaultValue='1234'
        />,
      );
      const hidden = document.querySelector<HTMLInputElement>('input[aria-hidden="true"]');
      expect(hidden).toHaveAttribute('name', 'code');
      expect(hidden).toHaveValue('1234');
    });

    it('omits the hidden input when no name is given', () => {
      render(<Harness length={4} />);
      expect(document.querySelector('input[aria-hidden="true"]')).not.toBeInTheDocument();
    });
  });

  describe('useOtp', () => {
    it('exposes slots and a clear action', async () => {
      const user = userEvent.setup();
      function WithClear() {
        const { clear, complete } = Otp.useOtp();
        return (
          <>
            <Slots />
            <button
              type='button'
              onClick={clear}
            >
              Clear
            </button>
            {complete ? <span>done</span> : null}
          </>
        );
      }
      render(
        <Otp.Root
          length={2}
          defaultValue='12'
        >
          <WithClear />
        </Otp.Root>,
      );
      expect(screen.getByText('done')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Clear' }));
      expect(inputs().map(i => i.value)).toEqual(['', '']);
      expect(screen.queryByText('done')).not.toBeInTheDocument();
    });

    it('throws when used outside <Otp.Root>', () => {
      function Orphan() {
        Otp.useOtp();
        return null;
      }
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Orphan />)).toThrow(/within <Otp.Root>/);
      spy.mockRestore();
    });
  });

  describe('render prop', () => {
    it('lets a slot render a custom element', () => {
      render(
        <Otp.Root length={1}>
          <Otp.Input
            index={0}
            render={props => (
              <input
                {...props}
                data-testid='custom'
              />
            )}
          />
        </Otp.Root>,
      );
      const custom = screen.getByTestId('custom');
      expect(custom).toBeInTheDocument();
    });
  });

  describe('ref forwarding', () => {
    it('populates a consumer ref with the underlying input element', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(
        <Otp.Root length={1}>
          <Otp.Input
            index={0}
            ref={ref}
            data-testid='otp-input'
          />
        </Otp.Root>,
      );
      expect(ref.current).toBe(inputs()[0]);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Otp.Root
          length={4}
          aria-label='One-time code'
        >
          <Slots />
        </Otp.Root>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
