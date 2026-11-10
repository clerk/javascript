'use client';
import * as React from 'react';

import { usePalette } from '@/components/marketing/tile-settings';
import { type Stagger, TileWall } from '@/components/marketing/tile-wall';
import { MARK_PIECES, MARK_VIEWBOX } from '@/lib/brand/mark';
import { type GlyphId, GLYPHS } from '@/lib/brand/product-glyphs';
import { LOGO_PARTS, LOGO_SIZE } from '@/lib/mosaic-logo/clerk-logo';

const SIZE = 200;
const EDGES = [
  { x: 100, y: 0 },
  { x: 100, y: SIZE },
  { x: 0, y: 100 },
  { x: SIZE, y: 100 },
];
const CELLS = Array.from({ length: 16 }, (_, index) => ({ column: index % 4, row: Math.floor(index / 4) }));
const DISCS = [
  { x: 50, y: 50, star: true },
  { x: 150, y: 50, star: false },
  { x: 50, y: 150, star: false },
  { x: 150, y: 150, star: true },
];
const STAR = [
  [44, 0],
  [-44, 0],
  [0, 44],
  [0, -44],
];

const diamond = (x: number, y: number, radius: number) =>
  `${x},${y - radius} ${x + radius},${y} ${x},${y + radius} ${x - radius},${y}`;

const MARK_SCALE = 124 / LOGO_SIZE;
const KEYHOLE = 'M100 78m-20 0a20 20 0 1 0 40 0a20 20 0 1 0-40 0ZM90 92H110L118 142H82Z';
const SHIELD = 'M100 22L164 46V100C164 138 136 166 100 182C64 166 36 138 36 100V46Z';
const SHIELD_INNER = 'M100 38L150 56V100C150 130 128 153 100 166C72 153 50 130 50 100V56Z';
const FRAME_CORNERS = [
  [0, 0],
  [SIZE, 0],
  [0, SIZE],
  [SIZE, SIZE],
];

function Frame() {
  const p = usePalette();
  return (
    <>
      {FRAME_CORNERS.map(([x, y]) => (
        <circle
          key={`${x},${y}`}
          cx={x}
          cy={y}
          r={46}
          fill={p.ring}
        />
      ))}
      {EDGES.map(edge => (
        <polygon
          key={`${edge.x},${edge.y}`}
          points={diamond(edge.x, edge.y, 22)}
          fill={p.deep}
        />
      ))}
    </>
  );
}

function ClerkMark() {
  const p = usePalette();
  const offset = 100 - (LOGO_SIZE * MARK_SCALE) / 2;
  return (
    <>
      <Frame />
      <circle
        cx={100}
        cy={100}
        r={78}
        fill={p.ring}
        fillOpacity={0.45}
      />
      <g transform={`translate(${offset} ${offset}) scale(${MARK_SCALE})`}>
        {LOGO_PARTS.map(part => (
          <path
            key={part.id}
            d={part.d}
            fill={{ arc: p.soft, base: p.brand, dot: p.deep }[part.id]}
          />
        ))}
      </g>
    </>
  );
}

function MosaicMark() {
  const p = usePalette();
  const [, , width, height] = MARK_VIEWBOX.split(' ').map(Number);
  const scale = 118 / width;
  return (
    <>
      <Frame />
      <circle
        cx={100}
        cy={100}
        r={78}
        fill={p.brand}
      />
      <circle
        cx={100}
        cy={100}
        r={66}
        fill='none'
        stroke={p.soft}
        strokeWidth={3}
      />
      <g
        transform={`translate(${100 - (width * scale) / 2 + 2 * scale} ${100 - (height * scale) / 2 + 2 * scale}) scale(${scale})`}
      >
        {MARK_PIECES.map(d => (
          <path
            key={d}
            d={d}
            fill={p.glyph}
          />
        ))}
      </g>
    </>
  );
}

function Keyhole() {
  const p = usePalette();
  return (
    <>
      <Frame />
      <circle
        cx={100}
        cy={100}
        r={78}
        fill={p.brand}
      />
      <circle
        cx={100}
        cy={100}
        r={66}
        fill='none'
        stroke={p.soft}
        strokeWidth={3}
      />
      <path
        d={KEYHOLE}
        fill={p.glyph}
        fillRule='evenodd'
      />
    </>
  );
}

function Shield() {
  const p = usePalette();
  return (
    <>
      <Frame />
      <path
        d={SHIELD}
        fill={p.brand}
      />
      <path
        d={SHIELD_INNER}
        fill={p.soft}
      />
      <path
        d={KEYHOLE}
        fill={p.glyph}
        fillRule='evenodd'
        transform='translate(100 100) scale(0.82) translate(-100 -100)'
      />
    </>
  );
}

