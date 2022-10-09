export function isRetinaDisplay(): boolean {
  if (!window.matchMedia) {
    return false;
  }
  const mq = window.matchMedia(
    'only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)',
  );
  return (mq && mq.matches) || window.devicePixelRatio > 1;
}
