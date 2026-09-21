import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../test-utils/axe';
import { TagInput } from './index';

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(Element.prototype, 'getAnimations');
});

function Tags() {
  const { tags } = TagInput.useTagInput();
  return (
    <>
      {tags.map(tag => (
        <TagInput.Tag
          key={tag.value}
          value={tag.value}
        >
          {tag.value}
          <TagInput.TagRemove />
        </TagInput.Tag>
      ))}
    </>
  );
}

function Harness(props: Partial<React.ComponentProps<typeof TagInput.Root>> = {}) {
  return (
    <TagInput.Root
      data-testid='root'
      {...props}
    >
      <TagInput.List aria-label='Emails'>
        <Tags />
      </TagInput.List>
      <TagInput.Input aria-label='Email' />
    </TagInput.Root>
  );
}

function input() {
  return screen.getByRole('textbox', { name: 'Email' });
}

function tag(value: string) {
  return screen.getByText(value, { selector: '[role="listitem"]' });
}

function tagValues() {
  return screen.queryAllByRole('listitem').map(el => el.getAttribute('data-value'));
}

function holdExitAnimations() {
  const finish: Array<() => void> = [];
  Object.defineProperty(Element.prototype, 'getAnimations', {
    configurable: true,
    value(this: Element) {
      if (!this.hasAttribute('data-ending-style')) {
        return [];
      }
      return [
        {
          finished: new Promise<void>(resolve => {
            finish.push(resolve);
          }),
        },
      ];
    },
  });
  return async () => {
    await act(async () => {
      finish.splice(0).forEach(resolve => resolve());
      await Promise.resolve();
    });
  };
}

