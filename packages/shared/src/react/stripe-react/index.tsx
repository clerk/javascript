/**
 * Original source: https://github.com/stripe/react-stripe-js.
 *
 * The current version of this file is a fork of the original version.
 * The main difference is that we have kept only the necessary parts of the file.
 * This is because we don't need it and it's not used in the Clerk codebase.
 *
 * The original version of this file is licensed under the MIT license.
 * Https://github.com/stripe/react-stripe-js/blob/master/LICENSE.
 */

import type { ElementProps, PaymentElementProps } from '@stripe/react-stripe-js';
import type {
  Stripe,
  StripeElement,
  StripeElements,
  StripeElementsOptions,
  StripeElementType,
} from '@stripe/stripe-js';
import type { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import React, { useState } from 'react';

import { useAttachEvent, usePrevious } from './utils';

interface ElementsContextValue {
  elements: StripeElements | null;
  stripe: Stripe | null;
}

const ElementsContext = React.createContext<ElementsContextValue | null>(null);
ElementsContext.displayName = 'ElementsContext';

const parseElementsContext = (ctx: ElementsContextValue | null, useCase: string): ElementsContextValue => {
  if (!ctx) {
    throw new Error(
      `Could not find Elements context; You need to wrap the part of your app that ${useCase} in an <Elements> provider.`,
    );
  }

  return ctx;
};

interface ElementsProps {
  /**
   * A [Stripe object](https://stripe.com/docs/js/initializing) or a `Promise` resolving to a `Stripe` object.
   * The easiest way to initialize a `Stripe` object is with the the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme).
   * Once this prop has been set, it can not be changed.
   *
   * You can also pass in `null` or a `Promise` resolving to `null` if you are performing an initial server-side render or when generating a static site.
   */
  stripe: PromiseLike<Stripe | null> | Stripe | null;

  /**
   * Optional [Elements configuration options](https://stripe.com/docs/js/elements_object/create).
   * Once the stripe prop has been set, these options cannot be changed.
   */
  options?: StripeElementsOptions;
}

type UnknownOptions = { [k: string]: unknown };

interface PrivateElementsProps {
  stripe: unknown;
  options?: UnknownOptions;
  children?: ReactNode;
}

/**
 * The `Elements` provider allows you to use [Element components](https://stripe.com/docs/stripe-js/react#element-components) and access the [Stripe object](https://stripe.com/docs/js/initializing) in any nested component.
 * Render an `Elements` provider at the root of your React app so that it is available everywhere you need it.
 *
 * To use the `Elements` provider, call `loadStripe` from `@stripe/stripe-js` with your publishable key.
 * The `loadStripe` function will asynchronously load the Stripe.js script and initialize a `Stripe` object.
 * Pass the returned `Promise` to `Elements`.
 *
 * @docs https://stripe.com/docs/stripe-js/react#elements-provider
 */
const Elements: FunctionComponent<PropsWithChildren<ElementsProps>> = (({
  stripe: rawStripeProp,
  options,
  children,
}: PrivateElementsProps) => {
  const parsed = React.useMemo(() => parseStripeProp(rawStripeProp), [rawStripeProp]);

  // For a sync stripe instance, initialize into context
  const [ctx, setContext] = React.useState<ElementsContextValue>(() => ({
    stripe: parsed.tag === 'sync' ? parsed.stripe : null,
    elements: parsed.tag === 'sync' ? parsed.stripe.elements(options) : null,
  }));

  React.useEffect(() => {
    let isMounted = true;

    const safeSetContext = (stripe: Stripe) => {
      setContext(ctx => {
        // no-op if we already have a stripe instance (https://github.com/stripe/react-stripe-js/issues/296)
        if (ctx.stripe) {
          return ctx;
        }
        return {
          stripe,
          elements: stripe.elements(options),
        };
      });
    };

    // For an async stripePromise, store it in context once resolved
    if (parsed.tag === 'async' && !ctx.stripe) {
      parsed.stripePromise.then(stripe => {
        if (stripe && isMounted) {
          // Only update Elements context if the component is still mounted
          // and stripe is not null. We allow stripe to be null to make
          // handling SSR easier.
          safeSetContext(stripe);
        }
      });
    } else if (parsed.tag === 'sync' && !ctx.stripe) {
      // Or, handle a sync stripe instance going from null -> populated
      safeSetContext(parsed.stripe);
    }

    return () => {
      isMounted = false;
    };
  }, [parsed, ctx, options]);

  // Warn on changes to stripe prop
  const prevStripe = usePrevious(rawStripeProp);
  React.useEffect(() => {
    if (prevStripe !== null && prevStripe !== rawStripeProp) {
      console.warn('Unsupported prop change on Elements: You cannot change the `stripe` prop after setting it.');
    }
  }, [prevStripe, rawStripeProp]);

  // Apply updates to elements when options prop has relevant changes
  const prevOptions = usePrevious(options);
  React.useEffect(() => {
    if (!ctx.elements) {
      return;
    }

    const updates = extractAllowedOptionsUpdates(options, prevOptions, ['clientSecret', 'fonts']);

    if (updates) {
      ctx.elements.update(updates);
    }
  }, [options, prevOptions, ctx.elements]);

  return <ElementsContext.Provider value={ctx}>{children}</ElementsContext.Provider>;
}) as FunctionComponent<PropsWithChildren<ElementsProps>>;

const useElementsContextWithUseCase = (useCaseMessage: string): ElementsContextValue => {
  const ctx = React.useContext(ElementsContext);
  return parseElementsContext(ctx, useCaseMessage);
};

const useElements = (): StripeElements | null => {
  const { elements } = useElementsContextWithUseCase('calls useElements()');
  return elements;
};

const INVALID_STRIPE_ERROR =
  'Invalid prop `stripe` supplied to `Elements`. We recommend using the `loadStripe` utility from `@stripe/stripe-js`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.';

// We are using types to enforce the `stripe` prop in this lib, but in a real
// integration `stripe` could be anything, so we need to do some sanity
// validation to prevent type errors.
const validateStripe = (maybeStripe: unknown, errorMsg = INVALID_STRIPE_ERROR): null | Stripe => {
  if (maybeStripe === null || isStripe(maybeStripe)) {
    return maybeStripe;
  }

  throw new Error(errorMsg);
};

type ParsedStripeProp =
  | { tag: 'empty' }
  | { tag: 'sync'; stripe: Stripe }
  | { tag: 'async'; stripePromise: Promise<Stripe | null> };

const parseStripeProp = (raw: unknown, errorMsg = INVALID_STRIPE_ERROR): ParsedStripeProp => {
  if (isPromise(raw)) {
    return {
      tag: 'async',
      stripePromise: Promise.resolve(raw).then(result => validateStripe(result, errorMsg)),
    };
  }

  const stripe = validateStripe(raw, errorMsg);

  if (stripe === null) {
    return { tag: 'empty' };
  }

  return { tag: 'sync', stripe };
};

const isUnknownObject = (raw: unknown): raw is { [key in PropertyKey]: unknown } => {
  return raw !== null && typeof raw === 'object';
};

const isPromise = (raw: unknown): raw is PromiseLike<unknown> => {
  return isUnknownObject(raw) && typeof raw.then === 'function';
};

// We are using types to enforce the `stripe` prop in this lib,
// but in an untyped integration `stripe` could be anything, so we need
// to do some sanity validation to prevent type errors.
const isStripe = (raw: unknown): raw is Stripe => {
  return (
    isUnknownObject(raw) &&
    typeof raw.elements === 'function' &&
    typeof raw.createToken === 'function' &&
    typeof raw.createPaymentMethod === 'function' &&
    typeof raw.confirmCardPayment === 'function'
  );
};

const extractAllowedOptionsUpdates = (
  options: unknown | void,
  prevOptions: unknown | void,
  immutableKeys: string[],
): UnknownOptions | null => {
  if (!isUnknownObject(options)) {
    return null;
  }

  return Object.keys(options).reduce((newOptions: null | UnknownOptions, key) => {
    const isUpdated = !isUnknownObject(prevOptions) || !isEqual(options[key], prevOptions[key]);

    if (immutableKeys.includes(key)) {
      if (isUpdated) {
        console.warn(`Unsupported prop change: options.${key} is not a mutable property.`);
      }

      return newOptions;
    }

    if (!isUpdated) {
      return newOptions;
    }

    return { ...(newOptions || {}), [key]: options[key] };
  }, null);
};

const PLAIN_OBJECT_STR = '[object Object]';

const isEqual = (left: unknown, right: unknown): boolean => {
  if (!isUnknownObject(left) || !isUnknownObject(right)) {
    return left === right;
  }

  const leftArray = Array.isArray(left);
  const rightArray = Array.isArray(right);

  if (leftArray !== rightArray) {
    return false;
  }

  const leftPlainObject = Object.prototype.toString.call(left) === PLAIN_OBJECT_STR;
  const rightPlainObject = Object.prototype.toString.call(right) === PLAIN_OBJECT_STR;

  if (leftPlainObject !== rightPlainObject) {
    return false;
  }

  // not sure what sort of special object this is (regexp is one option), so
  // fallback to reference check.
  if (!leftPlainObject && !leftArray) {
    return left === right;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  const keySet: { [key: string]: boolean } = {};
  for (let i = 0; i < leftKeys.length; i += 1) {
    keySet[leftKeys[i]] = true;
  }
  for (let i = 0; i < rightKeys.length; i += 1) {
    keySet[rightKeys[i]] = true;
  }
  const allKeys = Object.keys(keySet);
  if (allKeys.length !== leftKeys.length) {
    return false;
  }

  const l = left;
  const r = right;
  const pred = (key: string): boolean => {
    return isEqual(l[key], r[key]);
  };

  return allKeys.every(pred);
};

const useStripe = (): Stripe | null => {
  const { stripe } = useElementsOrCheckoutSdkContextWithUseCase('calls useStripe()');
  return stripe;
};

const useElementsOrCheckoutSdkContextWithUseCase = (useCaseString: string): ElementsContextValue => {
  const elementsContext = React.useContext(ElementsContext);

  return parseElementsContext(elementsContext, useCaseString);
};

type UnknownCallback = (...args: unknown[]) => any;

interface PrivateElementProps {
  id?: string;
  className?: string;
  fallback?: ReactNode;
  onChange?: UnknownCallback;
  onBlur?: UnknownCallback;
  onFocus?: UnknownCallback;
  onEscape?: UnknownCallback;
  onReady?: UnknownCallback;
  onClick?: UnknownCallback;
  onLoadError?: UnknownCallback;
  onLoaderStart?: UnknownCallback;
  onNetworksChange?: UnknownCallback;
  onConfirm?: UnknownCallback;
  onCancel?: UnknownCallback;
  onShippingAddressChange?: UnknownCallback;
  onShippingRateChange?: UnknownCallback;
  options?: UnknownOptions;
}

const capitalized = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const createElementComponent = (type: StripeElementType, isServer: boolean): FunctionComponent<ElementProps> => {
  const displayName = `${capitalized(type)}Element`;

  const ClientElement: FunctionComponent<PrivateElementProps> = ({
    id,
    className,
    fallback,
    options = {},
    onBlur,
    onFocus,
    onReady,
    onChange,
    onEscape,
    onClick,
    onLoadError,
    onLoaderStart,
    onNetworksChange,
    onConfirm,
    onCancel,
    onShippingAddressChange,
    onShippingRateChange,
  }) => {
    const ctx = useElementsOrCheckoutSdkContextWithUseCase(`mounts <${displayName}>`);
    const elements = 'elements' in ctx ? ctx.elements : null;
    const [element, setElement] = React.useState<StripeElement | null>(null);
    const elementRef = React.useRef<StripeElement | null>(null);
    const domNode = React.useRef<HTMLDivElement | null>(null);
    const [isReady, setReady] = useState(false);

    // For every event where the merchant provides a callback, call element.on
    // with that callback. If the merchant ever changes the callback, removes
    // the old callback with element.off and then call element.on with the new one.
    useAttachEvent(element, 'blur', onBlur);
    useAttachEvent(element, 'focus', onFocus);
    useAttachEvent(element, 'escape', onEscape);
    useAttachEvent(element, 'click', onClick);
    useAttachEvent(element, 'loaderror', onLoadError);
    useAttachEvent(element, 'loaderstart', onLoaderStart);
    useAttachEvent(element, 'networkschange', onNetworksChange);
    useAttachEvent(element, 'confirm', onConfirm);
    useAttachEvent(element, 'cancel', onCancel);
    useAttachEvent(element, 'shippingaddresschange', onShippingAddressChange);
    useAttachEvent(element, 'shippingratechange', onShippingRateChange);
    useAttachEvent(element, 'change', onChange);

    let readyCallback: UnknownCallback | undefined;
    if (onReady) {
      // For other Elements, pass through the Element itself.
      readyCallback = () => {
        setReady(true);
        onReady(element);
      };
    }

    useAttachEvent(element, 'ready', readyCallback);

    React.useLayoutEffect(() => {
      if (elementRef.current === null && domNode.current !== null && elements) {
        let newElement: StripeElement | null = null;
        if (elements) {
          newElement = elements.create(type as any, options);
        }

        // Store element in a ref to ensure it's _immediately_ available in cleanup hooks in StrictMode
        elementRef.current = newElement;
        // Store element in state to facilitate event listener attachment
        setElement(newElement);

        if (newElement) {
          newElement.mount(domNode.current);
        }
      }
    }, [elements, options]);

    const prevOptions = usePrevious(options);
    React.useEffect(() => {
      if (!elementRef.current) {
        return;
      }

      const updates = extractAllowedOptionsUpdates(options, prevOptions, ['paymentRequest']);

      if (updates && 'update' in elementRef.current) {
        elementRef.current.update(updates);
      }
    }, [options, prevOptions]);

    React.useLayoutEffect(() => {
      return () => {
        if (elementRef.current && typeof elementRef.current.destroy === 'function') {
          try {
            elementRef.current.destroy();
            elementRef.current = null;
          } catch {
            // Do nothing
          }
        }
      };
    }, []);

    return (
      <>
        {!isReady && fallback}
        <div
          id={id}
          style={{
            height: isReady ? 'unset' : '0px',
            visibility: isReady ? 'visible' : 'hidden',
          }}
          className={className}
          ref={domNode}
        />
      </>
    );
  };

  // Only render the Element wrapper in a server environment.
  const ServerElement: FunctionComponent<PrivateElementProps> = props => {
    useElementsOrCheckoutSdkContextWithUseCase(`mounts <${displayName}>`);
    const { id, className } = props;
    return (
      <div
        id={id}
        className={className}
      />
    );
  };

  const Element = isServer ? ServerElement : ClientElement;
  Element.displayName = displayName;
  (Element as any).__elementType = type;

  return Element as FunctionComponent<ElementProps>;
};

const isServer = typeof window === 'undefined';
const PaymentElement: FunctionComponent<
  PaymentElementProps & {
    fallback?: ReactNode;
  }
> = createElementComponent('payment', isServer);

export { Elements, PaymentElement, useElements, useStripe };
