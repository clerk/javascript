/** @jsxImportSource @emotion/react */
import { Button } from '@clerk/ui/mosaic/components/button';
import type { TooltipProps } from '@clerk/ui/mosaic/components/tooltip';
import { Tooltip, tooltipStyles } from '@clerk/ui/mosaic/components/tooltip';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Tooltip',
  styles: tooltipStyles,
};

// Story functions accept Record<string,unknown> (knob values) and cast to TooltipProps.
// The cast is unavoidable: knobs are dynamically typed; Tooltip has a strict prop interface.
function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as TooltipProps;
}

export function Options(props: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Tooltip
        {...knobsAsProps(props)}
        content='On top'
        side='top'
      >
        <Button>Top</Button>
      </Tooltip>
      <Tooltip
        {...knobsAsProps(props)}
        content='On the right'
        side='right'
      >
        <Button>Right</Button>
      </Tooltip>
      <Tooltip
        {...knobsAsProps(props)}
        content='On the bottom'
        side='bottom'
      >
        <Button>Bottom</Button>
      </Tooltip>
      <Tooltip
        {...knobsAsProps(props)}
        content='On the left'
        side='left'
      >
        <Button>Left</Button>
      </Tooltip>
    </div>
  );
}
