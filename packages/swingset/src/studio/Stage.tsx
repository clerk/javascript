'use client';

import { ClerkLogo } from '@clerk/mosaic/components/clerk-logo';
import { PortalProvider } from '@clerk/mosaic/primitives/portal';
import type { ComponentProps, CSSProperties, MutableRefObject, ReactNode, Ref, RefObject } from 'react';
import { createContext, useLayoutEffect, useRef, useState } from 'react';

import { CodeView } from './CodeView';
import { Cursor, type CursorState } from './Cursor';
import type { StudioBadges, StudioFormat, StudioLayout, StudioScheme } from './types';

export const FORMATS: Record<StudioFormat, { width: number; height: number }> = {
  landscape: { width: 1280, height: 720 },
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
};

function openBoxes(root: Element, boxes: DOMRect[] = []): DOMRect[] {
  for (const child of root.children) {
    if (child.matches(CLOSING) || child.querySelector(CLOSING)) {
      continue;
    }
    const box = child.getBoundingClientRect();
    if (box.width > 0 && box.height > 0) {
      boxes.push(box);
    } else {
      openBoxes(child, boxes);
    }
  }
  return boxes;
}

const CLOSING = '[data-closed], [data-ending-style]';

function useFocusFrame(resetKey: unknown) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const extent = useRef({ width: 0, height: 0 });

  useLayoutEffect(() => {
    extent.current = { width: 0, height: 0 };
    contentRef.current?.style.removeProperty('--measured-w');
    contentRef.current?.style.removeProperty('--measured-h');
  }, [resetKey]);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    const portal = portalRef.current;
    if (!frame || !content || !portal) {
      return;
    }
    let pending = 0;
    const measure = () => {
      const origin = frame.getBoundingClientRect();
      const scale = origin.width / frame.offsetWidth || 1;
      const own = content.getBoundingClientRect();
      const popups = openBoxes(portal);
      for (const popup of popups) {
        if (popup.width === 0 || portal.querySelector('[data-starting-style]')) {
          continue;
        }
        const width = (popup.right - own.left) / scale;
        const height = (popup.bottom - own.top) / scale;
        if (width > extent.current.width) {
          extent.current.width = width;
          content.style.setProperty('--measured-w', `${Math.ceil(width)}px`);
        }
        if (height > extent.current.height) {
          extent.current.height = height;
          content.style.setProperty('--measured-h', `${Math.ceil(height)}px`);
        }
      }
      const boxes = [own, ...popups];
      const left = Math.min(...boxes.map(box => box.left));
      const right = Math.max(...boxes.map(box => box.right));
      const top = Math.min(...boxes.map(box => box.top));
      const bottom = Math.max(...boxes.map(box => box.bottom));
      frame.style.setProperty('--focus-x', `${((left + right) / 2 - origin.left) / scale}px`);
      frame.style.setProperty('--focus-y', `${((top + bottom) / 2 - origin.top) / scale}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(measure);
    };
    measure();
    const ready = requestAnimationFrame(() => frame.setAttribute('data-ready', ''));
    const resize = new ResizeObserver(schedule);
    resize.observe(content);
    portal.addEventListener('transitionend', schedule);
    portal.addEventListener('animationend', schedule);
    const mutation = new MutationObserver(schedule);
    mutation.observe(portal, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-open', 'data-closed', 'data-starting-style', 'data-ending-style', 'style'],
    });
    return () => {
      cancelAnimationFrame(pending);
      cancelAnimationFrame(ready);
      resize.disconnect();
      mutation.disconnect();
      portal.removeEventListener('transitionend', schedule);
      portal.removeEventListener('animationend', schedule);
    };
  }, []);

  return { frameRef, contentRef, portalRef };
}

export interface StageProps extends ComponentProps<'div'> {
  layout: StudioLayout;
  format: StudioFormat;
  scheme: StudioScheme;
  title?: string;
  badges?: StudioBadges;
  code?: string;
  file?: string;
  lang?: string;
  view?: ReactNode;
  focus?: { width: number; height: number };
  cellPadding?: number;
  plain?: boolean;
  grid?: boolean;
  cursor?: CursorState;
  stageRef?: Ref<HTMLDivElement>;
  viewRef?: Ref<HTMLElement>;
  scaleRef?: MutableRefObject<number>;
}

function useForgivingClipboard() {
  useLayoutEffect(() => {
    const clipboard = navigator.clipboard;
    if (!clipboard) {
      return;
    }
    const writeText = clipboard.writeText.bind(clipboard);
    clipboard.writeText = text => writeText(text).catch(() => undefined);
    return () => {
      clipboard.writeText = writeText;
    };
  }, []);
}

export const StageOverlayContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function Stage({
  layout,
  format,
  scheme,
  title,
  badges = 'both',
  code,
  file,
  lang = 'tsx',
  view,
  focus,
  cellPadding,
  plain,
  grid,
  cursor,
  stageRef,
  viewRef,
  scaleRef,
  children,
  ...props
}: StageProps) {
  const { width, height } = FORMATS[format];
  const viewportRef = useRef<HTMLDivElement>(null);
  const { frameRef, contentRef, portalRef } = useFocusFrame(title);
  const cellRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  useForgivingClipboard();
  const previousLayout = useRef(layout);
  const transition = useRef({ layout, from: layout });
  if (transition.current.layout !== layout) {
    transition.current = { layout, from: transition.current.layout };
  }

  useLayoutEffect(() => {
    const cell = cellRef.current;
    if (!cell) {
      return;
    }
    const box = cell.getBoundingClientRect();
    let fill: Element = cell;
    for (const element of cell.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect();
      if (Math.abs(rect.width - box.width) < 1 && Math.abs(rect.height - box.height) < 1) {
        fill = element;
      }
    }
    const style = getComputedStyle(fill);
    cell.style.borderRadius = fill === cell ? '' : style.borderRadius;
    cell.style.setProperty('corner-shape', fill === cell ? '' : style.getPropertyValue('corner-shape'));
  });

  useLayoutEffect(() => {
    const from = previousLayout.current;
    previousLayout.current = layout;
    const frame = frameRef.current;
    if (from !== 'split' || layout !== 'component' || !frame) {
      return;
    }
    const style = getComputedStyle(frame);
    const out = parseFloat(style.getPropertyValue('--fade-out-ms'));
    const fadeIn = parseFloat(style.getPropertyValue('--fade-in-ms'));
    frame.animate(
      [
        { opacity: 1, easing: style.getPropertyValue('--ease-fade').trim() || 'ease-out' },
        {
          opacity: 0,
          offset: out / (out + fadeIn),
          easing: style.getPropertyValue('--ease-fade').trim() || 'ease-out',
        },
        { opacity: 1 },
      ],
      { duration: out + fadeIn },
    );
  }, [layout, frameRef]);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const fit = () => {
      const next = Math.min(1, viewport.clientWidth / width, viewport.clientHeight / height);
      if (scaleRef) {
        scaleRef.current = next;
      }
      setScale(next);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [width, height, scaleRef]);

  return (
    <div
      {...props}
      ref={viewportRef}
      className='studio-viewport'
      data-scheme={scheme}
    >
      <div
        ref={stageRef}
        className='studio-stage'
        data-layout={layout}
        data-from={transition.current.from}
        data-format={format}
        data-grid={grid || undefined}
        data-plain={plain || undefined}
        style={{ width, height, scale: String(scale) }}
      >
        <div className='studio-frame'>
          <div
            className='studio-rules'
            aria-hidden
          >
            <span data-edge='top' />
            <span data-edge='bottom' />
            <span data-edge='left' />
            <span data-edge='right' />
          </div>
          <div className='studio-panels'>
            <section
              className='studio-panel'
              data-panel='code'
            >
              {code && (
                <CodeView
                  code={file ? `// ${file}\n${code}` : code}
                  lang={lang}
                />
              )}
            </section>
            <span
              className='studio-divider'
              aria-hidden
            />
            <section
              ref={viewRef}
              className='studio-panel'
              data-panel='component'
            >
              <div
                ref={frameRef}
                className='studio-focus'
              >
                <div
                  ref={contentRef}
                  className='studio-focus-content'
                  style={
                    {
                      '--focus-w': focus ? `${focus.width}px` : undefined,
                      '--focus-h': focus ? `${focus.height}px` : undefined,
                      '--cell-pad': cellPadding === undefined ? undefined : `${cellPadding}px`,
                    } as CSSProperties
                  }
                >
                  <span
                    className='studio-cell-rules'
                    aria-hidden
                  >
                    <span data-edge='top' />
                    <span data-edge='right' />
                    <span data-edge='bottom' />
                    <span data-edge='left' />
                  </span>
                  <div
                    ref={cellRef}
                    className='studio-cell'
                  >
                    <StageOverlayContext.Provider value={overlayRef}>
                      <PortalProvider container={portalRef}>{view}</PortalProvider>
                    </StageOverlayContext.Provider>
                  </div>
                </div>
                <div
                  ref={portalRef}
                  className='studio-portal'
                />
              </div>
            </section>
          </div>
        </div>
        {badges !== 'none' && (
          <div className='studio-badges'>
            <span
              className='studio-glass-shadow'
              data-slot='logo'
            />
            {badges === 'both' && (
              <span
                className='studio-glass-shadow'
                data-slot='install'
              />
            )}
            <div
              className='studio-glass studio-watermark'
              data-slot='logo'
            >
              <span
                className='studio-prism'
                aria-hidden
              >
                <span />
              </span>
              <ClerkLogo viewBox='0 0 128 128' />
            </div>
            {badges === 'both' && (
              <div
                className='studio-glass studio-install'
                data-slot='install'
              >
                <span
                  className='studio-prism'
                  aria-hidden
                >
                  <span />
                </span>
                <span>
                  <span data-token='prompt'>$</span> <span data-token='command'>npm</span>{' '}
                  <span data-token='argument'>install</span> <span data-token='package'>@clerk/mosaic</span>
                </span>
              </div>
            )}
          </div>
        )}
        <div
          ref={overlayRef}
          className='studio-overlay'
        />
        {cursor && <Cursor state={cursor} />}
      </div>
      {children}
    </div>
  );
}
