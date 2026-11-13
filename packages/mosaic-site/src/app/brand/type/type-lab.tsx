'use client';

import { useEffect, useRef, useState } from 'react';

import { ThemeToggle } from '@/components/theme-toggle';

const groups: { name: string; roles: string[]; sample: string }[] = [
  {
    name: 'Heading',
    roles: ['heading-1', 'heading-2', 'heading-3', 'heading-4', 'heading-5', 'heading-6', 'subheading-1'],
    sample: 'The quick brown fox jumps over the lazy dog',
  },
  {
    name: 'Body',
    roles: ['body-1', 'body-2', 'body-3', 'body-4', 'body-5'],
    sample:
      'Sign-in, profiles, consent and agent experiences. Composable components made to be rearranged, restyled and replaced.',
  },
  {
    name: 'Label',
    roles: ['label-1', 'label-2', 'label-3', 'label-4', 'label-5'],
    sample: 'Manage account',
  },
  {
    name: 'Mono',
    roles: ['mono-1', 'mono-2', 'code-1', 'code-inline', 'tag-1', 'tag-2'],
    sample: 'npm install @clerk/ui',
  },
];

type Metrics = { family: string; size: string; lineHeight: string; weight: string; tracking: string };

function readMetrics(el: HTMLElement): Metrics {
  const cs = getComputedStyle(el);
  const px = (v: string) => `${Math.round(parseFloat(v) * 100) / 100}px`;
  return {
    family: cs.fontFamily
      .split(',')[0]
      .replace(/["']/g, '')
      .replace(/^__|_[0-9a-f]+$/g, ''),
    size: px(cs.fontSize),
    lineHeight: cs.lineHeight === 'normal' ? 'normal' : px(cs.lineHeight),
    weight: cs.fontWeight,
    tracking:
      cs.letterSpacing === 'normal' ? '0' : `${(parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize)).toFixed(3)}em`,
  };
}

function Specimen({ role, sample, showBoxes }: { role: string; sample: string; showBoxes: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const update = () => setMetrics(readMetrics(el));
    update();
    const id = window.setInterval(update, 1000);
    void document.fonts.ready.then(update);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className='grid gap-x-8 gap-y-2 border-t border-gray-950/10 py-6 md:grid-cols-[12rem_1fr] dark:border-white/10'>
      <div className='flex flex-col gap-1'>
        <code className='mono-2 text-gray-950 dark:text-white'>{role}</code>
        {metrics && (
          <dl className='mono-2 grid grid-cols-[auto_1fr] gap-x-3 text-gray-500'>
            <dt>font</dt>
            <dd>{metrics.family}</dd>
            <dt>size</dt>
            <dd>{metrics.size}</dd>
            <dt>leading</dt>
            <dd>{metrics.lineHeight}</dd>
            <dt>weight</dt>
            <dd>{metrics.weight}</dd>
            <dt>tracking</dt>
            <dd>{metrics.tracking}</dd>
          </dl>
        )}
      </div>
      <p
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        className={`${role} max-w-3xl text-gray-950 outline-none dark:text-white`}
        style={
          showBoxes
            ? {
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgb(108 71 255 / 0.12) 0 1lh, rgb(108 71 255 / 0.04) 1lh 2lh)',
              }
            : undefined
        }
      >
        {sample}
      </p>
    </div>
  );
}

const spacing = [1, 2, 3, 4, 6, 10];

function Spacing() {
  return (
    <div className='stack-2'>
      {spacing.map(n => (
        <div
          key={n}
          className='grid grid-cols-[8rem_1fr] items-center gap-4'
        >
          <code className='mono-2 text-gray-500'>
            stack-{n} · {n * 8}px
          </code>
          <div
            className='h-4 bg-purple-500/40'
            style={{ width: n * 8 }}
          />
        </div>
      ))}
    </div>
  );
}

function Pairing({ showBoxes }: { showBoxes: boolean }) {
  const box = showBoxes ? 'outline outline-1 outline-purple-500/30' : '';
  return (
    <div
      className='stack-10 max-w-2xl'
      style={
        showBoxes
          ? {
              backgroundImage:
                'repeating-linear-gradient(to bottom, rgb(108 71 255 / 0.18) 0 1px, transparent 1px 8px)',
            }
          : undefined
      }
    >
      <div className='stack-4'>
        <div className='heading-group'>
          <span className={`tag-1 text-gray-500 ${box}`}>Overview</span>
          <h2 className={`heading-1 text-gray-950 dark:text-white ${box}`}>
            Production-ready UI your agents can build with
          </h2>
          <p className={`body-2 text-gray-600 dark:text-gray-400 ${box}`}>The agent-native UI kit, powered by Clerk.</p>
        </div>
        <span className={`code-1 self-start rounded-lg bg-gray-950/5 px-3 py-2 dark:bg-white/10 ${box}`}>
          npx @clerk/mosaic init
        </span>
      </div>
      <div className='stack-3'>
        <div className='heading-group'>
          <h3 className={`heading-3 text-gray-950 dark:text-white ${box}`}>Profiles</h3>
          <p className={`body-2 text-gray-600 dark:text-gray-400 ${box}`}>
            A user profile built from sections, cards and dialogs. Swap any part without forking the rest. Each piece
            reads its own state, so restyling one never breaks another.
          </p>
        </div>
        <span className={`label-3 text-gray-950 dark:text-white ${box}`}>Read the docs →</span>
      </div>
      <div className='stack-3'>
        <h4 className={`heading-5 text-gray-950 dark:text-white ${box}`}>Security</h4>
        <div className='stack-2'>
          {['Chrome on macOS', 'Safari on iPhone'].map(device => (
            <div
              key={device}
              className='heading-group'
            >
              <span className={`heading-6 text-gray-950 dark:text-white ${box}`}>{device}</span>
              <span className={`body-3 text-gray-500 ${box}`}>Last active 2 minutes ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TypeLab() {
  const [showBoxes, setShowBoxes] = useState(false);

  return (
    <div className='mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <span className='tag-1 text-gray-500'>Temporary</span>
          <h1 className='heading-3 mt-2 text-gray-950 dark:text-white'>Type</h1>
        </div>
        <div className='flex items-center gap-4'>
          <label className='label-3 flex items-center gap-2 text-gray-600 dark:text-gray-400'>
            <input
              type='checkbox'
              checked={showBoxes}
              onChange={e => setShowBoxes(e.target.checked)}
            />
            Show 8px grid
          </label>
          <ThemeToggle />
        </div>
      </header>

      <section className='flex flex-col gap-6'>
        <h2 className='label-2 text-gray-500'>In context</h2>
        <Pairing showBoxes={showBoxes} />
      </section>

      <section className='flex flex-col gap-6'>
        <h2 className='label-2 text-gray-500'>Spacing</h2>
        <Spacing />
      </section>

      {groups.map(group => (
        <section key={group.name}>
          <h2 className='label-2 mb-2 text-gray-500'>{group.name}</h2>
          {group.roles.map(role => (
            <Specimen
              key={role}
              role={role}
              sample={group.sample}
              showBoxes={showBoxes}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
