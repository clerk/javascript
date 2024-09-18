import type {
  Match,
  MatchFunction,
  ParseOptions,
  Path,
  RegexpToFunctionOptions,
  TokensToRegexpOptions,
} from './compiled/path-to-regexp';
import { match as matchBase, pathToRegexp as pathToRegexpBase } from './compiled/path-to-regexp';

export const pathToRegexp = (path: string) => {
  try {
    // @ts-ignore no types exists for the pre-compiled package
    return pathToRegexpBase(path);
  } catch (e: any) {
    throw new Error(
      `Invalid path: ${path}.\nConsult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp/tree/6.x\n${e.message}`,
    );
  }
};

export function match<P extends object = object>(
  str: Path,
  options?: ParseOptions & TokensToRegexpOptions & RegexpToFunctionOptions,
): MatchFunction<P> {
  try {
    // @ts-ignore no types exists for the pre-compiled package
    return matchBase(str, options);
  } catch (e: any) {
    throw new Error(
      `Invalid path and options: Consult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp/tree/6.x\n${e.message}`,
    );
  }
}

export { type Match, type MatchFunction };
