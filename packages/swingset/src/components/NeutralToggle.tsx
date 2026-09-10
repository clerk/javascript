'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Retints Mosaic's `--cl-color-neutral` / `--cl-color-background` roots (see `globals.css`)
// to preview how the derived gray ramp follows a warm neutral.
export function NeutralToggle() {
  const [warm, setWarm] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.toggle('warm-neutral', warm);
  }, [warm]);

  return (
    <div className='flex items-center gap-2'>
      <Switch
        id='neutral-toggle'
        checked={warm}
        onCheckedChange={setWarm}
      />
      <Label
        htmlFor='neutral-toggle'
        className='text-muted-foreground cursor-pointer text-xs'
      >
        Warm neutral
      </Label>
    </div>
  );
}
