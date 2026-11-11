export function restoreFocusRing(event: React.ChangeEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  if ((event.nativeEvent as MouseEvent).detail !== 0) {
    return;
  }
  if (document.activeElement !== input || input.matches(':focus-visible')) {
    return;
  }
  input.blur();
  input.focus({ preventScroll: true });
}
