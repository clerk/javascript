import { useMergeRefs } from '@floating-ui/react';
import * as React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A render prop: a function that receives computed HTML props and returns a JSX element.
 */
export type RenderProp<Props = React.HTMLAttributes<HTMLElement>> = (props: Props) => React.ReactElement;

/**
 * Props accepted by any primitive part. Extends the native props for `Tag`
 * and adds the optional `render` escape hatch, narrowed to that tag's props.
 */
export type ComponentProps<Tag extends keyof React.JSX.IntrinsicElements> = React.ComponentPropsWithRef<Tag> & {
  render?: RenderProp<React.ComponentPropsWithRef<Tag>>;
};

/**
 * The props a primitive part applies to its own rendered element. Extends the
 * native props for `Tag` and additionally permits internal `data-*` attributes
 * (e.g. `data-open`), which `@types/react` intentionally omits from its
 * element prop types.
 *
 * Use with `satisfies` to type-check authored default props — this validates
 * every key against the real element props while still allowing our `data-*`
 * attributes, instead of laundering the whole object past the checker with an
 * `as` assertion.
 */
export type DefaultProps<Tag extends keyof React.JSX.IntrinsicElements> = React.ComponentPropsWithRef<Tag> &
  Record<`data-${string}`, string>;

/**
 * Maps state keys to functions that return data-attribute objects (or null).
 */
export type StateAttributesMapping<S> = {
  [K in keyof S]?: (value: S[K]) => Record<string, string> | null;
};

// ---------------------------------------------------------------------------
// mergeProps
// ---------------------------------------------------------------------------

type PropsInput<Tag extends keyof React.JSX.IntrinsicElements> =
  | React.ComponentPropsWithRef<Tag>
  | Record<string, unknown>;

/**
 * Merges two props objects. Event handlers are chained (both fire),
 * `style` is shallow-merged, `className` is concatenated, and
 * everything else is overwritten by the second argument.
 */
export function mergeProps<Tag extends keyof React.JSX.IntrinsicElements>(
  a: PropsInput<Tag>,
  b: PropsInput<Tag>,
): Record<string, unknown>;
export function mergeProps(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...a };

  for (const key of Object.keys(b)) {
    const bVal = b[key];

    if (
      key.charCodeAt(0) === 111 /* o */ &&
      key.charCodeAt(1) === 110 /* n */ &&
      key.charCodeAt(2) >= 65 /* A */ &&
      key.charCodeAt(2) <= 90 /* Z */ &&
      typeof a[key] === 'function' &&
      typeof bVal === 'function'
    ) {
      // Chain event handlers — internal fires first, consumer fires second
      const aHandler = a[key] as (...args: unknown[]) => void;
      const bHandler = bVal as (...args: unknown[]) => void;
      merged[key] = (...args: unknown[]) => {
        aHandler(...args);
        bHandler(...args);
      };
    } else if (key === 'style' && a.style && bVal) {
      merged.style = { ...(a.style as object), ...(bVal as object) };
    } else if (key === 'className' && typeof a.className === 'string' && typeof bVal === 'string') {
      merged.className = `${a.className} ${bVal}`;
    } else {
      merged[key] = bVal;
    }
  }

  return merged;
}

// ---------------------------------------------------------------------------
// useRender
// ---------------------------------------------------------------------------

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
 * state-to-data-attribute mapping. `render` accepts a React element (cloned with
 * merged props) as well as a function, and refs are merged internally via `ref`.
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
    // function is declared to receive this tag's props.
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
