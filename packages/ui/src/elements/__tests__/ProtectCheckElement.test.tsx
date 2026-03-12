import { PROTECT_CHECK_CONTAINER_ID } from '@clerk/shared/internal/clerk-js/constants';
import { describe, expect, it } from 'vitest';

import { render } from '@/test/utils';

import { ProtectCheckElement } from '../ProtectCheckElement';

describe('ProtectCheckElement', () => {
  it('renders a div with the correct id', () => {
    const { container } = render(<ProtectCheckElement />);
    const el = container.querySelector(`#${PROTECT_CHECK_CONTAINER_ID}`);
    expect(el).toBeTruthy();
    expect(el?.tagName).toBe('DIV');
  });

  it('renders with initial hidden styles', () => {
    const { container } = render(<ProtectCheckElement />);
    const el = container.querySelector(`#${PROTECT_CHECK_CONTAINER_ID}`) as HTMLElement;
    expect(el.style.display).toBe('block');
    expect(el.style.alignSelf).toBe('center');
    expect(el.style.maxHeight).toBe('0');
  });
});
