'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { KnobRecord, KnobValues } from '@/lib/types';

interface KnobPanelProps {
  knobs: KnobRecord;
  values: KnobValues;
  onChange: (values: KnobValues) => void;
}

export function KnobPanel({ knobs, values, onChange }: KnobPanelProps) {
  const entries = Object.entries(knobs);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col gap-3 p-3'>
      {entries.map(([key, def]) => (
        <div
          key={key}
          className='flex items-center gap-3'
        >
          <Label
            htmlFor={`knob-${key}`}
            className='text-muted-foreground w-24 shrink-0 cursor-pointer text-xs'
          >
            {def.label}
          </Label>

          {def.type === 'boolean' && (
            <Switch
              id={`knob-${key}`}
              checked={values[key] as boolean}
              onCheckedChange={checked => onChange({ ...values, [key]: checked === true })}
            />
          )}

          {def.type === 'text' && (
            <Input
              id={`knob-${key}`}
              value={values[key] as string}
              onChange={e => onChange({ ...values, [key]: e.target.value })}
              className='h-7 text-xs'
            />
          )}

          {def.type === 'number' && (
            <Input
              id={`knob-${key}`}
              type='number'
              value={values[key] as number}
              min={def.min}
              max={def.max}
              step={def.step}
              onChange={e => onChange({ ...values, [key]: e.target.valueAsNumber })}
              className='h-7 text-xs'
            />
          )}

          {def.type === 'select' &&
            (() => {
              const items = def.options.map(opt => ({ label: opt, value: opt }));
              return (
                <Select
                  items={items}
                  value={values[key] as string}
                  onValueChange={v => onChange({ ...values, [key]: v ?? '' })}
                >
                  <SelectTrigger className='h-7 w-full text-xs'>
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
            })()}
        </div>
      ))}
    </div>
  );
}
