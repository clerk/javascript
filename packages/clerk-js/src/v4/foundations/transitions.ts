const transitionDuration = Object.freeze({
  focusRing: '200ms',
} as const);

const transitionProperty = Object.freeze({
  common: 'background-color,border-color,color,fill,stroke,opacity,box-shadow,transform',
} as const);

const transitionTiming = Object.freeze({
  common: 'ease',
} as const);

export { transitionDuration, transitionTiming, transitionProperty };
