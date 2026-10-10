import { waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

export async function uploadFile(user: UserEvent, container: HTMLElement, file: File) {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('File input is missing');
  }
  await waitFor(() => expect(input).toBeEnabled());
  await user.upload(input, file);
  return input;
}