function Glyph({ glyph }: { glyph: GlyphId }) {
  const p = usePalette();
  const { size, parts } = GLYPHS[glyph];
  const scale = (glyph === 'organizations' ? 112 : 100) / Math.max(size[0], size[1]);
  const x = 100 - (size[0] * scale) / 2;
  const y = 100 - (size[1] * scale) / 2;
  return (
    <>
      <Frame />
      <circle
        cx={100}
        cy={100}
        r={78}
        fill={p.brand}
      />
      <circle
        cx={100}
        cy={100}
        r={66}
        fill='none'
        stroke={p.soft}
        strokeWidth={3}
      />
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {parts.map(part => (
          <path
            key={part.d}
            d={part.d}
            fill={part.role === 'stroke' ? 'none' : part.role === 'accent' ? p.ring : p.glyph}
            stroke={part.role === 'stroke' ? p.ring : undefined}
            strokeWidth={part.role === 'stroke' ? 2 : undefined}
            strokeLinecap='round'
          />
        ))}
      </g>
    </>
  );
}

function UserBadge({ id }: { id: string }) {
  const p = usePalette();
  return (
    <>
      <Frame />
      <defs>
        <clipPath id={`${id}-user`}>
          <circle
            cx={100}
            cy={100}
            r={78}
          />
        </clipPath>
      </defs>
      <circle
        cx={100}
        cy={100}
        r={78}
        fill={p.ring}
      />
      <g clipPath={`url(#${id}-user)`}>
        <circle
          cx={100}
          cy={82}
          r={27}
          fill={p.brand}
        />
        <path
          d='M40 190A60 60 0 0 1 160 190Z'
          fill={p.brand}
        />
      </g>
    </>
  );
}

function Diamonds() {
  const p = usePalette();
  return (
    <>
      {[
        { x: 34, y: 34, fill: p.soft },
        { x: 166, y: 34, fill: p.brand },
        { x: 34, y: 166, fill: p.brand },
        { x: 166, y: 166, fill: p.deep },
      ].map(corner => (
        <polygon
          key={`${corner.x},${corner.y}`}
          points={diamond(corner.x, corner.y, 33)}
          fill={corner.fill}
        />
      ))}
      {EDGES.map(edge => (
        <polygon
          key={`${edge.x},${edge.y}`}
          points={diamond(edge.x, edge.y, 32)}
          fill={p.deep}
        />
      ))}
      <polygon
        points={diamond(100, 100, 66)}
        fill={p.ring}
      />
      <polygon
        points={diamond(100, 100, 33)}
        fill={p.paper}
      />
    </>
  );
}

function Pinwheel() {
  const p = usePalette();
  return (
    <>
      <path
        d='M66.7 0A66.7 66.7 0 0 0 66.7 133.4Z'
        fill={p.ring}
      />
      <path
        d='M66.6 66.7A66.7 66.7 0 0 1 200 66.7Z'
        fill={p.deep}
      />
      <path
        d='M133.4 133.3A66.7 66.7 0 0 1 0 133.3Z'
        fill={p.brand}
      />
      <path
        d='M133.3 200A66.7 66.7 0 0 0 133.3 66.6Z'
        fill={p.soft}
        fillOpacity={0.7}
      />
    </>
  );
}

function Petals() {
  const p = usePalette();
  return (
    <>
      {CELLS.map(cell => {
        const x = cell.column * 50;
        const y = cell.row * 50;
        const even = (cell.column + cell.row) % 2 === 0;
        return (
          <path
            key={`${cell.column},${cell.row}`}
            d={
              even
                ? `M${x} ${y}A50 50 0 0 0 ${x + 50} ${y + 50}A50 50 0 0 0 ${x} ${y}Z`
                : `M${x + 50} ${y}A50 50 0 0 1 ${x} ${y + 50}A50 50 0 0 1 ${x + 50} ${y}Z`
            }
            fill={cell.column + cell.row === 0 ? p.soft : p.brand}
          />
        );
      })}
    </>
  );
}

function Rings({ id }: { id: string }) {
  const p = usePalette();
  return (
    <>
      <defs>
        {DISCS.filter(disc => disc.star).map(disc => (
          <clipPath
            key={`${disc.x},${disc.y}`}
            id={`${id}-${disc.x}-${disc.y}`}
          >
            <circle
              cx={disc.x}
              cy={disc.y}
              r={44}
            />
          </clipPath>
        ))}
      </defs>
      {DISCS.map(disc => (
        <g key={`${disc.x},${disc.y}`}>
          <circle
            cx={disc.x}
            cy={disc.y}
            r={44}
            fill='none'
            stroke={p.brand}
            strokeWidth={8}
          />
          {disc.star ? (
            <g clipPath={`url(#${id}-${disc.x}-${disc.y})`}>
              {STAR.map(([dx, dy]) => (
                <circle
                  key={`${dx},${dy}`}
                  cx={disc.x + dx}
                  cy={disc.y + dy}
                  r={44}
                  fill='none'
                  stroke={p.brand}
                  strokeWidth={8}
                />
              ))}
            </g>
          ) : (
            <circle
              cx={disc.x}
              cy={disc.y}
              r={17}
              fill={p.ring}
            />
          )}
        </g>
      ))}
    </>
  );
}

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

