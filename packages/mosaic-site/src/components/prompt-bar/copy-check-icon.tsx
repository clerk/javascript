import { spring } from 'motion/react';
import type { CSSProperties } from 'react';

import { CopyIcon } from './copy-icon';

const EASE = {
  fade: String(spring(0.15, 0)),
  pop: String(spring(0.22, 0.35)),
  draw: String(spring(0.2, 0)),
};

// The hero prompt bar's copy→check swap: the copy mark blurs out as the check pops in and draws its stroke.
export function CopyCheckIcon({ copied }: { copied: boolean }) {
  const swap = (shown: boolean, pop = false): CSSProperties => ({
    opacity: shown ? 1 : 0,
    scale: shown ? 1 : 0.8,
    filter: shown ? 'blur(0px)' : 'blur(2px)',
    transition: `opacity ${EASE.fade}, filter ${EASE.fade}, scale ${pop && shown ? EASE.pop : EASE.fade}`,
  });

  return (
    <span className='grid size-3.5'>
      {/* Safari shifts a glyph by a pixel when the transition promotes it to a compositor layer and back when it
          demotes, so both stay on a layer. */}
      <span
        className='will-change-[opacity,filter,scale] [grid-area:1/1]'
        style={swap(!copied)}
      >
        <CopyIcon className='size-3.5 translate-x-[0.5px]' />
      </span>
      <svg
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        aria-hidden
        className='translate-[0.5px] size-3.5 will-change-[opacity,filter,scale] [grid-area:1/1]'
        style={swap(copied, true)}
      >
        <path
          d='M4.5 12l4.5 4.5 10.5-10.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='1.5'
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: copied ? 0 : 1,
            transition: copied ? `stroke-dashoffset ${EASE.draw} 60ms` : 'stroke-dashoffset 0s 200ms',
          }}
        />
      </svg>
    </span>
  );
}
