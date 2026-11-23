'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { useChaos } from './ChaosProvider';

export function ChaosToggle() {
  const { chaos, setChaos } = useChaos();

  return (
    <div className='flex items-center gap-2'>
      <Switch
        id='chaos-toggle'
        checked={chaos}
        onCheckedChange={setChaos}
      />
      <Label
        htmlFor='chaos-toggle'
        className='text-muted-foreground cursor-pointer text-xs'
      >
        Chaos
      </Label>
    </div>
  );
}
