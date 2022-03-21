import React from 'react';

// @ts-ignore
import styles from './SkeletonLoader.module.scss';

export interface SkeletonLoaderProps extends React.SVGProps<SVGSVGElement> {
  animate?: boolean;
  speed?: number;
  interval?: number;
  gradientRatio?: number;
  baseUrl?: string;
  title?: string;
  id: string;
  children: React.ReactNode;
}

export function SkeletonLoader({
  animate = true,
  baseUrl = '',
  gradientRatio = 2,
  interval = 0.25,
  speed = 1.5,
  title = 'Loading...',
  style = {},
  id,
  children,
  ...props
}: SkeletonLoaderProps): JSX.Element {
  const keyTimes = `0; ${interval}; 1`;
  const dur = `${speed}s`;
  const clipId = `${id}-diff`;
  const gradientId = `${id}-animated-diff`;
  const ariaId = `${id}-aria`;

  return (
    <svg
      aria-labelledby={ariaId}
      role='img'
      style={{ ...style }}
      {...props}
    >
      {title ? <title id={ariaId}>{title}</title> : null}
      <rect
        role='presentation'
        x='0'
        y='0'
        width='100%'
        height='100%'
        clipPath={`url(${baseUrl}#${clipId})`}
        style={{ fill: `url(${baseUrl}#${gradientId})` }}
      />

      <defs>
        <clipPath id={clipId}>{children}</clipPath>
        <linearGradient id={gradientId}>
          <stop
            offset='0%'
            className={styles.backgroundStop}
          >
            {animate && (
              <animate
                attributeName='offset'
                values={`${-gradientRatio}; ${-gradientRatio}; 1`}
                keyTimes={keyTimes}
                dur={dur}
                repeatCount='indefinite'
              />
            )}
          </stop>

          <stop
            offset='50%'
            className={styles.foregroundStop}
          >
            {animate && (
              <animate
                attributeName='offset'
                values={`${-gradientRatio / 2}; ${-gradientRatio / 2}; ${1 + gradientRatio / 2}`}
                keyTimes={keyTimes}
                dur={dur}
                repeatCount='indefinite'
              />
            )}
          </stop>

          <stop
            offset='100%'
            className={styles.backgroundStop}
          >
            {animate && (
              <animate
                attributeName='offset'
                values={`0; 0; ${1 + gradientRatio}`}
                keyTimes={keyTimes}
                dur={dur}
                repeatCount='indefinite'
              />
            )}
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
}
