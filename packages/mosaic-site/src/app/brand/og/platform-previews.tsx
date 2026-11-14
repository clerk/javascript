'use client';
import * as React from 'react';

import { OG_VARIANTS, type OgOptions, type OgVariant } from './og-config';
import { OgFrame } from './og-frame';

export type LinkMeta = { title: string; description: string; domain: string };

const STILL: React.RefObject<number | null> = { current: 0 };
const [IMAGE, VIDEO] = OG_VARIANTS;

function Shot({
  variant,
  options,
  width,
  animated = false,
  className,
}: {
  variant: OgVariant;
  options: OgOptions;
  width: number;
  animated?: boolean;
  className?: string;
}) {
  const scale = width / variant.width;
  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{ width, height: variant.height * scale }}
    >
      <div
        className='origin-top-left'
        style={{ scale }}
      >
        <OgFrame
          variant={variant}
          options={options}
          phaseRef={animated ? undefined : STILL}
        />
      </div>
    </div>
  );
}

function Stage({
  name,
  note,
  dark,
  children,
}: {
  name: string;
  note: string;
  dark: boolean;
  children: React.ReactNode;
}) {
  return (
    <figure className='flex flex-col gap-2'>
      <div
        className='rounded-xl p-6'
        style={{ background: dark ? '#000' : '#fff', colorScheme: dark ? 'dark' : 'light' }}
      >
        {children}
      </div>
      <figcaption className='body-3 text-gray-500'>
        <span className='text-gray-950 dark:text-white'>{name}</span> · {note}
      </figcaption>
    </figure>
  );
}

function X({ options, meta }: { options: OgOptions; meta: LinkMeta }) {
  return (
    <Stage
      name='X'
      note='Large image card. Title is hidden, domain sits on the image.'
      dark
    >
      <div
        className='font-[system-ui] text-[15px]'
        style={{ width: 506 }}
      >
        <div className='relative overflow-hidden rounded-2xl border border-[#2f3336]'>
          <Shot
            variant={IMAGE}
            options={options}
            width={504}
          />
          <span className='absolute bottom-3 left-3 rounded px-1 text-[13px] leading-5 text-white [background:rgb(0_0_0/0.77)]'>
            {meta.domain}
          </span>
        </div>
        <p className='mt-1 text-[13px] text-[#71767b]'>From {meta.domain}</p>
      </div>
    </Stage>
  );
}

function Discord({ options, meta, video }: { options: OgOptions; meta: LinkMeta; video: boolean }) {
  return (
    <Stage
      name={video ? 'Discord · video' : 'Discord'}
      note={video ? 'Plays og:video inline after a click.' : 'Embed with the theme color bar.'}
      dark
    >
      <div
        className='rounded-lg p-4 font-[system-ui]'
        style={{ background: '#313338', width: 480 }}
      >
        <div
          className='rounded border-l-4 py-2 pl-3 pr-4'
          style={{ background: '#2b2d31', borderColor: '#9c83fd', maxWidth: 432 }}
        >
          <p className='text-xs text-[#dbdee1]'>{meta.domain}</p>
          <p className='mt-1 text-base font-semibold text-[#00a8fc]'>{meta.title}</p>
          <p className='mt-1 text-sm leading-[1.125rem] text-[#dbdee1]'>{meta.description}</p>
          <div className='relative mt-4 overflow-hidden rounded'>
            <Shot
              variant={video ? VIDEO : IMAGE}
              options={options}
              width={400}
              animated={video}
            />
          </div>
        </div>
      </div>
    </Stage>
  );
}

function Slack({ options, meta }: { options: OgOptions; meta: LinkMeta }) {
  return (
    <Stage
      name='Slack'
      note='Unfurl under the message. Image is capped at 360px wide.'
      dark={false}
    >
      <div
        className='flex gap-3 font-[system-ui] text-[15px] text-[#1d1c1d]'
        style={{ width: 480 }}
      >
        <span className='w-1 shrink-0 rounded bg-[#dddddd]' />
        <div className='min-w-0'>
          <p className='font-bold'>{meta.domain}</p>
          <p className='font-bold text-[#1264a3]'>{meta.title}</p>
          <p className='leading-snug'>{meta.description}</p>
          <div className='mt-2 w-fit overflow-hidden rounded-lg border border-black/10'>
            <Shot
              variant={IMAGE}
              options={options}
              width={360}
            />
          </div>
        </div>
      </div>
    </Stage>
  );
}

function IMessage({ options, meta }: { options: OgOptions; meta: LinkMeta }) {
  return (
    <Stage
      name='iMessage'
      note='Rich link bubble. Title and domain sit under the image.'
      dark={false}
    >
      <div
        className='overflow-hidden rounded-[18px] font-[system-ui]'
        style={{ width: 280, background: '#e9e9eb' }}
      >
        <Shot
          variant={IMAGE}
          options={options}
          width={280}
        />
        <div className='px-3 py-2'>
          <p className='line-clamp-2 text-[13px] font-semibold leading-4 text-black'>{meta.title}</p>
          <p className='text-xs text-[#8e8e93]'>{meta.domain}</p>
        </div>
      </div>
    </Stage>
  );
}

function LinkedIn({ options, meta }: { options: OgOptions; meta: LinkMeta }) {
  return (
    <Stage
      name='LinkedIn'
      note='Full-width image in the feed, title below.'
      dark={false}
    >
      <div
        className='overflow-hidden rounded-lg border border-black/10 font-[system-ui]'
        style={{ width: 552 }}
      >
        <Shot
          variant={IMAGE}
          options={options}
          width={552}
        />
        <div className='bg-[#eef3f8] px-3 py-2'>
          <p className='text-sm font-semibold text-black/90'>{meta.title}</p>
          <p className='text-xs text-black/60'>{meta.domain}</p>
        </div>
      </div>
    </Stage>
  );
}

function WhatsApp({ options, meta }: { options: OgOptions; meta: LinkMeta }) {
  return (
    <Stage
      name='WhatsApp'
      note='Large preview inside the outgoing bubble.'
      dark
    >
      <div
        className='rounded-lg p-1 font-[system-ui]'
        style={{ width: 330, background: '#005c4b' }}
      >
        <div className='overflow-hidden rounded-md bg-black/20'>
          <Shot
            variant={IMAGE}
            options={options}
            width={322}
          />
          <div className='px-2 py-1.5'>
            <p className='text-sm font-semibold text-[#e9edef]'>{meta.title}</p>
            <p className='line-clamp-2 text-xs text-[#e9edef]/70'>{meta.description}</p>
            <p className='mt-0.5 text-xs text-[#e9edef]/50'>{meta.domain}</p>
          </div>
        </div>
        <p className='px-1.5 py-1 text-sm text-[#e9edef]'>https://{meta.domain}</p>
      </div>
    </Stage>
  );
}

export function PlatformPreviews({ options, meta }: { options: OgOptions; meta: LinkMeta }) {
  return (
    <div className='flex flex-wrap items-start gap-8'>
      <X
        options={options}
        meta={meta}
      />
      <Discord
        options={options}
        meta={meta}
        video={false}
      />
      <Discord
        options={options}
        meta={meta}
        video
      />
      <Slack
        options={options}
        meta={meta}
      />
      <IMessage
        options={options}
        meta={meta}
      />
      <LinkedIn
        options={options}
        meta={meta}
      />
      <WhatsApp
        options={options}
        meta={meta}
      />
    </div>
  );
}
