import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PrintableComponent, usePrintable } from '../PrintableComponent';

const Harness = ({ text = 'backup_code', show = true }: { text?: string; show?: boolean }) => {
  const { print, printableProps } = usePrintable();
  return (
    <>
      <button
        type='button'
        onClick={print}
      >
        Print
      </button>
      {show && <PrintableComponent {...printableProps}>{text}</PrintableComponent>}
    </>
  );
};
const startPrint = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Print' }));
  const frame = document.querySelector('iframe')!;
  const printWindow = frame.contentWindow!;
  const print = vi.spyOn(printWindow, 'print').mockImplementation(() => {});
  const load = frame.onload!;
  fireEvent.load(frame);
  return { frame, printWindow, print, load };
};

describe('PrintableComponent ownership', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('copies content and styles, then releases the frame after printing', () => {
    const style = document.createElement('style');
    style.dataset.emotion = 'cl-internal';
    style.innerHTML = '.backup { color: black; }';
    document.head.appendChild(style);
    try {
      render(<Harness />);
      const { frame, printWindow, print } = startPrint();
      const printDocument = frame.contentDocument!;
      expect(printDocument.body.textContent).toBe('backup_code');
      expect(frame.contentDocument!.head.textContent).toContain('.backup { color: black; }');
      expect(print).toHaveBeenCalledTimes(1);
      fireEvent(printWindow, new Event('afterprint'));
      expect(frame.isConnected).toBe(true);
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(frame.isConnected).toBe(false);
      expect(printDocument.body.textContent).toBe('');
      expect(frame.onload).toBeNull();
      expect(frame.onerror).toBeNull();
    } finally {
      style.remove();
    }
  });

  it('releases pending print content when the component unmounts', () => {
    const { unmount } = render(<Harness />);
    const { frame, printWindow, load, print } = startPrint();
    unmount();
    expect(frame.isConnected).toBe(false);
    load.call(frame, new Event('load'));
    fireEvent(printWindow, new Event('afterprint'));
    expect(print).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('removes a pending frame before loading when its content changes', () => {
    const { rerender } = render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    const previous = document.querySelector('iframe')!;
    const load = previous.onload!;
    rerender(<Harness text='replacement_code' />);
    expect(previous.isConnected).toBe(false);
    load.call(previous, new Event('load'));
    const { frame } = startPrint();
    expect(frame.contentDocument!.body.textContent).toBe('replacement_code');
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
  });

  it('unregisters the print action when the content is hidden', () => {
    const { rerender } = render(<Harness />);
    const { frame } = startPrint();
    rerender(<Harness show={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    expect(frame.isConnected).toBe(false);
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('replaces the previous print operation and clears its cleanup timer', () => {
    render(<Harness />);
    const previous = startPrint();
    fireEvent(previous.printWindow, new Event('afterprint'));
    expect(vi.getTimerCount()).toBe(1);
    const current = startPrint();
    expect(previous.frame.isConnected).toBe(false);
    expect(current.frame.isConnected).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    fireEvent(previous.printWindow, new Event('afterprint'));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cleans up when print dispatch throws', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    const frame = document.querySelector('iframe')!;
    vi.spyOn(frame.contentWindow!, 'print').mockImplementation(() => {
      throw new Error('Print failed');
    });
    expect(() => frame.onload!.call(frame, new Event('load'))).toThrow('Print failed');
    expect(frame.isConnected).toBe(false);
    expect(frame.onload).toBeNull();
    expect(frame.onerror).toBeNull();
  });

  it('cleans up when the frame fails to load', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    const frame = document.querySelector('iframe')!;
    fireEvent.error(frame);
    expect(frame.isConnected).toBe(false);
    expect(frame.onload).toBeNull();
  });

  it('registers one callback under StrictMode', () => {
    render(
      <React.StrictMode>
        <Harness />
      </React.StrictMode>,
    );
    const { print } = startPrint();
    expect(print).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
  });
});
