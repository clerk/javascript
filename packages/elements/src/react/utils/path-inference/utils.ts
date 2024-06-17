export function removeOptionalCatchAllSegment(pathname: string) {
  return pathname.replace(/\/\[\[\.\.\..*/, '');
}
