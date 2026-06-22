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
 * `.clerk-invisible-captcha` div to the body for the invisible flow. Both are reverted by
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
    const el = await waitForElement(modalContainerQuerySelector);
    return {
      containerSelector: modalContainerQuerySelector,
      containerType: 'modal',
      effectiveSiteKey: opts.siteKey,
      captchaWidgetType: opts.widgetType,
      attributes: el ? readContainerAttributes(el) : {},
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

  // invisible (default + smart fallback): create a hidden throwaway container.
  const div = document.createElement('div');
  div.classList.add(CAPTCHA_INVISIBLE_CLASSNAME);
  div.style.display = 'none';
  document.body.appendChild(div);
  return {
    containerSelector: `.${CAPTCHA_INVISIBLE_CLASSNAME}`,
    containerType: 'invisible',
    effectiveSiteKey: opts.invisibleSiteKey,
    captchaWidgetType: 'invisible',
    attributes: {},
  };
};

/**
 * Reverts the DOM side effects of {@link resolveCaptchaContainer}. The smart container is owned by
 * the consumer (we leave it in place); provider-specific style mutations should be cleaned up by
 * the caller before invoking this.
 */
export const cleanupCaptchaContainer = (
  containerType: CaptchaContainerType,
  opts: Pick<CaptchaOptions, 'closeModal'>,
) => {
  if (containerType === 'modal') {
    opts.closeModal?.();
    return;
  }
  if (containerType === 'invisible') {
    const invisibleWidget = document.querySelector(`.${CAPTCHA_INVISIBLE_CLASSNAME}`);
    if (invisibleWidget && invisibleWidget.parentNode === document.body) {
      document.body.removeChild(invisibleWidget);
    }
  }
};
