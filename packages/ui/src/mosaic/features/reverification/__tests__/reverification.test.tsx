import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Reverification } from '../reverification';
import type { ReverificationController } from '../reverification.controller';
import type { ReverificationModel } from '../reverification.model';

const model: ReverificationModel = {
  status: 'ready',
  isActive: true,
  supportEmail: '',
  start: vi.fn(),
  prepare: vi.fn(),
  attempt: vi.fn(),
  verifyPasskey: vi.fn(),
  finish: vi.fn(),
  cancel: vi.fn(),
};

let controller: ReverificationController = { status: 'idle' };

vi.mock('../reverification.model', () => ({
  useReverificationModel: () => model,
}));

vi.mock('../reverification.controller', () => ({
  useReverificationController: () => controller,
}));

describe('Reverification', () => {
  it('renders nothing when reverification is not active', () => {
    const { container } = render(
      <Reverification isActive={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while the controller is loading, unavailable, or ready', () => {
    controller = { status: 'loading' };
    const active = {
      isActive: true as const,
      complete: vi.fn(),
      cancel: vi.fn(),
      level: 'first_factor' as const,
    };

    const loading = render(<Reverification {...active} />);
    expect(loading.container).toBeEmptyDOMElement();

    controller = { status: 'unavailable' };
    const unavailable = render(<Reverification {...active} />);
    expect(unavailable.container).toBeEmptyDOMElement();

    controller = { status: 'ready' } as ReverificationController;
    const ready = render(<Reverification {...active} />);
    expect(ready.container).toBeEmptyDOMElement();

    controller = { status: 'idle' };
  });
});
