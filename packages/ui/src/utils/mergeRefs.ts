export const mergeRefs = <T>(...refs: React.RefObject<T>[]) => {
  return (node: any) => {
    for (const _ref of refs) {
      if (_ref) {
        //@ts-expect-error
        _ref.current = node;
      }
    }
  };
};
