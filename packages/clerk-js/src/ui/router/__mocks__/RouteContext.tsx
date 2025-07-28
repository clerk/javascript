import { noop } from '@clerk/shared/utils';
import { vi } from 'vitest';

export const useRouter = () => ({
  resolve: vi.fn(() => ({
    toURL: {
      href: 'http://test.host/test-href',
    },
  })),
  matches: vi.fn(noop),
  navigate: vi.fn(noop),
});