describe('TagInput', () => {
  describe('adding', () => {
    it('adds the typed text as a tag on Enter and clears the input', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Harness onValueChange={onValueChange} />);

      await user.type(input(), 'a@clerk.dev{Enter}');

      expect(tagValues()).toEqual(['a@clerk.dev']);
      expect(input()).toHaveValue('');
      expect(onValueChange).toHaveBeenLastCalledWith(['a@clerk.dev']);
    });

    it('adds on a delimiter key', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(input(), 'a@clerk.dev,b@clerk.dev,');

      expect(tagValues()).toEqual(['a@clerk.dev', 'b@clerk.dev']);
      expect(input()).toHaveValue('');
    });

    it('splits pasted text on delimiters and newlines', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.click(input());
      await user.paste('a@clerk.dev, b@clerk.dev\nc@clerk.dev');

      expect(tagValues()).toEqual(['a@clerk.dev', 'b@clerk.dev', 'c@clerk.dev']);
    });

    it('commits pending text on blur', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(input(), 'a@clerk.dev');
      await user.tab();

      expect(tagValues()).toEqual(['a@clerk.dev']);
    });

    it('ignores empty text and duplicates', async () => {
      const user = userEvent.setup();
      render(<Harness defaultValue={['a@clerk.dev']} />);

      await user.type(input(), '   {Enter}a@clerk.dev{Enter}');

      expect(tagValues()).toEqual(['a@clerk.dev']);
    });

    it('marks tags that fail validation as invalid', async () => {
      const user = userEvent.setup();
      render(<Harness validate={value => value.includes('@')} />);

      await user.type(input(), 'nope{Enter}a@clerk.dev{Enter}');

      expect(tag('nope')).toHaveAttribute('data-invalid', '');
      expect(tag('a@clerk.dev')).not.toHaveAttribute('data-invalid');
    });
  });

  describe('removing', () => {
    it('removes a tag with its remove button and returns focus to the input', async () => {
      const user = userEvent.setup();
      render(<Harness defaultValue={['a@clerk.dev', 'b@clerk.dev']} />);

      await user.click(screen.getByRole('button', { name: 'Remove a@clerk.dev' }));

      expect(tagValues()).toEqual(['b@clerk.dev']);
      expect(input()).toHaveFocus();
    });

    it('keeps a removed tag rendered until its exit animation finishes', async () => {
      const finishExits = holdExitAnimations();
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Harness
          defaultValue={['a@clerk.dev', 'b@clerk.dev']}
          onValueChange={onValueChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Remove a@clerk.dev' }));

      expect(onValueChange).toHaveBeenLastCalledWith(['b@clerk.dev']);
      expect(tagValues()).toEqual(['b@clerk.dev']);
      const exiting = document.querySelector('[data-value="a@clerk.dev"]');
      expect(exiting).toHaveAttribute('data-ending-style', '');
      expect(exiting).toHaveAttribute('inert');

      await finishExits();

      expect(document.querySelector('[data-value="a@clerk.dev"]')).toBeNull();
    });

    it('restores a tag re-added mid-exit', async () => {
      const finishExits = holdExitAnimations();
      const user = userEvent.setup();
      render(<Harness defaultValue={['a@clerk.dev']} />);

      await user.click(screen.getByRole('button', { name: 'Remove a@clerk.dev' }));
      await user.type(input(), 'a@clerk.dev{Enter}');
      await finishExits();

      expect(tagValues()).toEqual(['a@clerk.dev']);
    });

    it('keeps an exiting tag in its original position', async () => {
      holdExitAnimations();
      const user = userEvent.setup();
      render(<Harness defaultValue={['a', 'b', 'c']} />);

      await user.click(screen.getByRole('button', { name: 'Remove b' }));
      await user.type(input(), 'd{Enter}');

      const rendered = Array.from(document.querySelectorAll('[data-value]')).map(el => el.getAttribute('data-value'));
      expect(rendered).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('keyboard', () => {
    it('moves focus to the last tag on Backspace in an empty input, then removes it', async () => {
      const user = userEvent.setup();
      render(<Harness defaultValue={['a', 'b']} />);

      await user.click(input());
      await user.keyboard('{Backspace}');

      expect(tag('b')).toHaveFocus();
      expect(tagValues()).toEqual(['a', 'b']);

      await user.keyboard('{Backspace}');

      expect(tagValues()).toEqual(['a']);
      expect(tag('a')).toHaveFocus();
    });

    it('does not leave the input on Backspace when the caret is not at the start', async () => {
      const user = userEvent.setup();
      render(<Harness defaultValue={['a']} />);

      await user.type(input(), 'xy{Backspace}');

      expect(input()).toHaveFocus();
      expect(input()).toHaveValue('x');
    });

    it('moves between tags and back to the input with arrow keys', async () => {
      const user = userEvent.setup();
      render(<Harness defaultValue={['a', 'b']} />);

      await user.click(input());
      await user.keyboard('{ArrowLeft}');
      expect(tag('b')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(tag('a')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(tag('a')).toHaveFocus();

      await user.keyboard('{ArrowRight}{ArrowRight}');
      expect(input()).toHaveFocus();
    });

    it('follows reading order in RTL', async () => {
      const user = userEvent.setup();
      render(
        <div dir='rtl'>
          <Harness defaultValue={['a', 'b']} />
        </div>,
      );

      await user.click(input());
      await user.keyboard('{ArrowRight}');
      expect(tag('b')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(input()).toHaveFocus();
    });

    it('jumps to the first and last tag with Home and End', async () => {
      const user = userEvent.setup();
      render(<Harness defaultValue={['a', 'b', 'c']} />);

      await user.click(input());
      await user.keyboard('{ArrowLeft}{Home}');
      expect(tag('a')).toHaveFocus();

      await user.keyboard('{End}');
      expect(tag('c')).toHaveFocus();
    });

    it('removes a focused tag with Delete and focuses the next one', async () => {
      const user = userEvent.setup();
      render(<Harness defaultValue={['a', 'b', 'c']} />);

      await user.click(input());
      await user.keyboard('{ArrowLeft}{Home}{Delete}');

      expect(tagValues()).toEqual(['b', 'c']);
      expect(tag('b')).toHaveFocus();

      await user.keyboard('{End}{Delete}');

      expect(tagValues()).toEqual(['b']);
      expect(input()).toHaveFocus();
    });

    it('skips exiting tags when moving focus', async () => {
      holdExitAnimations();
      const user = userEvent.setup();
      render(<Harness defaultValue={['a', 'b', 'c']} />);

      await user.click(input());
      await user.keyboard('{ArrowLeft}{ArrowLeft}{Backspace}');
      expect(tag('a')).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(tag('c')).toHaveFocus();
    });

    it('keeps tags out of the tab order so the field is one tab stop', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button type='button'>before</button>
          <Harness defaultValue={['a', 'b']} />
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'before' }));
      await user.tab();

      expect(input()).toHaveFocus();
    });
  });

  describe('root', () => {
    it('focuses the input when the empty area of the root is pressed', async () => {
      const user = userEvent.setup();
      render(<Harness defaultValue={['a']} />);

      await user.click(screen.getByTestId('root'));

      expect(input()).toHaveFocus();
    });

    it('supports a controlled value', async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [value, setValue] = useState(['a']);
        return (
          <>
            <Harness
              value={value}
              onValueChange={setValue}
            />
            <output>{value.join('|')}</output>
          </>
        );
      }
      render(<Controlled />);

      await user.type(input(), 'b{Enter}');

      expect(screen.getByRole('status')).toHaveTextContent('a|b');
    });

    it('submits one hidden input per tag under name', () => {
      render(
        <form data-testid='form'>
          <Harness
            name='emails'
            defaultValue={['a', 'b']}
          />
        </form>,
      );

      const form = screen.getByTestId('form');
      if (!(form instanceof HTMLFormElement)) {
        throw new Error('expected a form');
      }
      expect(new FormData(form).getAll('emails')).toEqual(['a', 'b']);
    });

    it('blocks editing when disabled', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          disabled
          defaultValue={['a']}
        />,
      );

      expect(input()).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Remove a' })).toBeDisabled();
      expect(screen.getByTestId('root')).toHaveAttribute('data-disabled', '');
      await user.click(screen.getByRole('button', { name: 'Remove a' }));
      expect(tagValues()).toEqual(['a']);
    });

    it('has no axe violations', async () => {
      const { container } = render(<Harness defaultValue={['a', 'b']} />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
