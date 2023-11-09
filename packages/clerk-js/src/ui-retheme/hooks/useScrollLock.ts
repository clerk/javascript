/**
 * Disables scroll for an element.
 * Adds extra padding to prevent layout shifting
 * caused by hiding the scrollbar.
 */
export const useScrollLock = <T extends HTMLElement>(el: T) => {
  let oldPaddingRightPx: string;
  let oldOverflow: string;

  const disableScroll = () => {
    oldPaddingRightPx = getComputedStyle(el).paddingRight;
    oldOverflow = getComputedStyle(el).overflow;
    const oldWidth = el.clientWidth;
    el.style.overflow = 'hidden';
    const currentWidth = el.clientWidth;
    const oldPaddingRight = Number.parseInt(oldPaddingRightPx.replace('px', ''));
    el.style.paddingRight = `${currentWidth - oldWidth + oldPaddingRight}px`;
  };

  const enableScroll = () => {
    el.style.overflow = oldOverflow;
    if (oldPaddingRightPx) {
      el.style.paddingRight = oldPaddingRightPx;
    }
  };

  return { disableScroll, enableScroll };
};
