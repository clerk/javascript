import { useMergeRefs } from '@floating-ui/react';
import * as React from 'react';

import type { DefaultProps, RenderProp, StateAttributesMapping } from './render-element';
import { mergeProps } from './render-element';

/**
 * A `render` prop: a render function, or a React element to clone with the
 * part's computed props (`render={<Link/>}`).
 */
type RenderPropOrElement<Tag extends keyof React.JSX.IntrinsicElements> =
  | RenderProp<React.ComponentPropsWithRef<Tag>>
  | React.ReactElement;

/**
 * Reads the ref off a React element passed to `render`. React 19 exposes it on
 * `props.ref`; React <=18 keeps it on the element itself.
 */
function getReactElementRef(element: React.ReactElement): React.Ref<unknown> | undefined {
  // SAFETY: `@types/react` types `props`/`ref` too loosely to read `ref` off an
  // arbitrary element without a cast. React guarantees `ref` is a `React.Ref` when
  // present; both shapes are checked and either branch is undefined-safe.
  const fromProps = (element.props as { ref?: React.Ref<unknown> }).ref;
  if (fromProps != null) {
    return fromProps;
  }
  return (element as { ref?: React.Ref<unknown> }).ref ?? undefined;
}

interface UseRenderParamsBase<
  Tag extends keyof React.JSX.IntrinsicElements,
  State extends Record<string, unknown> = Record<string, never>,
> {
  /** Fallback HTML tag when `render` is not provided. */
  defaultTagName: Tag;
  /** Render prop or element from the consumer. */
  render?: RenderPropOrElement<Tag>;
  /** Ref(s) to merge onto the rendered element. Merged with the element's own ref. */
  ref?: React.Ref<unknown> | Array<React.Ref<unknown> | undefined>;
  /** State object. Keys are mapped to data attributes via `stateAttributesMapping`. */
  state?: State;
  /** Custom mapping from state keys to data-attribute objects. */
  stateAttributesMapping?: StateAttributesMapping<State>;
  /** Props to spread onto the element. Pass refs via `ref`, not here. */
  props?: DefaultProps<Tag> | Record<string, unknown>;
}

interface UseRenderParamsConditional<
  Tag extends keyof React.JSX.IntrinsicElements,
  State extends Record<string, unknown> = Record<string, never>,
> extends UseRenderParamsBase<Tag, State> {
  /** When false, returns null (used by Positioners gated on `mounted`). */
  enabled: boolean;
}

interface UseRenderParamsAlways<
  Tag extends keyof React.JSX.IntrinsicElements,
  State extends Record<string, unknown> = Record<string, never>,
> extends UseRenderParamsBase<Tag, State> {
  enabled?: never;
}

/**
 * Renders a primitive part with render-prop support, conditional rendering, and
 * state-to-data-attribute mapping. Unlike `renderElement`, `render` accepts a
 * React element (cloned with merged props) as well as a function, and refs are
 * merged internally via `ref`.
 *
 * Hook: call it unconditionally. When `enabled` is omitted the element is always
 * rendered (returns ReactElement); when passed it may be skipped (returns null).
 */
export function useRender<
  Tag extends keyof React.JSX.IntrinsicElements,
  State extends Record<string, unknown> = Record<string, never>,
>(params: UseRenderParamsAlways<Tag, State>): React.ReactElement;
export function useRender<
  Tag extends keyof React.JSX.IntrinsicElements,
  State extends Record<string, unknown> = Record<string, never>,
>(params: UseRenderParamsConditional<Tag, State>): React.ReactElement | null;
export function useRender<
  Tag extends keyof React.JSX.IntrinsicElements,
  State extends Record<string, unknown> = Record<string, never>,
>(params: UseRenderParamsBase<Tag, State> & { enabled?: boolean }): React.ReactElement | null {
  const { defaultTagName, render, ref, enabled = true, state, stateAttributesMapping, props } = params;

  const normalizedRefs = ref == null ? [] : Array.isArray(ref) ? ref : [ref];
  const elementRef = React.isValidElement(render) ? getReactElementRef(render) : undefined;
  const mergedRef = useMergeRefs([...normalizedRefs, elementRef]);

  if (!enabled) {
    return null;
  }

  let dataAttrs: Record<string, string> = {};
  if (state && stateAttributesMapping) {
    for (const key of Object.keys(stateAttributesMapping) as Array<keyof State>) {
      const mapper = stateAttributesMapping[key];
      if (mapper) {
        const attrs = mapper(state[key]);
        if (attrs) {
          dataAttrs = { ...dataAttrs, ...attrs };
        }
      }
    }
  }

  const computedProps = { ...props, ...dataAttrs };

  if (typeof render === 'function') {
    // SAFETY: computedProps is the tag's props widened with data-* attrs; the render
    // function is declared to receive this tag's props. Matches renderElement above.
    return render({ ...computedProps, ref: mergedRef } as React.ComponentPropsWithRef<Tag>);
  }

  if (React.isValidElement(render)) {
    // SAFETY: `@types/react` types element `props` as `unknown`; mergeProps reads it
    // as an untyped bag of props, which is exactly what a cloned element carries.
    const merged = mergeProps<Tag>(computedProps, render.props as Record<string, unknown>);
    // SAFETY: cloneElement's prop type omits `ref`, but React re-associates a ref passed
    // here at runtime (base-ui clones render elements the same way). Asserting the element's
    // props as an untyped bag lets the merged props + ref through the index signature.
    return React.cloneElement(render as React.ReactElement<Record<string, unknown>>, { ...merged, ref: mergedRef });
  }

  return React.createElement(defaultTagName, { ...computedProps, ref: mergedRef });
}
