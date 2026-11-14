'use client';
import * as React from 'react';

import { OG_DEFAULTS, OG_VARIANTS, type OgOptions, type OgVariant } from './og-config';
import { OgFrame } from './og-frame';
import { type LinkMeta, PlatformPreviews } from './platform-previews';

const PREVIEW_WIDTH = 560;

function captureUrl(variant: OgVariant, options: OgOptions) {
  const params = new URLSearchParams({
    variant: variant.id,
    caption: options.caption,
    loop: String(options.loopSeconds),
    steps: String(options.swaySteps),
    gain: String(options.swayGain),
    ripple: String(options.ripple),
    beta: options.beta ? '1' : '0',
  });
  return `/brand/og/frame?${params}`;
}

function Preview({ variant, options }: { variant: OgVariant; options: OgOptions }) {
  const scale = Math.min(1, PREVIEW_WIDTH / variant.width);
  return (
    <div
      className='overflow-hidden rounded-lg ring-1 ring-gray-950/10 dark:ring-white/10'
      style={{ width: variant.width * scale, height: variant.height * scale }}
    >
      <div
        className='origin-top-left'
        style={{ scale }}
      >
        <OgFrame
          variant={variant}
          options={options}
        />
      </div>
    </div>
  );
}

export function OgLab({ meta }: { meta: LinkMeta }) {
  const [options, setOptions] = React.useState<OgOptions>(OG_DEFAULTS);
  const update = <K extends keyof OgOptions>(key: K, value: OgOptions[K]) =>
    setOptions(current => ({ ...current, [key]: value }));
  return (
    <main className='px-6 py-16'>
      <p className='label-3 text-gray-500'>Brand</p>
      <h1 className='heading-3 mt-2 text-gray-950 dark:text-white'>OG images</h1>
      <p className='body-2 mt-2 max-w-2xl text-gray-600 dark:text-gray-400'>
        Each size renders the live hero scene. The light sway loops every {options.loopSeconds}s, which is the length of
        the exported video. Export with <code>node scripts/og-export.mjs</code> while the dev server is running.
      </p>
      <div className='body-3 mt-8 flex flex-wrap items-end gap-6 text-gray-600 dark:text-gray-400'>
        <label className='flex flex-col gap-1'>
          Caption
          <input
            value={options.caption}
            placeholder='None'
            onChange={event => update('caption', event.target.value)}
            className='w-80 rounded-md bg-gray-100 px-2 py-1 text-gray-950 dark:bg-gray-800 dark:text-white'
          />
        </label>
        <label className='flex flex-col gap-1'>
          Loop ({options.loopSeconds}s)
          <input
            type='range'
            min={8}
            max={30}
            step={1}
            value={options.loopSeconds}
            onChange={event => update('loopSeconds', Number(event.target.value))}
          />
        </label>
        <label className='flex flex-col gap-1'>
          Sway turns per loop ({options.swaySteps})
          <input
            type='range'
            min={1}
            max={10}
            step={1}
            value={options.swaySteps}
            onChange={event => update('swaySteps', Number(event.target.value))}
          />
        </label>
        <label className='flex flex-col gap-1'>
          Sway strength ({options.swayGain}×)
          <input
            type='range'
            min={0}
            max={5}
            step={0.25}
            value={options.swayGain}
            onChange={event => update('swayGain', Number(event.target.value))}
          />
        </label>
        <label className='flex flex-col gap-1'>
          Wave strength ({options.ripple})
          <input
            type='range'
            min={0}
            max={1}
            step={0.05}
            value={options.ripple}
            onChange={event => update('ripple', Number(event.target.value))}
          />
        </label>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={options.beta}
            onChange={event => update('beta', event.target.checked)}
          />
          Beta badge
        </label>
      </div>
      <section className='mt-12'>
        <h2 className='label-2 text-gray-950 dark:text-white'>On each platform</h2>
        <p className='body-3 mt-1 text-gray-500'>
          Static cards show the first frame, which is what the exported PNG holds. Only Discord plays the video.
        </p>
        <div className='mt-4'>
          <PlatformPreviews
            options={options}
            meta={meta}
          />
        </div>
      </section>
      <div className='mt-16 flex flex-col gap-14'>
        {OG_VARIANTS.map(variant => (
          <section key={variant.id}>
            <h2 className='label-2 text-gray-950 dark:text-white'>
              {variant.label} · {variant.width}×{variant.height}
            </h2>
            <p className='body-3 mt-1 text-gray-500'>{variant.platforms}</p>
            <div className='mt-4 flex flex-col gap-2'>
              <Preview
                variant={variant}
                options={options}
              />
              <a
                href={captureUrl(variant, options)}
                target='_blank'
                rel='noreferrer'
                className='body-3 text-gray-500 underline-offset-4 hover:underline'
              >
                Open at full size
              </a>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
