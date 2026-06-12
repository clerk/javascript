import { version } from 'react';

// React 19 turned `inert` into a real boolean attribute, so a falsy value like `''`
// is no longer reflected to the DOM. React 18 doesn't know `inert` and only serializes
// a (non-undefined) string value. Resolve the consumer's React major once at module
// load — `react` is a peer dependency, so this reads the same copy the component renders
// with — and emit the value that major actually reflects.
//
// `parseInt` handles prerelease strings like `19.0.0-rc-...`. Experimental builds report
// `0.0.0-experimental-...` (major 0) but ship React 19 behavior, so treat 0 as modern too.
const major = parseInt(version, 10);
const isModernReact = major >= 19 || major === 0;

/**
 * Props to spread onto an element to apply (or omit) the `inert` attribute correctly
 * across React 18 and 19.
 *
 * Returned as `Record<string, unknown>` on purpose: React 18's types reject `inert` and
 * React 19's type it as `boolean`, so an untyped spread sidesteps both type-level shapes
 * regardless of which `@types/react` a consumer compiles against.
 *
 * @param active - Whether the element should be inert.
 */
export function inertProps(active: boolean): Record<string, unknown> {
  if (!active) {
    return {};
  }
  return { inert: isModernReact ? true : '' };
}
