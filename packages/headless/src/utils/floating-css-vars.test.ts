import type { MiddlewareState } from '@floating-ui/react';
import { describe, expect, it, vi } from 'vitest';
import { floatingCssVars } from './floating-css-vars';

// Build a minimal MiddlewareState mock for testing the middleware fn
function createMockState(
  overrides: {
    placement?: string;
    referenceWidth?: number;
    referenceHeight?: number;
    floatingWidth?: number;
    floatingHeight?: number;
    arrowX?: number;
    arrowY?: number;
    arrowElWidth?: number;
    arrowElHeight?: number;
    overflow?: { top: number; right: number; bottom: number; left: number };
  } = {},
): MiddlewareState {
  const {
    placement = 'bottom',
    referenceWidth = 100,
    referenceHeight = 40,
    floatingWidth = 200,
    floatingHeight = 150,
    arrowX,
    arrowY,
    arrowElWidth = 0,
    arrowElHeight = 0,
    overflow = { top: 0, right: 0, bottom: 0, left: 0 },
  } = overrides;

  const style = {
    setProperty: vi.fn(),
  };

  // Mock arrow element inside floating
  const arrowEl = arrowElWidth || arrowElHeight ? { clientWidth: arrowElWidth, clientHeight: arrowElHeight } : null;

  const floating = {
    style,
    querySelector: vi.fn(() => arrowEl),
  } as unknown as HTMLElement;

  return {
    placement,
    elements: {
      floating,
      reference: document.createElement('div'),
    },
    rects: {
      reference: { width: referenceWidth, height: referenceHeight, x: 0, y: 0 },
      floating: { width: floatingWidth, height: floatingHeight, x: 0, y: 0 },
    },
    middlewareData: {
      arrow: arrowX != null || arrowY != null ? { x: arrowX ?? 0, y: arrowY ?? 0, centerOffset: 0 } : {},
    },
    platform: {
      getElementRects: vi.fn(),
      getDimensions: vi.fn(),
      getClippingRect: vi.fn(async () => ({
        width: 1024,
        height: 768,
        x: 0,
        y: 0,
      })),
      convertOffsetParentRelativeRectToViewportRelativeRect: vi.fn(async ({ rect }: { rect: unknown }) => rect),
    },
    x: 0,
    y: 0,
    initialPlacement: placement,
    strategy: 'absolute',
  } as unknown as MiddlewareState;
}

// Helper to extract setProperty calls into a map
function getVars(state: MiddlewareState): Map<string, string> {
  const style = (state.elements.floating as HTMLElement).style;
  const calls = (style.setProperty as ReturnType<typeof vi.fn>).mock.calls as [string, string][];
  return new Map(calls.map(([name, value]) => [name, value]));
}

