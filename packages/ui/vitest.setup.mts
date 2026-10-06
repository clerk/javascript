import { vi } from 'vitest';

vi.mock('@formkit/auto-animate/react', () => ({
  useAutoAnimate: () => [null],
}));

vi.mock('@formkit/auto-animate', () => ({
  default: () => ({ enable: () => {}, disable: () => {}, destroy: () => {} }),
}));
