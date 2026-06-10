'use client';

import type { MosaicVariables } from '@clerk/ui/mosaic/variables';
import { defaultMosaicVariables } from '@clerk/ui/mosaic/variables';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VariablesPanelProps {
  variables: MosaicVariables;
  onChange: (variables: MosaicVariables) => void;
}

export function VariablesPanel({ variables, onChange }: VariablesPanelProps) {
  const colors = defaultMosaicVariables.color;
  const radii = defaultMosaicVariables.rounded;

  function setColor(key: keyof typeof colors, value: string) {
    onChange({ ...variables, color: { ...variables.color, [key]: value } });
  }

  function setRounded(key: keyof typeof radii, value: string) {
    onChange({ ...variables, rounded: { ...variables.rounded, [key]: value } });
  }

  function setSpacing(value: string) {
    onChange({ ...variables, spacing: value });
  }

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center justify-between gap-2 border-b px-3 py-2'>
        <span className='text-muted-foreground text-[10px] font-semibold uppercase tracking-widest'>Variables</span>
        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground h-6 px-2 text-xs'
          onClick={() => onChange({})}
        >
          Reset
        </Button>
      </div>

      <div className='flex flex-col gap-4 p-3'>
        <section className='flex flex-col gap-2'>
          <div className='text-muted-foreground text-[10px] font-semibold uppercase tracking-widest'>Colors</div>
          {(Object.keys(colors) as Array<keyof typeof colors>).map(key => (
            <div
              key={key}
              className='flex items-center gap-3'
            >
              <Label
                htmlFor={`var-color-${key}`}
                className='text-muted-foreground w-32 shrink-0 text-xs'
              >
                {key}
              </Label>
              <Input
                id={`var-color-${key}`}
                value={(variables.color as Record<string, string>)?.[key] ?? colors[key]}
                onChange={e => setColor(key, e.target.value)}
                className='h-7 font-mono text-xs'
              />
            </div>
          ))}
        </section>

        <section className='flex flex-col gap-2'>
          <div className='text-muted-foreground text-[10px] font-semibold uppercase tracking-widest'>Radius</div>
          {(Object.keys(radii) as Array<keyof typeof radii>)
            .filter(k => k !== 'full')
            .map(key => (
              <div
                key={key}
                className='flex items-center gap-3'
              >
                <Label
                  htmlFor={`var-rounded-${key}`}
                  className='text-muted-foreground w-32 shrink-0 text-xs'
                >
                  rounded.{key}
                </Label>
                <Input
                  id={`var-rounded-${key}`}
                  value={(variables.rounded as Record<string, string>)?.[key] ?? radii[key]}
                  onChange={e => setRounded(key, e.target.value)}
                  className='h-7 font-mono text-xs'
                />
              </div>
            ))}
        </section>

        <section className='flex flex-col gap-2'>
          <div className='text-muted-foreground text-[10px] font-semibold uppercase tracking-widest'>Spacing</div>
          <div className='flex items-center gap-3'>
            <Label
              htmlFor='var-spacing'
              className='text-muted-foreground w-32 shrink-0 text-xs'
            >
              base unit
            </Label>
            <Input
              id='var-spacing'
              value={(variables.spacing as string) ?? defaultMosaicVariables.spacing}
              onChange={e => setSpacing(e.target.value)}
              className='h-7 font-mono text-xs'
            />
          </div>
        </section>
      </div>
    </div>
  );
}
