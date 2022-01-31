import { renderHook } from '@clerk/shared/testUtils';
import { useDomRef } from './useDomRef';

describe('useDomRef(querySelector)', () => {
  beforeAll(() => {
    const nav = document.createElement('nav');
    nav.innerHTML = `
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>`;
    document.body.appendChild(nav);
  });

  it('returns the matching dom element', () => {
    const { result } = renderHook(() => useDomRef('nav li'));
    expect(result.current.current.innerHTML).toBe('Item 1');
  });
});
