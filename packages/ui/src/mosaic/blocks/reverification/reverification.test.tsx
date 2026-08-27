import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { Reverification } from './reverification';

describe('Reverification', () => {
  it('renders the interaction without owning a dialog', async () => {
    const onSelectMethod = vi.fn();
    render(
      <MosaicProvider>
        <Reverification
          step='choose'
          methods={[{ id: 'password', label: 'Continue with your password' }]}
          onSelectMethod={onSelectMethod}
        />
      </MosaicProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continue with your password' }));
    expect(onSelectMethod).toHaveBeenCalledWith('password');
  });

  it('submits a standalone field with Enter', async () => {
    const onSubmit = vi.fn();
    render(
      <MosaicProvider>
        <Reverification
          step='verify'
          field={{ label: 'Password', kind: 'password', value: '', disabled: false, onChange: vi.fn() }}
          canSubmit
          isPending={false}
          onSubmit={onSubmit}
        />
      </MosaicProvider>,
    );

    await userEvent.setup().type(screen.getByLabelText('Password'), '{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
