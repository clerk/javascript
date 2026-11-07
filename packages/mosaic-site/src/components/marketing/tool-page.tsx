'use client';
import * as React from 'react';

import { Chip, LabShell, PanelLabel, SliderField, TextField } from '@/components/marketing/lab-ui';
import { ToolCanvas } from '@/components/marketing/tool-canvas';
import { useMode } from '@/components/use-mode';
import type { ToolSettings } from '@/lib/mosaic-tools/canvas';
import { getToolMeta } from '@/lib/mosaic-tools/meta';
import { TOOLS } from '@/lib/mosaic-tools/registry';
export function ToolPage({ slug }: { slug: string }) {
  const definition = TOOLS[slug];
  const meta = getToolMeta(slug) ?? { title: slug, description: '' };
  const mode = useMode();
  const [overrides, setOverrides] = React.useState<ToolSettings>({});
  const settings = React.useMemo(
    (): ToolSettings => ({
      ...definition.defaults,
      ...('theme' in definition.defaults ? { theme: mode } : {}),
      ...overrides,
    }),
    [definition, mode, overrides],
  );
  const [copied, setCopied] = React.useState(false);
  const patch = (key: string, value: string | number | boolean) =>
    setOverrides(current => ({ ...current, [key]: value }));
  const copy = () => {
    void navigator.clipboard.writeText(JSON.stringify(settings, null, 2)).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };
  const toggles = definition.controls.filter(c => c.type === 'toggle');
  return (
    <LabShell
      title={meta.title}
      stage={
        <>
          <ToolCanvas
            slug={slug}
            settings={settings}
            className='min-h-0 flex-1'
          />
          <p className='pb-6 text-center text-sm text-neutral-500'>Move your cursor over the stage to try it.</p>
        </>
      }
      panel={
        <>
          <p className='text-sm leading-5 text-neutral-600 dark:text-neutral-400'>{meta.description}</p>

          {definition.controls.map(control => {
            switch (control.type) {
              case 'chips':
                return (
                  <div
                    key={control.key}
                    className='flex flex-col gap-3'
                  >
                    <PanelLabel>{control.label}</PanelLabel>
                    <div className='flex flex-wrap gap-2'>
                      {control.options.map(option => (
                        <Chip
                          key={option.value}
                          active={settings[control.key] === option.value}
                          onClick={() => patch(control.key, option.value)}
                        >
                          {option.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                );
              case 'slider':
                return (
                  <SliderField
                    key={control.key}
                    label={control.label}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={settings[control.key] as number}
                    onChange={value => patch(control.key, value)}
                  />
                );
              case 'text':
                return (
                  <TextField
                    key={control.key}
                    label={control.label}
                    value={settings[control.key] as string}
                    onChange={value => patch(control.key, value)}
                  />
                );
              default:
                return null;
            }
          })}

          {toggles.length > 0 && (
            <div className='flex flex-col gap-3'>
              <PanelLabel>Options</PanelLabel>
              <div className='flex flex-wrap gap-2'>
                {toggles.map(control => (
                  <Chip
                    key={control.key}
                    active={Boolean(settings[control.key])}
                    onClick={() => patch(control.key, !settings[control.key])}
                  >
                    {control.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div className='mt-auto flex gap-2'>
            <button
              type='button'
              onClick={copy}
              className='bg-foreground text-background flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02]'
            >
              {copied ? 'Copied' : 'Copy settings'}
            </button>
            <button
              type='button'
              onClick={() => setOverrides({})}
              className='border-foreground/15 hover:border-foreground/40 rounded-lg border px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300'
            >
              Reset
            </button>
          </div>
        </>
      }
    />
  );
}
