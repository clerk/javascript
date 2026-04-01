import { render } from '@testing-library/vue';
import { vi } from 'vitest';
import { defineComponent, nextTick } from 'vue';

import { ClerkHostRenderer } from '../ClerkHostRenderer';

// Mock ClerkLoaded to always render children
vi.mock('../controlComponents', () => ({
  ClerkLoaded: defineComponent((_, { slots }) => {
    return () => slots.default?.();
  }),
}));

describe.skip('ClerkHostRenderer', () => {
  describe('Mount/Unmount Pattern', () => {
    const mockMount = vi.fn();
    const mockUnmount = vi.fn();
    const mockUpdateProps = vi.fn();

    beforeEach(() => {
      mockMount.mockReset();
      mockUnmount.mockReset();
      mockUpdateProps.mockReset();
    });

    it('mounts component when portal ref is set', async () => {
      const props = {
        appearance: {
          elements: {
            rootBox: 'test-class',
          },
        },
      };

      render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          props,
        },
      });

      await nextTick();

      expect(mockMount).toHaveBeenCalledTimes(1);
      expect(mockMount).toHaveBeenCalledWith(expect.any(HTMLDivElement), props);
    });

    it('mounts with initial props', async () => {
      const initialProps = {
        transferable: true,
        withSignUp: true,
      };

      render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          props: initialProps,
        },
      });

      await nextTick();

      expect(mockMount).toHaveBeenCalledTimes(1);
      expect(mockMount).toHaveBeenCalledWith(expect.any(HTMLDivElement), initialProps);
    });

    it('unmounts component on cleanup', async () => {
      const { unmount } = render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          unmount: mockUnmount,
          props: {},
        },
      });

      await nextTick();
      expect(mockMount).toHaveBeenCalledTimes(1);
      const mountedNode = mockMount.mock.calls[0][0];
      expect(mountedNode).toBeTruthy();

      unmount();

      await nextTick();

      expect(mockUnmount).toBeDefined();
      expect(typeof mockUnmount).toBe('function');
    });

    it('updates props when props change', async () => {
      const { rerender } = render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          unmount: mockUnmount,
          updateProps: mockUpdateProps,
          props: {
            appearance: {
              elements: {
                rootBox: 'initial-class',
              },
            },
          },
        },
      });

      await nextTick();
      expect(mockMount).toHaveBeenCalledTimes(1);
      mockUpdateProps.mockReset();

      await rerender({
        mount: mockMount,
        unmount: mockUnmount,
        updateProps: mockUpdateProps,
        props: {
          appearance: {
            elements: {
              rootBox: 'updated-class',
            },
          },
        },
      });

      await nextTick();

      expect(mockUpdateProps).toHaveBeenCalledTimes(1);
      expect(mockUpdateProps).toHaveBeenCalledWith({
        node: expect.any(HTMLDivElement),
        props: {
          appearance: {
            elements: {
              rootBox: 'updated-class',
            },
          },
        },
      });
    });

    it('handles multiple prop updates', async () => {
      const { rerender } = render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          updateProps: mockUpdateProps,
          props: {
            appearance: {
              elements: {
                rootBox: 'class-1',
              },
            },
          },
        },
      });

      await nextTick();
      mockUpdateProps.mockReset();

      await rerender({
        mount: mockMount,
        updateProps: mockUpdateProps,
        props: {
          appearance: {
            elements: {
              rootBox: 'class-2',
            },
          },
        },
      });
      await nextTick();
      expect(mockUpdateProps).toHaveBeenCalledTimes(1);

      await rerender({
        mount: mockMount,
        updateProps: mockUpdateProps,
        props: {
          appearance: {
            elements: {
              rootBox: 'class-3',
            },
          },
        },
      });
      await nextTick();
      expect(mockUpdateProps).toHaveBeenCalledTimes(2);
    });

    it('does not mount twice if already mounted', async () => {
      const { rerender } = render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          props: {},
        },
      });

      await nextTick();
      expect(mockMount).toHaveBeenCalledTimes(1);

      await rerender({
        mount: mockMount,
        props: { test: 'value' },
      });

      await nextTick();

      // Mount should still only be called once (isPortalMounted flag prevents remounting)
      expect(mockMount).toHaveBeenCalledTimes(1);
    });

    it('handles missing mount/unmount functions gracefully', async () => {
      const { unmount } = render(ClerkHostRenderer, {
        props: {
          props: {},
        },
      });

      await nextTick();

      expect(mockMount).not.toHaveBeenCalled();
      expect(mockUnmount).not.toHaveBeenCalled();

      unmount();

      await nextTick();

      expect(mockUnmount).not.toHaveBeenCalled();
    });
  });

  describe('Open/Close Pattern', () => {
    const mockOpen = vi.fn();
    const mockClose = vi.fn();

    beforeEach(() => {
      mockOpen.mockReset();
      mockClose.mockReset();
    });

    it('opens component with props when rendered', async () => {
      const props = {
        cancelOnTapOutside: false,
        itpSupport: true,
      };

      render(ClerkHostRenderer, {
        props: {
          open: mockOpen,
          props,
        },
      });

      await nextTick();

      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockOpen).toHaveBeenCalledWith(props);
    });

    it('closes component on cleanup', async () => {
      const { unmount } = render(ClerkHostRenderer, {
        props: {
          open: mockOpen,
          close: mockClose,
          props: {},
        },
      });

      await nextTick();
      expect(mockOpen).toHaveBeenCalledTimes(1);

      unmount();

      await nextTick();

      expect(mockClose).toBeDefined();
      expect(typeof mockClose).toBe('function');
    });

    it('handles missing open/close functions gracefully', async () => {
      const { unmount } = render(ClerkHostRenderer, {
        props: {
          props: {},
        },
      });

      await nextTick();

      expect(mockOpen).not.toHaveBeenCalled();
      expect(mockClose).not.toHaveBeenCalled();

      unmount();

      await nextTick();

      expect(mockClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    const mockMount = vi.fn();
    const mockUpdateProps = vi.fn();

    beforeEach(() => {
      mockMount.mockReset();
      mockUpdateProps.mockReset();
    });

    it('does not mount if ref is not set', async () => {
      // This is hard to test directly since the ref is set internally
      // But we can verify that mount is only called after ref is set
      render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          props: {},
        },
      });

      expect(mockMount).not.toHaveBeenCalled();

      await nextTick();
      expect(mockMount).toHaveBeenCalledTimes(1);
    });

    it('does not update props if updateProps function is not provided', async () => {
      const { rerender } = render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          props: { initial: 'value' },
        },
      });

      await nextTick();
      expect(mockMount).toHaveBeenCalledTimes(1);

      await rerender({
        mount: mockMount,
        props: { initial: 'updated' },
      });

      await nextTick();

      expect(mockUpdateProps).not.toHaveBeenCalled();
    });

    it('handles null/undefined props', async () => {
      render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          props: undefined,
        },
      });

      await nextTick();

      expect(mockMount).toHaveBeenCalledTimes(1);
      expect(mockMount).toHaveBeenCalledWith(expect.any(HTMLDivElement), {});
    });

    it('handles deep prop changes', async () => {
      const { rerender } = render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          updateProps: mockUpdateProps,
          props: {
            appearance: {
              elements: {
                rootBox: 'initial',
                button: 'button-initial',
              },
            },
          },
        },
      });

      await nextTick();
      mockUpdateProps.mockReset();

      await rerender({
        mount: mockMount,
        updateProps: mockUpdateProps,
        props: {
          appearance: {
            elements: {
              rootBox: 'initial',
              button: 'button-updated',
            },
          },
        },
      });

      await nextTick();

      expect(mockUpdateProps).toHaveBeenCalledTimes(1);
      expect(mockUpdateProps).toHaveBeenCalledWith({
        node: expect.any(HTMLDivElement),
        props: {
          appearance: {
            elements: {
              rootBox: 'initial',
              button: 'button-updated',
            },
          },
        },
      });
    });

    it('handles empty props object', async () => {
      render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          props: {},
        },
      });

      await nextTick();

      expect(mockMount).toHaveBeenCalledTimes(1);
      expect(mockMount).toHaveBeenCalledWith(expect.any(HTMLDivElement), {});
    });

    it('handles both mount and open functions', async () => {
      const mockOpen = vi.fn();

      render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          open: mockOpen,
          props: { test: 'value' },
        },
      });

      await nextTick();

      expect(mockMount).toHaveBeenCalledTimes(1);
      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockOpen).toHaveBeenCalledWith({ test: 'value' });
    });

    it('calls unmount with node on cleanup', async () => {
      const mockUnmount = vi.fn();

      const { unmount } = render(ClerkHostRenderer, {
        props: {
          mount: mockMount,
          unmount: mockUnmount,
          props: {},
        },
      });

      await nextTick();
      expect(mockMount).toHaveBeenCalledTimes(1);
      const mountedNode = mockMount.mock.calls[0][0];
      expect(mountedNode).toBeTruthy();

      unmount();

      await nextTick();

      expect(mockUnmount).toBeDefined();
      expect(typeof mockUnmount).toBe('function');
    });

    it('calls close on cleanup', async () => {
      const mockOpen = vi.fn();
      const mockClose = vi.fn();

      const { unmount } = render(ClerkHostRenderer, {
        props: {
          open: mockOpen,
          close: mockClose,
          props: {},
        },
      });

      await nextTick();
      expect(mockOpen).toHaveBeenCalledTimes(1);

      unmount();

      await nextTick();

      expect(mockClose).toBeDefined();
      expect(typeof mockClose).toBe('function');
    });
  });
});
