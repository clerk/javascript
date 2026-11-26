export function httpsUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  try {
    return new URL(url).protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}

export type LogoShape = 'square' | 'wide';

const WIDE_LOGO_RATIO = 1.25;

export function logoShape(width: number, height: number): LogoShape {
  return height > 0 && width / height <= WIDE_LOGO_RATIO ? 'square' : 'wide';
}
