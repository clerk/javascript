import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

export async function openDialog(
  user: UserEvent,
  trigger: HTMLElement,
  options: { role?: 'dialog' | 'alertdialog'; name?: string } = {},
) {
  await user.click(trigger);
  const dialog = await screen.findByRole(options.role ?? 'dialog', { name: options.name });
  await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  return dialog;
}
