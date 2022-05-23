export const fastDeepMerge = (source: any, target: any) => {
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === `object`) {
      if (target[key] === undefined) {
        target[key] = new (Object.getPrototypeOf(source[key]).constructor)();
      }
      fastDeepMerge(source[key], target[key]);
    } else {
      target[key] = source[key];
    }
  }
};
