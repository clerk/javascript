const transitionDuration = Object.freeze({
  slowest: '600ms',
  slower: '280ms',
  slow: '200ms',
  fast: '120ms',
  focusRing: '200ms',
  controls: '100ms',
  textField: '450ms',
} as const);

const transitionProperty = Object.freeze({
  common: 'background-color,background,border-color,color,fill,stroke,opacity,box-shadow,transform',
} as const);

const transitionTiming = Object.freeze({
  common: 'ease',
  easeOut: 'ease-out',
  slowBezier: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const);

export { transitionDuration, transitionTiming, transitionProperty };