function Scales() {
  const p = usePalette();
  return (
    <>
      {range(7).map(row =>
        range(5).map(column => {
          const x = column * 50 + (row % 2 ? 25 : 0);
          const y = row * 32;
          return (
            <g
              key={`${row}-${column}`}
              transform={`translate(${x} ${y})`}
            >
              <circle
                r={30}
                fill={(row + column) % 2 ? p.brand : p.deep}
                stroke={p.paper}
                strokeWidth={3}
              />
              <circle
                r={20}
                fill={p.soft}
              />
              <circle
                r={10}
                fill={p.paper}
              />
            </g>
          );
        }),
      )}
    </>
  );
}

function Chevrons() {
  const p = usePalette();
  const fills = [p.brand, p.paper, p.soft, p.paper, p.deep, p.ring];
  return (
    <>
      {range(8).map(band => {
        const y = band * 32 - 32;
        const top = (k: number) => y + (k % 2) * 16;
        const up = range(9)
          .map(k => `${k === 0 ? 'M' : 'L'}${k * 25} ${top(k)}`)
          .join('');
        const down = range(9)
          .reverse()
          .map(k => `L${k * 25} ${top(k) + 32}`)
          .join('');
        return (
          <path
            key={band}
            d={`${up}${down}Z`}
            fill={fills[band % fills.length]}
          />
        );
      })}
    </>
  );
}

function Checker() {
  const p = usePalette();
  return (
    <>
      {range(8).map(row =>
        range(8).map(column => (
          <g key={`${row}-${column}`}>
            <rect
              x={column * 25}
              y={row * 25}
              width={25}
              height={25}
              fill={(row + column) % 2 ? p.paper : p.brand}
            />
            {(row + column) % 2 ? (
              <circle
                cx={column * 25 + 12.5}
                cy={row * 25 + 12.5}
                r={5}
                fill={p.soft}
              />
            ) : null}
          </g>
        )),
      )}
    </>
  );
}

function Stars() {
  const p = usePalette();
  return (
    <>
      {[
        [50, 50],
        [150, 50],
        [50, 150],
        [150, 150],
      ].map(([x, y]) => (
        <g
          key={`${x}-${y}`}
          transform={`translate(${x} ${y})`}
        >
          <rect
            x={-28}
            y={-28}
            width={56}
            height={56}
            fill={p.brand}
          />
          <rect
            x={-28}
            y={-28}
            width={56}
            height={56}
            fill={p.soft}
            transform='rotate(45)'
          />
          <circle
            r={13}
            fill={p.paper}
          />
          <circle
            r={5}
            fill={p.deep}
          />
        </g>
      ))}
      {[
        [100, 100],
        [100, 0],
        [100, 200],
        [0, 100],
        [200, 100],
      ].map(([x, y]) => (
        <polygon
          key={`${x}-${y}`}
          points={diamond(x, y, 20)}
          fill={p.deep}
        />
      ))}
    </>
  );
}

function Quatrefoil() {
  const p = usePalette();
  return (
    <>
      {[
        [50, 50],
        [150, 50],
        [50, 150],
        [150, 150],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          {[
            [-17, 0],
            [17, 0],
            [0, -17],
            [0, 17],
          ].map(([dx, dy]) => (
            <circle
              key={`${dx}-${dy}`}
              cx={cx + dx}
              cy={cy + dy}
              r={23}
              fill={p.brand}
            />
          ))}
          <circle
            cx={cx}
            cy={cy}
            r={15}
            fill={p.soft}
          />
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill={p.paper}
          />
        </g>
      ))}
      <polygon
        points={diamond(100, 100, 17)}
        fill={p.deep}
      />
    </>
  );
}

function Bands() {
  const p = usePalette();
  const fills = [p.ring, p.brand, p.paper, p.soft, p.paper, p.deep, p.paper];
  return (
    <>
      {fills.map((fill, index) => (
        <polygon
          key={index}
          points={diamond(100, 100, 150 - index * 22)}
          fill={fill}
        />
      ))}
    </>
  );
}

function Dots() {
  const p = usePalette();
  return (
    <>
      {range(4).map(row =>
        range(4).map(column => (
          <g key={`${row}-${column}`}>
            <circle
              cx={column * 50 + 25}
              cy={row * 50 + 25}
              r={19}
              fill={(row + column) % 2 ? p.soft : p.brand}
            />
            <circle
              cx={column * 50 + 25}
              cy={row * 50 + 25}
              r={7}
              fill={p.paper}
            />
          </g>
        )),
      )}
      {range(3).map(row =>
        range(3).map(column => (
          <polygon
            key={`d${row}-${column}`}
            points={diamond(column * 50 + 50, row * 50 + 50, 8)}
            fill={p.deep}
          />
        )),
      )}
    </>
  );
}

