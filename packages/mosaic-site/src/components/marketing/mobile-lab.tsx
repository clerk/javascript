'use client';
import * as React from 'react';

import { type LabMessage, MOBILE_DEFAULTS, Panel, type Settings } from '@/components/marketing/mosaic-scene';

const FRAME = { width: 390, height: 844 };

export function MobileLab() {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [settings, setSettings] = React.useState<Settings>(MOBILE_DEFAULTS);
  const [target, setTarget] = React.useState<'desktop' | 'mobile'>('mobile');
  const [bakeStatus, setBakeStatus] = React.useState('');
  const [dark, setDark] = React.useState<boolean | null>(null);

  const applyMode = React.useCallback((next: boolean) => {
    setDark(next);
    frameRef.current?.contentDocument?.documentElement.classList.toggle('dark', next);
  }, []);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent<LabMessage>) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) {
        return;
      }
      if (event.data.type === 'mosaic-lab:state') {
        if (dark !== null) {
          frameRef.current?.contentDocument?.documentElement.classList.toggle('dark', dark);
        }
        setSettings(event.data.settings);
        setTarget(event.data.target);
        setBakeStatus(event.data.bakeStatus);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [dark]);

  const send = React.useCallback((message: LabMessage) => {
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  const change = React.useCallback(
    (next: Settings) => {
      setSettings(next);
      send({ type: 'mosaic-lab:set', settings: next });
    },
    [send],
  );

  return (
    <main className='flex min-h-svh items-start gap-8 bg-gray-100 p-8 pr-[22rem] dark:bg-gray-950'>
      <div className='flex shrink-0 flex-col gap-3'>
        <div className='flex gap-1 self-start rounded-lg border border-neutral-300 bg-white p-1 text-xs dark:border-neutral-700 dark:bg-neutral-900'>
          {(['Light', 'Dark'] as const).map(label => (
            <button
              key={label}
              type='button'
              aria-pressed={dark === (label === 'Dark')}
              className='rounded-md px-3 py-1 aria-pressed:bg-neutral-900 aria-pressed:text-white dark:aria-pressed:bg-white dark:aria-pressed:text-neutral-900'
              onClick={() => applyMode(label === 'Dark')}
            >
              {label}
            </button>
          ))}
        </div>
        <iframe
          ref={frameRef}
          title='Mobile hero'
          src='/brand/home-hero?frame=1'
          className='shrink-0 rounded-[2.5rem] border-8 border-neutral-900 bg-white shadow-xl'
          style={{ width: FRAME.width + 16, height: FRAME.height + 16 }}
        />
      </div>
      <Panel
        settings={settings}
        onChange={change}
        onBake={() => send({ type: 'mosaic-lab:bake' })}
        bakeStatus={target === 'mobile' ? bakeStatus : 'The frame is not at a phone width.'}
        defaults={MOBILE_DEFAULTS}
        target={target}
      />
    </main>
  );
}
