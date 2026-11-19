'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  buildMotionCss,
  CLASSIC,
  type MotionConfig,
  PRESET_NOTES,
  PRESETS,
  springCurve,
  withPreset,
} from '@/lib/motion';
import * as CreateOrganization from '@/stories/create-organization.stories';
import * as CardDialog from '@/stories/dialog.component.stories';
import * as Reverification from '@/stories/reverification.stories';
import * as SignIn from '@/stories/sign-in.stories';
import * as TaskSetupMfa from '@/stories/task-setup-mfa.stories';
import * as UserProfile from '@/stories/user-profile.stories';

import { StoryMosaicProvider } from '../ChaosProvider';
import { MotionControls } from './MotionControls';
import { useHeightScale } from './useHeightScale';

const DEFAULT_PRESET = 'Option A';

const DEMOS = [
  { id: 'setup-mfa', label: 'Set up MFA', Demo: TaskSetupMfa.Default },
  { id: 'sign-in', label: 'Sign in', Demo: SignIn.Default },
  { id: 'create-organization', label: 'Create organization', Demo: CreateOrganization.Default },
  { id: 'reverification', label: 'Reverification', Demo: Reverification.Default },
  { id: 'dialog', label: 'Dialog (card)', Demo: CardDialog.CardSurface },
  { id: 'user-profile', label: 'User profile (overlay)', Demo: UserProfile.Overlay },
];

export function MotionPlayground() {
  const [config, setConfig] = React.useState<MotionConfig>(() => withPreset(DEFAULT_PRESET, CLASSIC));
  const [presetName, setPresetName] = React.useState<string>(DEFAULT_PRESET);
  const [demoId, setDemoId] = React.useState(DEMOS[0].id);
  const [copied, setCopied] = React.useState(false);

  const demo = DEMOS.find(entry => entry.id === demoId) ?? DEMOS[0];
  const css = React.useMemo(() => buildMotionCss(config), [config]);
  useHeightScale(config);

  const patch = (next: Partial<MotionConfig>) => {
    setConfig(previous => ({ ...previous, ...next }));
    setPresetName('Custom');
  };

  const applyPreset = (name: string) => {
    setConfig(previous => withPreset(name, previous));
    setPresetName(name);
  };

  const toggleSlow = () => patch({ slow: config.slow === 0.25 ? 1 : 0.25 });

  const values = JSON.stringify(
    {
      preset: presetName,
      ...config,
      ...(config.hMode === 'spring'
        ? (() => {
            const spring = springCurve(config.springDur, config.bounce);
            return { springSettleMs: spring.ms, springLinear: spring.css };
          })()
        : {}),
    },
    null,
    2,
  );

  const copy = () => {
    void navigator.clipboard.writeText(values).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className='flex flex-col lg:flex-row'>
      <style>{css}</style>
      <main className='flex min-w-0 flex-1 flex-col gap-5 p-6 lg:h-[calc(100svh-3rem)]'>
        <div>
          <h1 className='text-xl font-semibold'>Motion</h1>
          <p className='text-muted-foreground mt-1 max-w-2xl text-sm'>
            Tune the step-to-step morph of <code>Flow</code> and the open and close of <code>Dialog</code>. The demos
            are the real Mosaic views from their stories, and the sliders write override CSS against them. The dialog
            demos are modal, so close one with Escape before changing a slider.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-1.5'>
          <span className='text-muted-foreground mr-1 text-[11px] font-medium uppercase tracking-wide'>Preset</span>
          {Object.keys(PRESETS).map(name => (
            <Button
              key={name}
              size='sm'
              variant={presetName === name ? 'default' : 'outline'}
              onClick={() => applyPreset(name)}
            >
              {name}
            </Button>
          ))}
          <p className='text-muted-foreground basis-full text-xs'>
            {PRESET_NOTES[presetName] ?? 'Custom values. Copy them from the panel on the right.'}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-1.5'>
          <span className='text-muted-foreground mr-1 text-[11px] font-medium uppercase tracking-wide'>Demo</span>
          {DEMOS.map(entry => (
            <Button
              key={entry.id}
              size='sm'
              variant={demoId === entry.id ? 'default' : 'outline'}
              onClick={() => setDemoId(entry.id)}
            >
              {entry.label}
            </Button>
          ))}
          <Button
            size='sm'
            variant={config.slow === 0.25 ? 'default' : 'outline'}
            onClick={toggleSlow}
            className='ml-auto'
          >
            Slow-mo 0.25×
          </Button>
        </div>

        <StoryMosaicProvider>
          <div className='bg-muted/40 grid min-h-[24rem] flex-1 place-items-center overflow-y-auto rounded-xl border p-8'>
            <demo.Demo key={demo.id} />
          </div>
        </StoryMosaicProvider>
      </main>

      <aside className='bg-background lg:sticky lg:top-12 lg:h-[calc(100svh-3rem)] lg:w-[21rem] lg:shrink-0 lg:overflow-y-auto lg:border-l'>
        <div className='flex flex-col gap-5 p-4'>
          <MotionControls
            config={config}
            onChange={patch}
          />
          <section>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-muted-foreground text-[11px] font-medium uppercase tracking-wide'>Current values</h3>
              <Button
                size='xs'
                variant='outline'
                onClick={copy}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <pre className='bg-muted max-h-64 overflow-auto rounded-md p-2.5 text-[11px] leading-snug'>{values}</pre>
          </section>
          <details>
            <summary className='text-muted-foreground cursor-pointer text-[11px] font-medium uppercase tracking-wide'>
              Generated CSS
            </summary>
            <pre className='bg-muted mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md p-2.5 text-[11px] leading-snug'>
              {css}
            </pre>
          </details>
        </div>
      </aside>
    </div>
  );
}
