'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { useDirection } from './DirectionProvider';

export function DirectionToggle() {
  const { direction, setDirection } = useDirection();

  return (
    <div className='flex items-center gap-2'>
      <Switch
        id='direction-toggle'
        checked={direction === 'rtl'}
        onCheckedChange={checked => setDirection(checked ? 'rtl' : 'ltr')}
      />
      <Label
        htmlFor='direction-toggle'
        className='text-muted-foreground cursor-pointer text-xs'
      >
        RTL
      </Label>
    </div>
  );
}
