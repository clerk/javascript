import { waitForElement } from '@clerk/shared/dom';
import { CAPTCHA_ELEMENT_ID, CAPTCHA_INVISIBLE_CLASSNAME } from '@clerk/shared/internal/clerk-js/constants';
import type { CaptchaWidgetType } from '@clerk/shared/types';

import type { CaptchaOptions } from './types';

export type CaptchaContainerType = 'invisible' | 'modal' | 'smart';

export type CaptchaContainerAttributes = {
  theme?: string;
  language?: string;
  size?: string;
};

export type ResolvedCaptchaContainer = {
  containerSelector: string;
  containerType: CaptchaContainerType;
  /** The site key the provider should render with (smart/modal use siteKey, invisible falls back to invisibleSiteKey). */
  effectiveSiteKey: string;
  /** What the backend should be told the token was minted from. */
  captchaWidgetType: CaptchaWidgetType;
  attributes: CaptchaContainerAttributes;
};

// Auth flows should fail fast rather than hang if Clerk's modal never mounts the container.
const MODAL_CONTAINER_TIMEOUT_MS = 5000;

// Per-instance suffix for invisible containers so concurrent challenges don't render into or
// remove each other's nodes.
let invisibleContainerCounter = 0;
const nextInvisibleContainerId = () => `${CAPTCHA_INVISIBLE_CLASSNAME}-${Date.now()}-${++invisibleContainerCounter}`;

function readContainerAttributes(element: Element): CaptchaContainerAttributes {
  try {
    const el = element as HTMLElement;
    return {
      theme: el.getAttribute('data-cl-theme') || undefined,
      language: el.getAttribute('data-cl-language') || undefined,
      size: el.getAttribute('data-cl-size') || undefined,
    };
  } catch {
    return { theme: undefined, language: undefined, size: undefined };
  }
}

/**
 * Decides which DOM container to render the CAPTCHA into. The decision tree is shared between
 * every CAPTCHA provider so the surface a provider must implement stays a thin render(element, options)
 * call and any provider-specific styling.
 *
 * Order of precedence: modal > smart > invisible. Smart falls back to invisible when the consumer
 * has not mounted a `#clerk-captcha` element.
 *
 * Side effects: opens the modal (when modal selectors are passed) and appends a hidden
 * per-instance invisible container to the body for the invisible flow. Both are reverted by
 * {@link cleanupCaptchaContainer}.
 */
export const resolveCaptchaContainer = async (opts: CaptchaOptions): Promise<ResolvedCaptchaContainer> => {
  const { modalContainerQuerySelector, modalWrapperQuerySelector, openModal } = opts;

  // modal: an invisible widget rendered inside Clerk's modal — it will only escalate to interactive if needed.
  if (modalContainerQuerySelector && modalWrapperQuerySelector) {
    try {
      await openModal?.();
    } catch {
      // When a client is captcha_block the first attempt to open the modal will fail with
      // 'ClerkJS components are not ready yet.' (initComponents races the first /client response).
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw { captchaError: 'modal_component_not_ready' };
    }
    // waitForElement never rejects, so race it against a timeout to keep the auth flow from hanging.
    const el = await Promise.race<Element | null>([
      waitForElement(modalContainerQuerySelector),
      new Promise<null>(resolve => setTimeout(() => resolve(null), MODAL_CONTAINER_TIMEOUT_MS)),
    ]);
    if (!el) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw { captchaError: 'modal_container_not_found' };
    }
    return {
      containerSelector: modalContainerQuerySelector,
      containerType: 'modal',
      effectiveSiteKey: opts.siteKey,
      captchaWidgetType: opts.widgetType,
      attributes: readContainerAttributes(el),
    };
  }

  // smart: render into the consumer-provided #clerk-captcha element when present.
  if (opts.widgetType === 'smart') {
    const visibleDiv = document.getElementById(CAPTCHA_ELEMENT_ID);
    if (visibleDiv) {
      return {
        containerSelector: `#${CAPTCHA_ELEMENT_ID}`,
        containerType: 'smart',
        effectiveSiteKey: opts.siteKey,
        captchaWidgetType: 'smart',
        attributes: readContainerAttributes(visibleDiv),
      };
    }
    console.error(
      'Cannot initialize Smart CAPTCHA widget because the `clerk-captcha` DOM element was not found; falling back to Invisible CAPTCHA widget. If you are using a custom flow, visit https://clerk.com/docs/guides/development/custom-flows/authentication/bot-sign-up-protection for instructions',
    );
  }

  // invisible (default + smart fallback): create a hidden throwaway container with a unique id so
  // concurrent challenges resolve to their own node.
  const containerId = nextInvisibleContainerId();
  const div = document.createElement('div');
  div.id = containerId;
  div.classList.add(CAPTCHA_INVISIBLE_CLASSNAME);
  div.style.display = 'none';
  document.body.appendChild(div);
  return {
    containerSelector: `#${containerId}`,
    containerType: 'invisible',
    effectiveSiteKey: opts.invisibleSiteKey,
    captchaWidgetType: 'invisible',
    attributes: {},
  };
};

/**
 * Reverts the DOM side effects of {@link resolveCaptchaContainer}. The smart container is owned by
 * the consumer (we leave it in place); provider-specific style mutations should be cleaned up by
 * the caller before invoking this. `containerSelector` is required for invisible containers so
 * the right per-instance node is removed when challenges run concurrently.
 */
export const cleanupCaptchaContainer = (
  containerType: CaptchaContainerType,
  opts: Pick<CaptchaOptions, 'closeModal'>,
  containerSelector?: string,
) => {
  if (containerType === 'modal') {
    opts.closeModal?.();
    return;
  }
  if (containerType === 'invisible' && containerSelector) {
    const invisibleWidget = document.querySelector(containerSelector);
    if (invisibleWidget && invisibleWidget.parentNode === document.body) {
      document.body.removeChild(invisibleWidget);
    }
  }
};
