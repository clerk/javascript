export const readObjectPath = <O extends Record<string, any>>(obj: O, path: string) => {
  const props = (path || '').split('.');
  let cur = obj;
  for (let i = 0; i < props.length; i++) {
    cur = cur[props[i]];
    if (cur === undefined) {
      return undefined;
    }
  }
  return cur;
};
