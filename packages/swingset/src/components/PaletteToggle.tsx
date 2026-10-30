'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { applyPreset, colorPresets, getActivePreset, getColorVersion, subscribeColors } from '@/lib/color-overrides';

export function PaletteToggle() {
  React.useSyncExternalStore(subscribeColors, getColorVersion, () => 0);
  const active = getActivePreset();
  const label = active === 'custom' ? 'Custom' : colorPresets.find(preset => preset.id === active)?.label;

  return (
    <div className='flex items-center gap-2'>
      <Label
        htmlFor='palette-toggle'
        className='text-muted-foreground text-xs'
      >
        Palette
      </Label>
      <Select
        value={active}
        onValueChange={value => value && value !== 'custom' && applyPreset(value)}
      >
        <SelectTrigger
          id='palette-toggle'
          size='sm'
        >
          <SelectValue>{label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {colorPresets.map(preset => (
            <SelectItem
              key={preset.id}
              value={preset.id}
            >
              {preset.label}
            </SelectItem>
          ))}
          {active === 'custom' ? (
            <SelectItem
              value='custom'
              disabled
            >
              Custom
            </SelectItem>
          ) : null}
        </SelectContent>
      </Select>
    </div>
  );
}
