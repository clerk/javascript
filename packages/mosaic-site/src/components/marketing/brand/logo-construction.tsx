'use client';
import * as React from 'react';

import { MARK_PATHS } from '@/lib/brand/mark';
const S = 5;
const MARK_X = 120;
const MARK_TOP = 60;
const MARK_W = 50 * S;
const MARK_H = 40 * S;
const CLEAR = 10 * S;
const FONT = MARK_H;
const BASE = MARK_TOP + MARK_H;
const TEXT_BASE = MARK_TOP + MARK_H / 2 + FONT * 0.355;
const TEXT_X = MARK_X + MARK_W + CLEAR;
const FALLBACK_TEXT_WIDTH = 1180;
export function LogoConstruction() {
  const textRef = React.useRef<SVGTextElement>(null);
  const [textWidth, setTextWidth] = React.useState(FALLBACK_TEXT_WIDTH);
  React.useEffect(() => {
    const measure = () => {
      const box = textRef.current?.getBBox();
      if (box && box.width > 0) {
        setTextWidth(box.width);
      }
    };
    void document.fonts.ready.then(measure);
  }, []);
  const textEnd = TEXT_X + textWidth;
  const width = textEnd + CLEAR + 300;
  const height = BASE + CLEAR + 60;
  const capY = TEXT_BASE - FONT * 0.71;
  const xY = TEXT_BASE - FONT * 0.52;
  const zones = [
    { x: MARK_X - CLEAR, label: 'x' },
    { x: MARK_X + MARK_W, label: 'x' },
    { x: textEnd, label: 'x' },
  ];
  const horizontal = [
    { y: MARK_TOP - CLEAR, label: 'clearspace' },
    { y: MARK_TOP, label: 'mark top' },
    { y: capY, label: 'cap height' },
    { y: xY, label: 'x-height' },
    { y: TEXT_BASE, label: 'baseline' },
    { y: BASE, label: 'mark bottom' },
    { y: BASE + CLEAR, label: 'clearspace' },
  ];
  const vertical = [MARK_X - CLEAR, MARK_X, MARK_X + MARK_W, TEXT_X, textEnd, textEnd + CLEAR];
  const textStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading), Geist, sans-serif',
    letterSpacing: `${-FONT * 0.035}px`,
  };
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className='text-foreground h-auto w-full'
      role='img'
      aria-label='Construction diagram of the Mosaic Components lockup'
    >
      <defs>
        <pattern
          id='clearspace-hatch'
          width='12'
          height='12'
          patternUnits='userSpaceOnUse'
          patternTransform='rotate(45)'
        >
          <line
            x1='0'
            y1='0'
            x2='0'
            y2='12'
            stroke='currentColor'
            strokeOpacity='0.14'
            strokeWidth='3'
          />
        </pattern>
      </defs>

      {horizontal.map(line => (
        <g key={line.label + line.y}>
          <line
            x1='0'
            x2={width}
            y1={line.y}
            y2={line.y}
            stroke='currentColor'
            strokeOpacity='0.14'
            strokeWidth='1.5'
          />
          <text
            x={width - 14}
            y={line.y - 8}
            textAnchor='end'
            fill='currentColor'
            fillOpacity='0.4'
            fontSize='15'
            style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.08em' }}
          >
            {line.label.toUpperCase()}
          </text>
        </g>
      ))}
      {vertical.map(x => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1='0'
          y2={height}
          stroke='currentColor'
          strokeOpacity='0.14'
          strokeWidth='1.5'
        />
      ))}

      {zones.map(zone => (
        <g key={zone.x}>
          <rect
            x={zone.x}
            y={MARK_TOP}
            width={CLEAR}
            height={MARK_H}
            fill='url(#clearspace-hatch)'
          />
          <text
            x={zone.x + CLEAR / 2}
            y={MARK_TOP + MARK_H / 2 + 6}
            textAnchor='middle'
            fill='currentColor'
            fillOpacity='0.5'
            fontSize='22'
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {zone.label}
          </text>
        </g>
      ))}

      <g transform={`translate(${MARK_X} ${MARK_TOP}) scale(${S})`}>
        {MARK_PATHS.map(d => (
          <path
            key={d}
            d={d}
            fill='none'
            stroke='currentColor'
            strokeOpacity='0.55'
            strokeWidth={1.6 / S}
          />
        ))}
      </g>

      <text
        ref={textRef}
        x={TEXT_X}
        y={TEXT_BASE}
        fontSize={FONT}
        fill='none'
        stroke='currentColor'
        strokeOpacity='0.55'
        strokeWidth='1.6'
        style={textStyle}
      >
        <tspan fontWeight='600'>Mosaic</tspan>
        <tspan fontWeight='400'> Components</tspan>
      </text>
    </svg>
  );
}
