import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Dialog } from '../primitives/dialog/dialog';
import { Popover } from '../primitives/popover/popover';
import { Select } from '../primitives/select/select';
import { Tooltip } from '../primitives/tooltip/tooltip';

afterEach(() => {
  cleanup();
});

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('FloatingTree integration', () => {
  describe('Select inside Popover', () => {
    function SelectInPopover() {
      return (
        <Popover>
          <Popover.Trigger>Open Popover</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Title>Pick a fruit</Popover.Title>
              <Select>
                <Select.Trigger>
                  <Select.Value placeholder='Choose...' />
                </Select.Trigger>
                <Select.Positioner>
                  <Select.Popup>
                    {fruits.map(f => (
                      <Select.Option
                        key={f.value}
                        value={f.value}
                        label={f.label}
                      >
                        {f.label}
                      </Select.Option>
                    ))}
                  </Select.Popup>
                </Select.Positioner>
              </Select>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover>
      );
    }

    it('popover stays open when select dropdown opens', async () => {
      const user = userEvent.setup();
      render(<SelectInPopover />);

      await user.click(screen.getByText('Open Popover'));
      expect(screen.getByText('Pick a fruit')).toBeInTheDocument();

      await user.click(screen.getByText('Choose...'));

      // Popover should still be open
      expect(screen.getByText('Pick a fruit')).toBeInTheDocument();
      // Select dropdown should be visible
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    it('popover stays open when clicking select option', async () => {
      const user = userEvent.setup();
      render(<SelectInPopover />);

      await user.click(screen.getByText('Open Popover'));
      await user.click(screen.getByText('Choose...'));
      await user.click(screen.getByText('Banana'));

      // Popover should still be open after selecting
      expect(screen.getByText('Pick a fruit')).toBeInTheDocument();
    });
  });

  describe('Select inside Dialog', () => {
    function SelectInDialog() {
      return (
        <Dialog>
          <Dialog.Trigger>Open Dialog</Dialog.Trigger>
          <Dialog.Backdrop>
            <Dialog.Popup>
              <Dialog.Title>Select a fruit</Dialog.Title>
              <Select>
                <Select.Trigger>
                  <Select.Value placeholder='Choose...' />
                </Select.Trigger>
                <Select.Positioner>
                  <Select.Popup>
                    {fruits.map(f => (
                      <Select.Option
                        key={f.value}
                        value={f.value}
                        label={f.label}
                      >
                        {f.label}
                      </Select.Option>
                    ))}
                  </Select.Popup>
                </Select.Positioner>
              </Select>
            </Dialog.Popup>
          </Dialog.Backdrop>
        </Dialog>
      );
    }

    it('dialog stays open when select dropdown opens', async () => {
      const user = userEvent.setup();
      render(<SelectInDialog />);

      await user.click(screen.getByText('Open Dialog'));
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();

      await user.click(screen.getByText('Choose...'));

      // Dialog should still be open
      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
      // Select options visible
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });
  });

  describe('Popover inside Popover', () => {
    function NestedPopover() {
      return (
        <Popover>
          <Popover.Trigger>Outer</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Title>Outer Content</Popover.Title>
              <Popover>
                <Popover.Trigger>Inner</Popover.Trigger>
                <Popover.Positioner>
                  <Popover.Popup>
                    <Popover.Title>Inner Content</Popover.Title>
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover>
      );
    }

    it('outer popover stays open when inner popover opens', async () => {
      const user = userEvent.setup();
      render(<NestedPopover />);

      await user.click(screen.getByText('Outer'));
      expect(screen.getByText('Outer Content')).toBeInTheDocument();

      await user.click(screen.getByText('Inner'));

      // Both should be visible
      expect(screen.getByText('Outer Content')).toBeInTheDocument();
      expect(screen.getByText('Inner Content')).toBeInTheDocument();
    });
  });

  describe('Tooltip inside Popover', () => {
    function TooltipInPopover() {
      return (
        <Popover>
          <Popover.Trigger>Open Popover</Popover.Trigger>
          <Popover.Positioner>
            <Popover.Popup>
              <Popover.Title>Content</Popover.Title>
              <Tooltip>
                <Tooltip.Trigger>Hover me</Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Popup>Tooltip text</Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover>
      );
    }

    it('popover stays open when tooltip trigger is hovered', async () => {
      const user = userEvent.setup();
      render(<TooltipInPopover />);

      await user.click(screen.getByText('Open Popover'));
      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.hover(screen.getByText('Hover me'));

      // Popover should remain open
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Popover inside Dialog', () => {
    function PopoverInDialog() {
      return (
        <Dialog>
          <Dialog.Trigger>Open Dialog</Dialog.Trigger>
          <Dialog.Backdrop>
            <Dialog.Popup>
              <Dialog.Title>Dialog Content</Dialog.Title>
              <Popover>
                <Popover.Trigger>Open Popover</Popover.Trigger>
                <Popover.Positioner>
                  <Popover.Popup>
                    <Popover.Title>Popover Content</Popover.Title>
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover>
            </Dialog.Popup>
          </Dialog.Backdrop>
        </Dialog>
      );
    }

    it('dialog stays open when popover opens inside it', async () => {
      const user = userEvent.setup();
      render(<PopoverInDialog />);

      await user.click(screen.getByText('Open Dialog'));
      expect(screen.getByText('Dialog Content')).toBeInTheDocument();

      await user.click(screen.getByText('Open Popover'));

      // Both should be visible
      expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });
  });
});
