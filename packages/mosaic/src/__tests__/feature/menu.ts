import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

export async function openMenu(user: UserEvent, trigger: HTMLElement) {
  await user.click(trigger);
  const menu = await screen.findByRole('menu');
  await new Promise(requestAnimationFrame);
  return menu;
}
