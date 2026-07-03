'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { KnobDef, KnobValues } from '@/lib/types';

interface KnobControlProps {
  id: string;
  def: KnobDef;
  value: KnobValues[string];
  onChange: (value: KnobValues[string]) => void;
}

/** A single auto-generated control for one knob, used inside the interactive prop table. */
export function KnobControl({ id, def, value, onChange }: KnobControlProps) {
  switch (def.type) {
    case 'boolean':
      return (
        <Switch
          id={id}
          checked={value as boolean}
          onCheckedChange={checked => onChange(checked === true)}
        />
      );
    case 'text':
      return (
        <Input
          id={id}
          value={value as string}
          onChange={e => onChange(e.target.value)}
          className='h-7 text-xs'
        />
      );
    case 'number':
      return (
        <Input
          id={id}
          type='number'
          value={value as number}
          min={def.min}
          max={def.max}
          step={def.step}
          onChange={e => onChange(e.target.valueAsNumber)}
          className='h-7 w-24 text-xs'
        />
      );
    case 'select': {
      const items = def.options.map(opt => ({ label: opt, value: opt }));
      return (
        <Select
          items={items}
          value={value as string}
          onValueChange={v => onChange(v ?? '')}
        >
          <SelectTrigger className='h-7 w-full min-w-32 text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map(item => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }
  }
}
