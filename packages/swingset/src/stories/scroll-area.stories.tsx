import { Badge } from '@clerk/mosaic/components/badge';
import { Button } from '@clerk/mosaic/components/button';
import { scrollAreaRoot, scrollAreaViewport } from '@clerk/mosaic/components/scroll-area';
import { colorVars, fontFamilyVars, radiusVars, space, typeScaleVars } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import * as React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './scroll-area.stories?raw';

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  row: {
    paddingBlock: space['2'],
    paddingInline: space['3'],
    borderBottomColor: colorVars['--cl-color-border-subtle'],
    borderBottomStyle: 'solid',
    borderBottomWidth: { default: '1px', ':last-child': 0 },
    gap: space['3'],
    color: colorVars['--cl-color-foreground'],
    display: 'flex',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    justifyContent: 'space-between',
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  offset: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontVariantNumeric: 'tabular-nums',
  },
  noMask: {
    maskImage: 'none',
  },
  strip: {
    display: 'flex',
    gap: space['2'],
    padding: space['3'],
  },
  chip: {
    flexShrink: 0,
  },
});

export const meta: StoryMeta = {
  group: 'Styles',
  title: 'Scroll Area',
  status: 'stable',
  source: 'packages/mosaic/src/components/scroll-area/scroll-area.styles.ts',
};

const timeZones = [
  { city: 'Honolulu', offset: 'UTC−10:00' },
  { city: 'Anchorage', offset: 'UTC−09:00' },
  { city: 'Los Angeles', offset: 'UTC−08:00' },
  { city: 'Denver', offset: 'UTC−07:00' },
  { city: 'Chicago', offset: 'UTC−06:00' },
  { city: 'New York', offset: 'UTC−05:00' },
  { city: 'São Paulo', offset: 'UTC−03:00' },
  { city: 'London', offset: 'UTC+00:00' },
  { city: 'Lagos', offset: 'UTC+01:00' },
  { city: 'Berlin', offset: 'UTC+01:00' },
  { city: 'Cairo', offset: 'UTC+02:00' },
  { city: 'Moscow', offset: 'UTC+03:00' },
  { city: 'Dubai', offset: 'UTC+04:00' },
  { city: 'Mumbai', offset: 'UTC+05:30' },
  { city: 'Bangkok', offset: 'UTC+07:00' },
  { city: 'Singapore', offset: 'UTC+08:00' },
  { city: 'Tokyo', offset: 'UTC+09:00' },
  { city: 'Sydney', offset: 'UTC+10:00' },
  { city: 'Auckland', offset: 'UTC+12:00' },
];

interface TimeZoneListProps {
  zones: typeof timeZones;
  viewport: ReturnType<typeof stylex.props>;
  label?: string;
}

