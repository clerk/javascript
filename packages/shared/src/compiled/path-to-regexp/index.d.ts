interface ParseOptions {
  /**
   * Set the default delimiter for repeat parameters. (default: `'/'`)
   */
  delimiter?: string;
  /**
   * List of characters to automatically consider prefixes when parsing.
   */
  prefixes?: string;
}
interface RegexpToFunctionOptions {
  /**
   * Function for decoding strings for params.
   */
  decode?: (value: string, token: Key) => string;
}
/**
 * A match result contains data about the path match.
 */
interface MatchResult<P extends object = object> {
  path: string;
  index: number;
  params: P;
}
/**
 * A match is either `false` (no match) or a match result.
 */
type Match<P extends object = object> = false | MatchResult<P>;
/**
 * The match function takes a string and returns whether it matched the path.
 */
type MatchFunction<P extends object = object> = (path: string) => Match<P>;
/**
 * Create path match function from `path-to-regexp` spec.
 */
declare function match<P extends object = object>(
  str: Path,
  options?: ParseOptions & TokensToRegexpOptions & RegexpToFunctionOptions,
): MatchFunction<P>;
/**
 * Metadata about a key.
 */
interface Key {
  name: string | number;
  prefix: string;
  suffix: string;
  pattern: string;
  modifier: string;
}
interface TokensToRegexpOptions {
  /**
   * When `true` the regexp will be case sensitive. (default: `false`)
   */
  sensitive?: boolean;
  /**
   * When `true` the regexp won't allow an optional trailing delimiter to match. (default: `false`)
   */
  strict?: boolean;
  /**
   * When `true` the regexp will match to the end of the string. (default: `true`)
   */
  end?: boolean;
  /**
   * When `true` the regexp will match from the beginning of the string. (default: `true`)
   */
  start?: boolean;
  /**
   * Sets the final character for non-ending optimistic matches. (default: `/`)
   */
  delimiter?: string;
  /**
   * List of characters that can also be "end" characters.
   */
  endsWith?: string;
  /**
   * Encode path tokens for use in the `RegExp`.
   */
  encode?: (value: string) => string;
}
/**
 * Supported `path-to-regexp` input types.
 */
type Path = string | RegExp | Array<string | RegExp>;
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
declare function pathToRegexp(path: Path, keys?: Key[], options?: TokensToRegexpOptions & ParseOptions): RegExp;

export {
  type Match,
  type MatchFunction,
  type ParseOptions,
  type Path,
  type RegexpToFunctionOptions,
  type TokensToRegexpOptions,
  match,
  pathToRegexp,
};
