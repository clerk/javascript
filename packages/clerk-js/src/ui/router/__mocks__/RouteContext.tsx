import { noop } from '@clerk/shared/utils';

export const useRouter = () => ({
  resolve: jest.fn(() => ({
    toURL: {
      href: 'http://test.host/test-href',
    },
  })),
  matches: jest.fn(noop),
  navigate: jest.fn(noop),
});
