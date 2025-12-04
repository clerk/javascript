// The following code is adapted from Floating UI
// Source: https://github.com/floating-ui/floating-ui/blob/c09c59d6e594c3527888a52ed0f3e8a2978663c2/packages/react/src/components/FloatingOverlay.tsx
// Copyright (c) Floating UI contributors
// SPDX-License-Identifier: MIT
// Avoid Chrome DevTools blue warning.
function getPlatform(): string {
  const uaData = (navigator as any).userAgentData as { platform: string } | undefined;

  if (uaData?.platform) {
    return uaData.platform;
  }

  return navigator.platform;
}

let lockCount = 0;
function enableScrollLock() {
  const isIOS = /iP(hone|ad|od)|iOS/.test(getPlatform());
  const bodyStyle = document.body.style;
  // RTL <body> scrollbar
  const scrollbarX =
    Math.round(document.documentElement.getBoundingClientRect().left) + document.documentElement.scrollLeft;
  const paddingProp = scrollbarX ? 'paddingLeft' : 'paddingRight';
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const scrollX = bodyStyle.left ? parseFloat(bodyStyle.left) : window.scrollX;
  const scrollY = bodyStyle.top ? parseFloat(bodyStyle.top) : window.scrollY;

  bodyStyle.overflow = 'hidden';

  if (scrollbarWidth) {
    bodyStyle[paddingProp] = `${scrollbarWidth}px`;
  }

  // Only iOS doesn't respect `overflow: hidden` on document.body, and this
  // technique has fewer side effects.
  if (isIOS) {
    // iOS 12 does not support `visualViewport`.
    const offsetLeft = window.visualViewport?.offsetLeft || 0;
    const offsetTop = window.visualViewport?.offsetTop || 0;

    Object.assign(bodyStyle, {
      position: 'fixed',
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: '0',
    });
  }

  return () => {
    Object.assign(bodyStyle, {
      overflow: '',
      [paddingProp]: '',
    });

    if (isIOS) {
      Object.assign(bodyStyle, {
        position: '',
        top: '',
        left: '',
        right: '',
      });
      window.scrollTo(scrollX, scrollY);
    }
  };
}

let cleanup = () => {};

export function useScrollLock() {
  return {
    enableScrollLock: () => {
      lockCount++;

      if (lockCount === 1) {
        cleanup = enableScrollLock();
      }
    },
    disableScrollLock: () => {
      lockCount--;
      if (lockCount === 0) {
        cleanup();
      }
    },
  };
}
