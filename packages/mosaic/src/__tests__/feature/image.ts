import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

export async function imageFile(name: string, { width = 200, height = 100, type = 'image/png' } = {}): Promise<File> {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('expected a 2D canvas');
  }
  context.fillStyle = 'rgb(255 0 0)';
  context.fillRect(0, 0, width, height);
  const blob = await canvas.convertToBlob({ type });
  return new File([blob], name, { type });
}

export async function saveCrop(actor: UserEvent, title: string): Promise<void> {
  const dialog = await screen.findByRole('dialog', { name: title });
  await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Rotate' })).toBeEnabled());
  await actor.click(within(dialog).getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(dialog).not.toBeInTheDocument());
}
