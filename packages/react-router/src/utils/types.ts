export type ReactRouterContext = Record<string, any> & {
  get?: <T>(context: unknown) => T | undefined;
  set?: <T>(context: unknown, value: T) => void;
};