function Triangles() {
  const p = usePalette();
  return (
    <>
      {range(4).map(row =>
        range(4).map(column => {
          const x = column * 50;
          const y = row * 50;
          const flip = (row + column) % 2 === 0;
          const first = flip
            ? `${x},${y} ${x + 50},${y} ${x},${y + 50}`
            : `${x + 50},${y} ${x + 50},${y + 50} ${x},${y + 50}`;
          const second = flip
            ? `${x + 50},${y} ${x + 50},${y + 50} ${x},${y + 50}`
            : `${x},${y} ${x + 50},${y} ${x},${y + 50}`;
          return (
            <g key={`${row}-${column}`}>
              <polygon
                points={first}
                fill={p.brand}
              />
              <polygon
                points={second}
                fill={(row * 3 + column) % 3 === 0 ? p.ring : (row * 3 + column) % 3 === 1 ? p.soft : p.paper}
              />
            </g>
          );
        }),
      )}
    </>
  );
}

function Lattice() {
  const p = usePalette();
  return (
    <>
      {range(7).map(row =>
        range(5).map(column => (
          <circle
            key={`${row}-${column}`}
            cx={column * 50 + (row % 2 ? 25 : 0)}
            cy={row * 38 - 8}
            r={31}
            fill='none'
            stroke={row % 2 ? p.soft : p.brand}
            strokeWidth={6}
          />
        )),
      )}
      {range(7).map(row =>
        range(5).map(column => (
          <circle
            key={`c${row}-${column}`}
            cx={column * 50 + (row % 2 ? 25 : 0)}
            cy={row * 38 - 8}
            r={4}
            fill={p.deep}
          />
        )),
      )}
    </>
  );
}

export function BigTileArt({ design, id }: { design: string; id: string }) {
  if (design in GLYPHS) {
    return <Glyph glyph={design as GlyphId} />;
  }
  switch (design) {
    case 'mosaic':
      return <MosaicMark />;
    case 'clerk':
      return <ClerkMark />;
    case 'keyhole':
      return <Keyhole />;
    case 'shield':
      return <Shield />;
    case 'user':
      return <UserBadge id={id} />;
    case 'diamonds':
      return <Diamonds />;
    case 'scales':
      return <Scales />;
    case 'chevrons':
      return <Chevrons />;
    case 'checker':
      return <Checker />;
    case 'stars':
      return <Stars />;
    case 'quatrefoil':
      return <Quatrefoil />;
    case 'bands':
      return <Bands />;
    case 'dots':
      return <Dots />;
    case 'triangles':
      return <Triangles />;
    case 'lattice':
      return <Lattice />;
    case 'petals':
      return <Petals />;
    case 'pinwheel':
      return <Pinwheel />;
    default:
      return <Rings id={id} />;
  }
}

export function BigTileGrid({
  designs,
  bigColumns,
  built,
  fromOpener,
  run,
  seedOrigin,
  stagger,
  appear,
  lightFrom,
  matte,
}: {
  designs: string[];
  bigColumns: number;
  built: boolean;
  fromOpener: boolean;
  run: number;
  stagger?: Stagger;
  appear?: 'scatter' | 'fade' | 'static';
  lightFrom?: 'top' | 'bottom';
  matte?: boolean;
  seedOrigin?: { column: number; row: number };
}) {
  const id = React.useId().replace(/:/g, '');
  const p = usePalette();
  const bigRows = Math.ceil(designs.length / bigColumns);
  return (
    <TileWall
      columns={bigColumns}
      rows={bigRows}
      built={built}
      fromOpener={fromOpener}
      run={run}
      seedOrigin={seedOrigin}
      stagger={stagger}
      appear={appear}
      lightFrom={lightFrom}
      matte={matte}
      render={(column, row) => {
        const index = row * bigColumns + column;
        return (
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            preserveAspectRatio='none'
            className='size-full'
            aria-hidden='true'
          >
            <rect
              width={SIZE}
              height={SIZE}
              fill={p.paper}
            />
            <BigTileArt
              design={designs[index] ?? 'diamonds'}
              id={`${id}-${index}`}
            />
          </svg>
        );
      }}
    />
  );
}

export const QUILT = {
  designs: [
    'petals',
    'scales',
    'diamonds',
    'chevrons',
    'rings',
    'stars',
    'quatrefoil',
    'pinwheel',
    'checker',
    'triangles',
    'lattice',
    'dots',
  ],
  bigColumns: 6,
};
