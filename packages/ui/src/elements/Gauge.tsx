import React from 'react';

import { Col, Text } from '../customizables';
import { defaultInternalTheme } from '../foundations';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<Size, { svgSize: number; textSize: string }> = {
  xs: {
    svgSize: 24,
    textSize: defaultInternalTheme.fontSizes.$xs,
  },
  sm: {
    svgSize: 32,
    textSize: defaultInternalTheme.fontSizes.$sm,
  },
  md: {
    svgSize: 52,
    textSize: defaultInternalTheme.fontSizes.$md,
  },
  lg: {
    svgSize: 64,
    textSize: defaultInternalTheme.fontSizes.$lg,
  },
  xl: {
    svgSize: 96,
    textSize: defaultInternalTheme.fontSizes.$xl,
  },
};

export type GaugeProps = {
  value: number;
  limit: number;
  size?: Size;
  strokeWidth?: number;
};

export const Gauge = React.memo((props: GaugeProps) => {
  const { value, limit, size = 'sm' } = props;
  const { textSize, svgSize } = sizes[size];
  const radius = svgSize / 2;
  const strokeWidth = props.strokeWidth || svgSize / 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = (value / limit) * circumference;
  const offset = circumference - strokeDashoffset;

  return (
    <Col
      center
      sx={theme => ({
        '--cl-gauge-inner-stroke-color': theme.colors.$neutralAlpha900,
        '--cl-gauge-outter-stroke-color': theme.colors.$neutralAlpha300,
        '> svg': {
          transform: 'rotate(-90deg)',
        },
      })}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        <circle
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeWidth={strokeWidth}
          fill='transparent'
          stroke='var(--cl-gauge-outter-stroke-color)'
          strokeLinecap='round'
        />
        {value >= 0 ? (
          <circle
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            strokeDashoffset={offset}
            fill='transparent'
            stroke='var(--cl-gauge-inner-stroke-color)'
            strokeLinecap='round'
          />
        ) : null}
      </svg>
      <Text
        as='div'
        sx={theme => ({
          position: 'absolute',
          display: 'flex',
          fontSize: textSize,
          color: theme.colors.$neutralAlpha900,
        })}
      >
        {value}
      </Text>
    </Col>
  );
});
