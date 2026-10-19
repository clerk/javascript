import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { SubmitButton } from '../submit-button';

it('keeps the pending action at full opacity while other disabled actions stay dimmed', () => {
  render(
    <>
      <SubmitButton
        isPending
        spinDelay={{ delay: 0 }}
      >
        Save
      </SubmitButton>
      <SubmitButton disabled>Cancel</SubmitButton>
    </>,
  );

  expect(screen.getByRole('button', { name: 'Save' })).toHaveStyle({ opacity: '1' });
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveStyle({ opacity: '0.5' });
  expect(screen.getByRole('progressbar')).toBeVisible();
});
