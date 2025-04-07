import type { Options } from 'tsup';

export const runAfterLast =
  (commands: Array<string | false>) =>
  (...configs: Options[]) => {
    const [last, ...rest] = configs.reverse();
    return [...rest.reverse(), { ...last, onSuccess: [last.onSuccess, ...commands].filter(Boolean).join(' && ') }];
  };
