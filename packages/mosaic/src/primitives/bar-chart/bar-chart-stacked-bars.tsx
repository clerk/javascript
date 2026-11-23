'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import {
  type BarStyleElement,
  CanvasRenderError,
  getBarGeometrySnapshot,
  paintStackedBarCanvas,
  parseBarGeometry,
} from './bar-chart-canvas';
import { hasArea, StackedBarsContext, useBarChartContext } from './bar-chart-context';
import { fitProjectionToBar, projectStackedBarMarks } from './bar-chart-layout';

export type BarChartStackedBarsProps = ComponentProps<'div'>;

function subscribeToPixelRatio(callback: () => void) {
  let query = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
  const onChange = () => {
    query.removeEventListener('change', onChange);
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    query.addEventListener('change', onChange);
    callback();
  };
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

function getRootThemeAttributes() {
  const root = document.documentElement;
  return JSON.stringify([root.getAttribute('class'), root.getAttribute('style'), root.getAttribute('data-theme')]);
}

function subscribeToRootTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
  return () => observer.disconnect();
}

const getServerSnapshot = () => '';
const getServerPixelRatio = () => 1;

export const BarChartStackedBars = React.forwardRef<HTMLDivElement, BarChartStackedBarsProps>(
  function BarChartStackedBars(props, ref) {
    const { children, render, ...otherProps } = props;
    const { chart, ariaLabel } = useBarChartContext('StackedBars');
    const { size, prepared, categories, scaleY, isBarActive, projection: projectedBar } = chart;
    const rootThemeAttributes = React.useSyncExternalStore(
      subscribeToRootTheme,
      getRootThemeAttributes,
      getServerSnapshot,
    );
    const pixelRatio = React.useSyncExternalStore(subscribeToPixelRatio, getPixelRatio, getServerPixelRatio);
    const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);
    const [canvasError, setCanvasError] = React.useState<CanvasRenderError | null>(null);
    const [bar, setBar] = React.useState<BarStyleElement | null>(null);
    const subscribeToBarClass = React.useCallback(
      (onChange: () => void) => {
        if (!bar) {
          return () => {};
        }
        const observer = new MutationObserver(onChange);
        observer.observe(bar, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
      },
      [bar],
    );
    const barClass = React.useSyncExternalStore(
      subscribeToBarClass,
      () => bar?.getAttribute('class') ?? '',
      getServerSnapshot,
    );
    const barGeometry = React.useSyncExternalStore(
      subscribeToBarClass,
      () => getBarGeometrySnapshot(bar),
      getServerSnapshot,
    );
    const geometry = React.useMemo(() => parseBarGeometry(barGeometry), [barGeometry]);
    const marks = React.useMemo(
      () => projectStackedBarMarks({ prepared, categories, scaleY }, geometry),
      [categories, geometry, prepared, scaleY],
    );
    const projection = React.useMemo(() => fitProjectionToBar(projectedBar, geometry), [geometry, projectedBar]);
    const stackedBarsContext = React.useMemo(() => ({ setBar, projection }), [projection]);

    React.useLayoutEffect(() => {
      if (!canvas || !hasArea(size)) {
        return;
      }
      paintStackedBarCanvas({ canvas, marks, projection, size, pixelRatio, isBarActive, bar });
      const onContextLost = () => {
        setCanvasError(new CanvasRenderError('Canvas 2D context was lost', null));
      };
      canvas.addEventListener('contextlost', onContextLost);
      return () => canvas.removeEventListener('contextlost', onContextLost);
      // `barClass` and `rootThemeAttributes` are not read here: they change the computed colors the paint reads from the DOM.
    }, [bar, barClass, canvas, isBarActive, marks, pixelRatio, projection, rootThemeAttributes, size]);

    const ownProps = {
      style: { position: 'absolute', inset: 0 },
      children: (
        <>
          <canvas
            ref={setCanvas}
            role='img'
            aria-label={ariaLabel}
            style={{ position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none' }}
          />
          <svg
            width={size.width}
            height={size.height}
            aria-hidden='true'
            style={{ position: 'absolute', inset: 0, display: 'block', overflow: 'visible' }}
          >
            <StackedBarsContext.Provider value={stackedBarsContext}>{children}</StackedBarsContext.Provider>
          </svg>
        </>
      ),
    } satisfies DefaultProps<'div'>;

    const element = useRender({
      defaultTagName: 'div',
      render,
      ref,
      enabled: hasArea(size),
      props: mergeProps<'div'>(ownProps, otherProps),
    });

    if (canvasError) {
      throw canvasError;
    }
    return element;
  },
);