function TimeZoneList({ zones, viewport, label = 'Time zones' }: TimeZoneListProps) {
  return (
    <div
      role='region'
      aria-label={label}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Safari does not focus an overflowing scroll container on its own, and the list holds nothing focusable.
      tabIndex={0}
      {...viewport}
    >
      <ul {...stylex.props(styles.list)}>
        {zones.map(zone => (
          <li
            key={zone.city}
            {...stylex.props(styles.row)}
          >
            <span>{zone.city}</span>
            <span {...stylex.props(styles.offset)}>{zone.offset}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The border is on the ROOT, not the viewport: a mask applies to the element's whole rendering,
 * borders included, so a border on the viewport would fade out at the same edges its content does.
 */
export function Default() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-sm'] }}
    >
      <TimeZoneList
        zones={timeZones}
        viewport={stylex.props(scrollAreaViewport())}
      />
    </div>
  );
}

/** The same atoms on a surface whose content fits. Nothing in the markup is conditional. */
export function NotScrollable() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      style={{ height: 260, borderRadius: radiusVars['--cl-radius-sm'] }}
    >
      <TimeZoneList
        zones={timeZones.slice(0, 3)}
        viewport={stylex.props(scrollAreaViewport())}
      />
    </div>
  );
}

/**
 * Toggling the row count is the whole demonstration: `auto` jumps its content left by the lane's
 * width as the list starts overflowing, `stable` does not move.
 */
export function Gutter() {
  const [scrollable, setScrollable] = React.useState(false);
  const root = stylex.props(scrollAreaRoot);
  const zones = scrollable ? timeZones.slice(0, 6) : timeZones.slice(0, 2);

  return (
    <div className='flex w-full flex-col items-start gap-4'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => setScrollable(value => !value)}
      >
        {scrollable ? 'Remove rows' : 'Add rows'}
      </Button>

      <div className='flex w-full gap-4'>
        {(['stable', 'auto'] as const).map(gutter => (
          <div
            key={gutter}
            className='min-w-0 flex-1'
          >
            <p className='text-muted-foreground mb-2 font-mono text-xs'>{gutter}</p>
            <div
              {...root}
              className={`${root.className} border-border border`}
              style={{ height: 140, borderRadius: radiusVars['--cl-radius-sm'] }}
            >
              <TimeZoneList
                zones={zones}
                viewport={stylex.props(scrollAreaViewport(gutter))}
                label={`Time zones, ${gutter} gutter`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const teamMembers = [
  'Clerk',
  'Acme Corporation',
  'Globex',
  'Initech',
  'Umbrella Health',
  'DesignCloud',
  'Stark Industries',
  'Wayne Enterprises',
  'Cyberdyne Systems',
  'Soylent Industries',
  'Tyrell Corporation',
  'Weyland-Yutani',
  'Massive Dynamic',
  'Aperture Science',
  'Black Mesa',
  'Oscorp',
];

/**
 * The same atoms turned sideways: `inline` scrolls horizontally, fades the left and right edges,
 * and keeps the scrollbar lane along the bottom clear of the mask.
 */
export function Horizontal() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      style={{ borderRadius: radiusVars['--cl-radius-sm'] }}
    >
      <div
        role='region'
        aria-label='Team members'
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Safari does not focus an overflowing scroll container on its own, and the strip holds nothing focusable.
        tabIndex={0}
        {...stylex.props(...scrollAreaViewport('auto', 'inline'), styles.strip)}
      >
        {teamMembers.map(name => (
          <Badge
            key={name}
            color='neutral'
            xstyle={styles.chip}
          >
            {name}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Taking `--cl-scrollbar-thumb-idle` to zero alpha removes the bar entirely until the pointer
 * reaches the region. `oklch(from … / 0)` rather than `transparent`, which is transparent BLACK and
 * drags the fade through dark greys.
 */
export function HoverReveal() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <div
      {...root}
      className={`${root.className} border-border w-full border`}
      style={{
        height: 260,
        borderRadius: radiusVars['--cl-radius-sm'],
        '--cl-scrollbar-thumb-idle': 'oklch(from var(--cl-scrollbar-thumb) l c h / 0)',
      }}
    >
      <TimeZoneList
        zones={timeZones}
        viewport={stylex.props(scrollAreaViewport())}
      />
    </div>
  );
}

/**
 * A colour per state, deliberately louder than anything you'd ship. Only amber → teal animates:
 * it is a change on the SCROLLER, which owns the transition. The duration is stretched well past
 * Mosaic's own `base` step purely so that one step is impossible to miss.
 */
export function ThemedScrollbar() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <>
      {/* Both halves of the amber → teal pair live here: an inline base value would outrank the
          hover rule, since inline styles beat any stylesheet selector. */}
      <style>{`
        .demo-themed-scrollbar { --cl-scrollbar-thumb: oklch(0.77 0.16 70); }
        .demo-themed-scrollbar:hover { --cl-scrollbar-thumb: oklch(0.72 0.15 195); }
      `}</style>
      <div
        {...root}
        className={`${root.className} demo-themed-scrollbar border-border w-full border`}
        style={{
          height: 260,
          borderRadius: radiusVars['--cl-radius-sm'],
          '--cl-scrollbar-width': '14px',
          '--cl-scrollbar-thumb-inset': '4px',
          '--cl-duration-base': '0.6s',
          '--cl-scrollbar-thumb-hover': 'oklch(0.65 0.24 15)',
          '--cl-scrollbar-thumb-active': 'oklch(0.55 0.25 295)',
        }}
      >
        <TimeZoneList
          zones={timeZones}
          viewport={stylex.props(scrollAreaViewport())}
        />
      </div>
    </>
  );
}

/**
 * The mask retired for overlay scrims, each reading the progress var for its edge. The scrim mixes
 * from `--cl-color-foreground`, so it reads as a shadow on light and a glow on dark;
 * hardcoded black would vanish on a dark surface. `overflow: hidden` on the root keeps the scrims
 * inside its rounded corners.
 *
 * Each scrim slides in from behind its edge as well as fading, so the two vars drive position and
 * opacity together. `overflow: hidden` on the root both rounds their corners and hides the
 * offscreen half.
 *
 * `mask-image` is retired inline rather than from the stylesheet: swingset's dev server injects
 * StyleX atoms with a specificity bump no selector of ours can outrank. The extracted production
 * sheet puts them in a cascade layer, where the plain CSS below would win on its own.
 */
export function ShadowIndicators() {
  const root = stylex.props(scrollAreaRoot);

  return (
    <>
      <style>{`
        .demo-scroll-shadows [role='region']::before,
        .demo-scroll-shadows [role='region']::after {
          content: '';
          position: absolute;
          inset-inline: 0;
          height: var(--cl-scroll-fade-size);
          pointer-events: none;
        }
        .demo-scroll-shadows [role='region']::before {
          top: 0;
          background: linear-gradient(to bottom, color-mix(in oklab, var(--cl-color-foreground) 22%, transparent), transparent);
          opacity: var(--cl-scroll-area-progress-start);
          transform: translateY(calc((var(--cl-scroll-area-progress-start) - 1) * var(--cl-scroll-fade-size)));
        }
        .demo-scroll-shadows [role='region']::after {
          bottom: 0;
          background: linear-gradient(to top, color-mix(in oklab, var(--cl-color-foreground) 22%, transparent), transparent);
          opacity: var(--cl-scroll-area-progress-end);
          transform: translateY(calc((1 - var(--cl-scroll-area-progress-end)) * var(--cl-scroll-fade-size)));
        }
      `}</style>
      <div
        {...root}
        className={`${root.className} demo-scroll-shadows border-border w-full overflow-hidden border`}
        style={{ height: 260, borderRadius: radiusVars['--cl-radius-sm'] }}
      >
        <TimeZoneList
          zones={timeZones}
          viewport={stylex.props(scrollAreaViewport(), styles.noMask)}
        />
      </div>
    </>
  );
}
