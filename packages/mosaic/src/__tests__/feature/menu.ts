import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

export async function openMenu(user: UserEvent, trigger: HTMLElement) {
  await user.click(trigger);
  return screen.findByRole('menu');
}
