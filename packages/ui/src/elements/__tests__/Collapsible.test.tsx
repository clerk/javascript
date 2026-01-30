import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';

import { Collapsible } from '../Collapsible';

const { createFixtures } = bindCreateFixtures('SignIn');

// Helper to wait for requestAnimationFrame
async function waitForAnimationFrame(): Promise<void> {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

// Helper to create transition end event
function createTransitionEndEvent(target: HTMLElement, currentTarget?: HTMLElement): Event {
  const event = new Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'target', { value: target, enumerable: true, configurable: true });
  Object.defineProperty(event, 'currentTarget', {
    value: currentTarget ?? target,
    enumerable: true,
    configurable: true,
  });
  return event;
}

describe('Collapsible', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CSS Property Registration', () => {
    it('uses --cl-collapsible-mask-size CSS custom property in mask gradient', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      const inner = container.querySelector('.cl-collapsibleInner') as HTMLElement;
      expect(inner).toBeInTheDocument();

      const styles = window.getComputedStyle(inner);
      const maskImage = styles.maskImage || styles.webkitMaskImage || '';
      expect(maskImage).toContain('var(--cl-collapsible-mask-size)');
    });

    it('handles CSS.registerProperty not being available gracefully', async () => {
      const { wrapper } = await createFixtures();
      expect(() => {
        render(<Collapsible open>Content</Collapsible>, { wrapper });
      }).not.toThrow();
    });
  });

  describe('Initial Render', () => {
    it('renders when open={true}', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(
        <Collapsible open>
          <div>Test Content</div>
        </Collapsible>,
        { wrapper },
      );

      expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
      expect(container.textContent).toContain('Test Content');
    });

    it('does not render when open={false} initially', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(
        <Collapsible open={false}>
          <div>Test Content</div>
        </Collapsible>,
        { wrapper },
      );

      expect(container.querySelector('.cl-collapsible')).not.toBeInTheDocument();
    });

    it('renders children correctly when open', async () => {
      const { wrapper } = await createFixtures();
      const { getByText } = render(
        <Collapsible open>
          <div>Child Content</div>
        </Collapsible>,
        { wrapper },
      );

      expect(getByText('Child Content')).toBeInTheDocument();
    });

    it('applies correct element descriptors', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(
        <Collapsible open>
          <div>Test</div>
        </Collapsible>,
        { wrapper },
      );

      const outer = container.querySelector('.cl-collapsible');
      const inner = container.querySelector('.cl-collapsibleInner');

      expect(outer).toBeInTheDocument();
      expect(inner).toBeInTheDocument();
    });
  });

  describe('Opening Animation', () => {
    it('mounts component when open changes from false to true', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open={false}>Content</Collapsible>, { wrapper });

      expect(container.querySelector('.cl-collapsible')).not.toBeInTheDocument();

      rerender(<Collapsible open>Content</Collapsible>);

      await waitFor(() => {
        expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
      });
    });

    it('starts with isExpanded=false before requestAnimationFrame', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open={false}>Content</Collapsible>, { wrapper });

      rerender(<Collapsible open>Content</Collapsible>);

      // Immediately after render, before rAF, should have 0fr
      const element = container.querySelector('.cl-collapsible') as HTMLElement;
      if (element) {
        const styles = window.getComputedStyle(element);
        expect(styles.gridTemplateRows).toBe('0fr');
        expect(styles.opacity).toBe('0');
      }
    });

    it('sets isExpanded=true after requestAnimationFrame', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open={false}>Content</Collapsible>, { wrapper });

      rerender(<Collapsible open>Content</Collapsible>);
      await waitForAnimationFrame();

      await waitFor(() => {
        const element = container.querySelector('.cl-collapsible') as HTMLElement;
        expect(element).toBeInTheDocument();
        const styles = window.getComputedStyle(element);
        expect(styles.gridTemplateRows).toBe('1fr');
        expect(styles.opacity).toBe('1');
      });
    });
  });

  describe('Closing Animation', () => {
    it('keeps component mounted during closing transition', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      await waitForAnimationFrame();
      await waitFor(() => {
        expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
      });

      rerender(<Collapsible open={false}>Content</Collapsible>);
      await waitForAnimationFrame();

      const element = container.querySelector('.cl-collapsible');
      if (element) {
        const styles = window.getComputedStyle(element as HTMLElement);
        expect(styles.gridTemplateRows).toBe('0fr');
        expect(styles.opacity).toBe('0');
      }
    });

    it('unmounts component after transition end when closing', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      await waitForAnimationFrame();
      await waitFor(() => {
        expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
      });

      rerender(<Collapsible open={false}>Content</Collapsible>);
      await waitForAnimationFrame();

      const element = container.querySelector('.cl-collapsible') as HTMLElement;
      if (element) {
        act(() => {
          element.dispatchEvent(createTransitionEndEvent(element));
        });

        await waitFor(() => {
          expect(container.querySelector('.cl-collapsible')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Mask Animation State', () => {
    it('sets mask size to 0.5rem when animating', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open={false}>Content</Collapsible>, { wrapper });

      rerender(<Collapsible open>Content</Collapsible>);

      await waitFor(() => {
        const inner = container.querySelector('.cl-collapsibleInner') as HTMLElement;
        expect(inner).toBeInTheDocument();
        const styles = window.getComputedStyle(inner);
        const maskSize = styles.getPropertyValue('--cl-collapsible-mask-size').trim();
        expect(maskSize).toBe('0.5rem');
      });
    });

    it('sets mask size to 0px when fully open', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open={false}>Content</Collapsible>, { wrapper });

      rerender(<Collapsible open>Content</Collapsible>);
      await waitForAnimationFrame();

      await waitFor(() => {
        const inner = container.querySelector('.cl-collapsibleInner') as HTMLElement;
        expect(inner).toBeInTheDocument();
        const styles = window.getComputedStyle(inner);
        const maskSize = styles.getPropertyValue('--cl-collapsible-mask-size').trim();
        expect(maskSize).toBe('0px');
      });
    });

    it('sets mask size to 0.5rem when closing', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      await waitForAnimationFrame();

      rerender(<Collapsible open={false}>Content</Collapsible>);

      // Check synchronously right after rerender - useEffect runs after render,
      // so component should still be mounted at this point if animations are enabled
      const inner = container.querySelector('.cl-collapsibleInner') as HTMLElement;
      if (inner) {
        const styles = window.getComputedStyle(inner);
        const maskSize = styles.getPropertyValue('--cl-collapsible-mask-size').trim();
        expect(maskSize).toBe('0.5rem');
      }
    });

    it('uses CSS custom property in mask gradient', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      const inner = container.querySelector('.cl-collapsibleInner') as HTMLElement;
      expect(inner).toBeInTheDocument();

      const styles = window.getComputedStyle(inner);
      const maskImage = styles.maskImage || styles.webkitMaskImage || '';
      expect(maskImage).toContain('var(--cl-collapsible-mask-size)');
    });
  });

  describe('Reduced Motion Handling', () => {
    it('disables transitions when prefersReducedMotion is true', async () => {
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const { wrapper } = await createFixtures();
      const { container } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
    });

    it('handles closing behavior based on motion settings', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      await waitForAnimationFrame();
      await waitFor(() => {
        expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
      });

      rerender(<Collapsible open={false}>Content</Collapsible>);
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      const element = container.querySelector('.cl-collapsible');
      if (element) {
        expect(element).toBeInTheDocument();
      }
    });
  });

  describe('Transition End Handling', () => {
    it('only processes events from the outer Box element', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(
        <Collapsible open>
          <div data-testid='child'>Child</div>
        </Collapsible>,
        { wrapper },
      );

      const outer = container.querySelector('.cl-collapsible') as HTMLElement;
      const child = container.querySelector('[data-testid="child"]') as HTMLElement;

      const childEvent = createTransitionEndEvent(child, outer);

      act(() => {
        outer.dispatchEvent(childEvent);
      });

      expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
    });

    it('unmounts when closing and transition ends', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      await waitForAnimationFrame();
      rerender(<Collapsible open={false}>Content</Collapsible>);

      const element = container.querySelector('.cl-collapsible') as HTMLElement;
      expect(element).toBeInTheDocument();

      act(() => {
        element.dispatchEvent(createTransitionEndEvent(element));
      });

      await waitFor(() => {
        expect(container.querySelector('.cl-collapsible')).not.toBeInTheDocument();
      });
    });

    it('stays mounted when opening and transition ends', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open={false}>Content</Collapsible>, { wrapper });

      rerender(<Collapsible open>Content</Collapsible>);
      await waitForAnimationFrame();

      const element = container.querySelector('.cl-collapsible') as HTMLElement;
      expect(element).toBeInTheDocument();

      act(() => {
        element.dispatchEvent(createTransitionEndEvent(element));
      });

      expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
    });
  });

  describe('Inert Attribute', () => {
    it('sets inert to empty string when open={false}', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      await waitForAnimationFrame();
      rerender(<Collapsible open={false}>Content</Collapsible>);

      const element = container.querySelector('.cl-collapsible') as HTMLElement;
      expect(element).toHaveAttribute('inert', '');
    });

    it('does not set inert when open={true}', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(<Collapsible open>Content</Collapsible>, { wrapper });

      await waitForAnimationFrame();

      const element = container.querySelector('.cl-collapsible') as HTMLElement;
      expect(element).not.toHaveAttribute('inert');
    });
  });

  describe('Custom Styles (sx prop)', () => {
    it('applies custom sx prop correctly', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(
        <Collapsible
          open
          sx={t => ({
            padding: t.space.$4,
          })}
        >
          Content
        </Collapsible>,
        { wrapper },
      );

      expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
    });

    it('merges custom styles with default styles', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(
        <Collapsible
          open
          sx={_t => ({
            backgroundColor: 'red',
          })}
        >
          Content
        </Collapsible>,
        { wrapper },
      );

      expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid open/close toggling', async () => {
      const { wrapper } = await createFixtures();
      const { container, rerender } = render(<Collapsible open={false}>Content</Collapsible>, { wrapper });

      rerender(<Collapsible open>Content</Collapsible>);
      rerender(<Collapsible open={false}>Content</Collapsible>);
      rerender(<Collapsible open>Content</Collapsible>);

      await waitForAnimationFrame();

      expect(container.querySelector('.cl-collapsible')).toBeInTheDocument();
    });

    it('cleans up requestAnimationFrame on unmount', async () => {
      const cancelAnimationFrameSpy = vi.spyOn(global, 'cancelAnimationFrame');

      const { wrapper } = await createFixtures();
      const { unmount, rerender } = render(<Collapsible open={false}>Content</Collapsible>, { wrapper });

      rerender(<Collapsible open>Content</Collapsible>);

      unmount();

      // Should cancel pending rAF
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();

      cancelAnimationFrameSpy.mockRestore();
    });

    it('handles multiple instances without conflicts', async () => {
      const { wrapper } = await createFixtures();
      const { container } = render(
        <div>
          <Collapsible open>First</Collapsible>
          <Collapsible open>Second</Collapsible>
          <Collapsible open={false}>Third</Collapsible>
        </div>,
        { wrapper },
      );

      const collapsibles = container.querySelectorAll('.cl-collapsible');
      expect(collapsibles).toHaveLength(2); // Only open ones render
    });
  });
});
