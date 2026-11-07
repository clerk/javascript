'use client';
import * as React from 'react';

import type { ToolSettings } from '@/lib/mosaic-tools/canvas';
import { TOOLS } from '@/lib/mosaic-tools/registry';
export function ToolCanvas({
  slug,
  settings,
  className,
  trackWindow = false,
}: {
  slug: string;
  settings: ToolSettings;
  className?: string;
  trackWindow?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const toolRef = React.useRef<ReturnType<(typeof TOOLS)[string]['create']> | null>(null);
  const initialSettings = React.useRef(settings);
  React.useEffect(() => {
    const container = containerRef.current;
    const definition = TOOLS[slug];
    if (!container || !definition) {
      return;
    }
    toolRef.current = definition.create(container, initialSettings.current);
    return () => {
      toolRef.current?.dispose();
      toolRef.current = null;
    };
  }, [slug]);
  React.useEffect(() => {
    const container = containerRef.current;
    if (!trackWindow || !container) {
      return;
    }
    const forward = (type: string) => (event: PointerEvent) => {
      container.dispatchEvent(new PointerEvent(type, { clientX: event.clientX, clientY: event.clientY }));
    };
    const onMove = forward('pointermove');
    const onLeave = () => container.dispatchEvent(new PointerEvent('pointerleave'));
    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [trackWindow]);
  React.useEffect(() => {
    toolRef.current?.update(settings);
  }, [settings]);
  return (
    <div
      ref={containerRef}
      className={className}
    />
  );
}