describe('floatingCssVars middleware', () => {
  it("has name 'floatingCssVars'", () => {
    const mw = floatingCssVars();
    expect(mw.name).toBe('floatingCssVars');
  });

  describe('--anchor-width and --anchor-height', () => {
    it('sets anchor dimensions from reference rects', async () => {
      const mw = floatingCssVars();
      const state = createMockState({
        referenceWidth: 120,
        referenceHeight: 36,
      });
      await mw.fn(state);

      const vars = getVars(state);
      expect(vars.get('--anchor-width')).toBe('120px');
      expect(vars.get('--anchor-height')).toBe('36px');
    });

    it('handles zero-size reference', async () => {
      const mw = floatingCssVars();
      const state = createMockState({
        referenceWidth: 0,
        referenceHeight: 0,
      });
      await mw.fn(state);

      const vars = getVars(state);
      expect(vars.get('--anchor-width')).toBe('0px');
      expect(vars.get('--anchor-height')).toBe('0px');
    });
  });

  describe('--available-width and --available-height', () => {
    it('sets available dimensions as CSS vars', async () => {
      const mw = floatingCssVars();
      const state = createMockState({
        floatingWidth: 200,
        floatingHeight: 150,
      });
      await mw.fn(state);

      const vars = getVars(state);
      // Values are set (exact numbers depend on detectOverflow's padding)
      expect(vars.has('--available-width')).toBe(true);
      expect(vars.has('--available-height')).toBe(true);
      expect(vars.get('--available-width')).toMatch(/^\d+px$/);
      expect(vars.get('--available-height')).toMatch(/^\d+px$/);
    });
  });

  describe('--transform-origin', () => {
    it('centers on anchor when no arrow (bottom)', async () => {
      const mw = floatingCssVars({ sideOffset: 8 });
      // Reference: x=0, width=100 → center at 50. Floating: x=0.
      // transformX = 0 + 100/2 - 0 = 50
      const state = createMockState({
        placement: 'bottom',
        referenceWidth: 100,
      });
      await mw.fn(state);

      const vars = getVars(state);
      expect(vars.get('--transform-origin')).toBe('50px -8px');
    });

    it('centers on anchor when no arrow (top)', async () => {
      const mw = floatingCssVars({ sideOffset: 4 });
      const state = createMockState({
        placement: 'top',
        referenceWidth: 100,
      });
      await mw.fn(state);

      const vars = getVars(state);
      expect(vars.get('--transform-origin')).toBe('50px calc(100% + 4px)');
    });

    it('centers on anchor when no arrow (left)', async () => {
      const mw = floatingCssVars({ sideOffset: 6 });
      const state = createMockState({
        placement: 'left',
        referenceHeight: 40,
      });
      await mw.fn(state);

      const vars = getVars(state);
      // transformY = 0 + 40/2 - 0 = 20
      expect(vars.get('--transform-origin')).toBe('calc(100% + 6px) 20px');
    });

    it('centers on anchor when no arrow (right)', async () => {
      const mw = floatingCssVars({ sideOffset: 6 });
      const state = createMockState({
        placement: 'right',
        referenceHeight: 40,
      });
      await mw.fn(state);

      const vars = getVars(state);
      expect(vars.get('--transform-origin')).toBe('-6px 20px');
    });

    it('handles alignment variants (e.g. bottom-start)', async () => {
      const mw = floatingCssVars({ sideOffset: 4 });
      const state = createMockState({
        placement: 'bottom-start',
        referenceWidth: 100,
      });
      await mw.fn(state);

      const vars = getVars(state);
      // Side is still "bottom", centers on anchor
      expect(vars.get('--transform-origin')).toBe('50px -4px');
    });

    it('uses arrow position when arrow is present', async () => {
      const mw = floatingCssVars({ sideOffset: 4 });
      const state = createMockState({
        placement: 'bottom',
        arrowX: 50,
        arrowElWidth: 12,
      });
      await mw.fn(state);

      const vars = getVars(state);
      // transformX = arrowX + arrowWidth/2 = 50 + 6 = 56
      expect(vars.get('--transform-origin')).toBe('56px -4px');
    });

    it('uses arrow Y position on left/right placement', async () => {
      const mw = floatingCssVars({ sideOffset: 4 });
      const state = createMockState({
        placement: 'right',
        arrowY: 30,
        arrowElHeight: 10,
      });
      await mw.fn(state);

      const vars = getVars(state);
      // transformY = arrowY + arrowHeight/2 = 30 + 5 = 35
      expect(vars.get('--transform-origin')).toBe('-4px 35px');
    });

    it('defaults sideOffset to 0 when not provided', async () => {
      const mw = floatingCssVars();
      const state = createMockState({
        placement: 'bottom',
        referenceWidth: 100,
      });
      await mw.fn(state);

      const vars = getVars(state);
      expect(vars.get('--transform-origin')).toBe('50px 0px');
    });
  });

  describe('return value', () => {
    it('returns empty object (no position changes)', async () => {
      const mw = floatingCssVars();
      const state = createMockState();
      const result = await mw.fn(state);
      expect(result).toEqual({});
    });
  });

  describe('all five CSS vars are set', () => {
    it('sets exactly 5 CSS custom properties', async () => {
      const mw = floatingCssVars({ sideOffset: 4 });
      const state = createMockState({ placement: 'bottom' });
      await mw.fn(state);

      const style = state.elements.floating.style;
      const calls = (style.setProperty as ReturnType<typeof vi.fn>).mock.calls as [string, string][];
      const varNames = calls.map(([name]) => name);

      expect(varNames).toEqual([
        '--anchor-width',
        '--anchor-height',
        '--available-width',
        '--available-height',
        '--transform-origin',
      ]);
    });
  });
});
