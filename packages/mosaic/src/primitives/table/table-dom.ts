import { getComputedStyle } from '../utils/dom';

const NESTED_CONTROL_SELECTOR =
  'a[href], button, input, select, textarea, label, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [tabindex]:not(tr, td, th), [contenteditable]:not([contenteditable="false"])';

const TEXT_ENTRY_SELECTOR =
  'textarea, select, [contenteditable]:not([contenteditable="false"]), input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"], [type="range"], [type="color"], [type="file"], [type="image"])';

export interface TableLink {
  href: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
}

type LinkModifiers = Pick<MouseEvent, 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'>;

export function isOwnClick(event: React.MouseEvent<HTMLElement>) {
  const { target, currentTarget } = event;
  if (!(target instanceof Element) || !currentTarget.contains(target)) {
    return false;
  }
  const control = target.closest(NESTED_CONTROL_SELECTOR);
  return control === null || !currentTarget.contains(control);
}

export function isTextEntry(element: Element) {
  return element.matches(TEXT_ENTRY_SELECTOR);
}

export function isRtl(element: Element) {
  return getComputedStyle(element).direction === 'rtl';
}

export function focusIsInChildRows(row: HTMLTableRowElement) {
  const level = Number(row.getAttribute('aria-level'));
  const active = row.ownerDocument.activeElement;
  for (
    let next = row.nextElementSibling;
    next instanceof HTMLTableRowElement && Number(next.getAttribute('aria-level')) > level;
    next = next.nextElementSibling
  ) {
    if (next.contains(active)) {
      return true;
    }
  }
  return false;
}

export function openLink(from: Element, link: TableLink, modifiers: LinkModifiers) {
  const doc = from.ownerDocument;
  const anchor = doc.createElement('a');
  anchor.href = link.href;
  if (link.target) {
    anchor.target = link.target;
  }
  if (link.rel) {
    anchor.rel = link.rel;
  }
  if (link.download !== undefined && link.download !== false) {
    anchor.setAttribute('download', link.download === true ? '' : link.download);
  }
  doc.body.appendChild(anchor);
  anchor.dispatchEvent(linkActivationEvent(modifiers));
  anchor.remove();
}

function linkActivationEvent({ metaKey, ctrlKey, altKey, shiftKey }: LinkModifiers): Event {
  if (isMacWebKit()) {
    const init: KeyboardEventInit & { keyIdentifier: string } = {
      keyIdentifier: 'Enter',
      metaKey,
      ctrlKey,
      altKey,
      shiftKey,
    };
    return new KeyboardEvent('keydown', init);
  }
  return new MouseEvent('click', { metaKey, ctrlKey, altKey, shiftKey, bubbles: true, cancelable: true });
}

function isMacWebKit() {
  const { userAgent, platform, maxTouchPoints } = navigator;
  return /AppleWebKit/i.test(userAgent) && !/Chrome/i.test(userAgent) && /^Mac/i.test(platform) && maxTouchPoints < 2;
}
