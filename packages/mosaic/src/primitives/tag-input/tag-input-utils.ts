export function splitTags(text: string, delimiters: string[]): string[] {
  let parts = [text];
  for (const delimiter of [...delimiters, '\n', '\r', '\t']) {
    parts = parts.flatMap(part => part.split(delimiter));
  }
  return parts;
}

export function mergeRenderList(previous: string[], value: string[]): string[] {
  const result = [...value];
  previous.forEach((item, index) => {
    if (result.includes(item)) {
      return;
    }
    const anchor = previous
      .slice(0, index)
      .reverse()
      .find(candidate => result.includes(candidate));
    result.splice(anchor === undefined ? 0 : result.indexOf(anchor) + 1, 0, item);
  });
  return result;
}

export function readingDirectionKeys(element: Element) {
  const isRtl = (element.closest('[dir]')?.getAttribute('dir') ?? '').toLowerCase() === 'rtl';
  return {
    previousKey: isRtl ? 'ArrowRight' : 'ArrowLeft',
    nextKey: isRtl ? 'ArrowLeft' : 'ArrowRight',
  };
}
