'use client';

import { CircleHelpIcon } from 'lucide-react';
import * as React from 'react';

import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CONTROL_GROUPS, type MotionConfig, type MotionControl } from '@/lib/motion';

interface MotionControlsProps {
  config: MotionConfig;
  onChange: (patch: Partial<MotionConfig>) => void;
}

function Label({ control }: { control: MotionControl }) {
  return (
    <span className='flex items-center gap-1'>
      <label
        htmlFor={`motion-${control.key}`}
        className='text-xs'
      >
        {control.label}
      </label>
      {'hint' in control && control.hint ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type='button'
                aria-label={`About ${control.label}`}
                className='text-muted-foreground hover:text-foreground shrink-0'
              >
                <CircleHelpIcon className='size-3' />
              </button>
            }
          />
          <TooltipContent
            side='left'
            className='max-w-64 text-xs'
          >
            {control.hint}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </span>
  );
}

const selectClass = 'border-input bg-background col-span-2 h-7 rounded-md border px-1.5 text-xs';

function Control({ control, config, onChange }: MotionControlsProps & { control: MotionControl }) {
  const value = config[control.key];

  if (control.kind === 'check') {
    return (
      <div className='col-span-3 flex items-center justify-between'>
        <Label control={control} />
        <Switch
          id={`motion-${control.key}`}
          size='sm'
          checked={value === true}
          onCheckedChange={checked => onChange({ [control.key]: checked })}
        />
      </div>
    );
  }

  if (control.kind === 'select') {
    return (
      <>
        <Label control={control} />
        <select
          id={`motion-${control.key}`}
          className={selectClass}
          value={String(value)}
          onChange={event => {
            const next = event.target.value;
            onChange({ [control.key]: control.key === 'slow' ? Number(next) : next });
          }}
        >
          {control.options.map(option => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </>
    );
  }

  return (
    <>
      <Label control={control} />
      <input
        id={`motion-${control.key}`}
        type='range'
        className='accent-brand w-full'
        min={control.min}
        max={control.max}
        step={control.step}
        value={Number(value)}
        onChange={event => onChange({ [control.key]: Number(event.target.value) })}
      />
      <output className='text-muted-foreground text-right text-xs tabular-nums'>
        {Number(value)}
        {control.unit}
      </output>
    </>
  );
}

export function MotionControls({ config, onChange }: MotionControlsProps) {
  return (
    <div className='flex flex-col gap-5'>
      {CONTROL_GROUPS.map(group => (
        <section key={group.title}>
          <h3 className='text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-wide'>{group.title}</h3>
          <div className='grid grid-cols-[7rem_1fr_3rem] items-center gap-x-2 gap-y-1.5'>
            {group.controls
              .filter(control => !('when' in control && control.when) || control.when(config))
              .map(control => (
                <Control
                  key={control.key}
                  control={control}
                  config={config}
                  onChange={onChange}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
