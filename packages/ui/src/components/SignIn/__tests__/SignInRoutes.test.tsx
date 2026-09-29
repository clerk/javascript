import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { SignIn } from '..';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignIn', () => {
  it('owns the protect check gate while mounted', async () => {
    const { wrapper, fixtures } = await createFixtures();
    const unregister = vi.fn();
    const register = vi.fn(() => unregister);
    fixtures.clerk.__internal_registerProtectCheckHandler = register;

    const { unmount } = render(<SignIn />, { wrapper });

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(['signIn']);
    expect(unregister).not.toHaveBeenCalled();
    unmount();
    expect(unregister).toHaveBeenCalledTimes(1);
  });
});
