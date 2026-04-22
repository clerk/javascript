import * as React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A render prop: either a JSX element to clone, or a function that receives
 * computed HTML props and returns a JSX element.
 */
export type RenderProp<Props = React.HTMLAttributes<HTMLElement>> =
  | React.ReactElement
  | ((props: Props) => React.ReactElement);

/**
 * Props accepted by any primitive part. Extends the native props for `Tag`
 * and adds the optional `render` escape hatch.
 */
export type ComponentProps<Tag extends keyof React.JSX.IntrinsicElements> = React.ComponentPropsWithRef<Tag> & {
  render?: RenderProp;
};

/**
 * Maps state keys to functions that return data-attribute objects (or null).
 */
type StateAttributesMapping<S> = {
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
    } else if (key === 'className' && a.className && bVal) {
      merged.className = `${a.className} ${bVal}`;
    } else {
      merged[key] = bVal;
    }
  }

  return merged;
}

// ---------------------------------------------------------------------------
// renderElement
// ---------------------------------------------------------------------------

interface RenderElementParams<
  Tag extends keyof React.JSX.IntrinsicElements,
  State extends Record<string, unknown> = Record<string, never>,
> {
  /** Fallback HTML tag when `render` is not provided. */
  defaultTagName: Tag;
  /** Render prop from the consumer. */
  render?: RenderProp;
  /** When false, returns null (used by Positioners gated on `mounted`). */
  enabled?: boolean;
  /** State object. Keys are mapped to data attributes via `stateAttributesMapping`. */
  state?: State;
  /** Custom mapping from state keys to data-attribute objects. */
  stateAttributesMapping?: StateAttributesMapping<State>;
  /** Merged props to spread onto the element. */
  props?: Record<string, unknown>;
}

/**
 * Renders a primitive part element with render-prop support, conditional
 * rendering, and state-to-data-attribute mapping.
 */
export function renderElement<
  Tag extends keyof React.JSX.IntrinsicElements,
  State extends Record<string, unknown> = Record<string, never>,
>(params: RenderElementParams<Tag, State>): React.ReactElement | null {
  const { defaultTagName, render, enabled = true, state, stateAttributesMapping, props } = params;

  if (!enabled) return null;

  // Build data attributes from state
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
    return render(computedProps as React.HTMLAttributes<HTMLElement>);
  }

  if (render) {
    return React.cloneElement(render, computedProps);
  }

  return React.createElement(defaultTagName, computedProps);
}
