import React from 'react';

//
// To be used along with the following rules
//
// body:not([data-focus-keyboard-active]) {
//   :focus {
//     outline: none;
//   }

//   :-moz-focusring {
//     outline: none;
//   }
// }

// body[data-focus-keyboard-active] {
//   :focus {
//     @include outline();
//   }

//   :-moz-focusring {
//     @include outline();
//   }
// }

const KB_FOCUS_ACTIVE = 'data-focus-keyboard-active';

function removeKeyboardFocusActive() {
  if (document.body.hasAttribute(KB_FOCUS_ACTIVE)) {
    document.body.removeAttribute(KB_FOCUS_ACTIVE);
  }
}

function addKeyboardFocusActive(e: KeyboardEvent) {
  const TAB = 9;
  if (e.keyCode === TAB) {
    document.body.setAttribute(KB_FOCUS_ACTIVE, 'true');
  }
}

function attach() {
  document.addEventListener('click', removeKeyboardFocusActive);
  document.addEventListener('mousedown', removeKeyboardFocusActive);
  document.addEventListener('mouseup', removeKeyboardFocusActive);
  document.addEventListener('pointerdown', removeKeyboardFocusActive);
  document.addEventListener('pointerup', removeKeyboardFocusActive);
  document.addEventListener('touchstart', removeKeyboardFocusActive);
  document.addEventListener('touchend', removeKeyboardFocusActive);

  document.body.addEventListener('keydown', addKeyboardFocusActive);
  document.body.addEventListener('keyup', addKeyboardFocusActive);
  document.body.addEventListener('keypress', addKeyboardFocusActive);
}

function dettach() {
  document.removeEventListener('click', removeKeyboardFocusActive);
  document.removeEventListener('mousedown', removeKeyboardFocusActive);
  document.removeEventListener('mouseup', removeKeyboardFocusActive);
  document.removeEventListener('pointerdown', removeKeyboardFocusActive);
  document.removeEventListener('pointerup', removeKeyboardFocusActive);
  document.removeEventListener('touchstart', removeKeyboardFocusActive);
  document.removeEventListener('touchend', removeKeyboardFocusActive);

  document.body.removeEventListener('keydown', addKeyboardFocusActive);
  document.body.removeEventListener('keyup', addKeyboardFocusActive);
  document.body.removeEventListener('keypress', addKeyboardFocusActive);
}

export type OutlineProps = {
  children: React.ReactNode;
};

export function Outline({ children }: OutlineProps): JSX.Element {
  React.useEffect(() => {
    attach();
    return () => dettach();
  }, []);
  return <>{children}</>;
}
