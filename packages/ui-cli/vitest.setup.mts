import { vi } from 'vitest';

// Mock execSync to prevent actual command execution during tests
vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));