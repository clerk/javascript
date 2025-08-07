import { execSync } from 'node:child_process';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import cli from '../cli.js';

// Mock execSync
vi.mocked(execSync);

describe('CLI', () => {
  /** @type {any} */
  let consoleSpy;
  /** @type {any} */
  let processExitSpy;
  /** @type {any} */
  let originalArgv;

  beforeEach(() => {
    // Mock console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };

    // Mock process.exit
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    // Store original argv
    originalArgv = process.argv;

    // Clear execSync mock
    vi.mocked(execSync).mockClear();
  });

  afterEach(() => {
    // Restore all mocks
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    processExitSpy.mockRestore();

    // Restore original argv
    process.argv = originalArgv;
  });

  describe('Invalid argument scenarios', () => {
    it('should show usage when no arguments provided', () => {
      process.argv = ['node', 'cli.js'];

      expect(() => cli()).toThrow('process.exit');
      expect(consoleSpy.log).toHaveBeenCalledWith('Usage: npx @clerk/ui add [...packages]');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should show usage when only one argument provided', () => {
      process.argv = ['node', 'cli.js', 'add'];

      expect(() => cli()).toThrow('process.exit');
      expect(consoleSpy.log).toHaveBeenCalledWith('Usage: npx @clerk/ui add [...packages]');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should show usage when wrong command provided', () => {
      process.argv = ['node', 'cli.js', 'install', 'button'];

      expect(() => cli()).toThrow('process.exit');
      expect(consoleSpy.log).toHaveBeenCalledWith('Usage: npx @clerk/ui add [...packages]');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should show usage when invalid command with multiple args', () => {
      process.argv = ['node', 'cli.js', 'remove', 'button', 'card'];

      expect(() => cli()).toThrow('process.exit');
      expect(consoleSpy.log).toHaveBeenCalledWith('Usage: npx @clerk/ui add [...packages]');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Package name validation', () => {
    it('should skip empty package names', () => {
      process.argv = ['node', 'cli.js', 'add', 'button', '', 'card'];
      vi.mocked(execSync).mockReturnValue('');

      cli();

      expect(vi.mocked(execSync)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(execSync)).toHaveBeenCalledWith('npx -y shadcn@latest add https://clerk.com/r/button.json', {
        stdio: 'inherit',
      });
      expect(vi.mocked(execSync)).toHaveBeenCalledWith('npx -y shadcn@latest add https://clerk.com/r/card.json', {
        stdio: 'inherit',
      });
    });

    it('should skip whitespace-only package names', () => {
      process.argv = ['node', 'cli.js', 'add', 'button', '   ', 'card'];
      vi.mocked(execSync).mockReturnValue('');

      cli();

      expect(vi.mocked(execSync)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(execSync)).toHaveBeenCalledWith('npx -y shadcn@latest add https://clerk.com/r/button.json', {
        stdio: 'inherit',
      });
      expect(vi.mocked(execSync)).toHaveBeenCalledWith('npx -y shadcn@latest add https://clerk.com/r/card.json', {
        stdio: 'inherit',
      });
    });

    it('should process valid package names with whitespace', () => {
      process.argv = ['node', 'cli.js', 'add', '  button  '];
      vi.mocked(execSync).mockReturnValue('');

      cli();

      expect(vi.mocked(execSync)).toHaveBeenCalledTimes(1);
      expect(vi.mocked(execSync)).toHaveBeenCalledWith('npx -y shadcn@latest add https://clerk.com/r/button.json', {
        stdio: 'inherit',
      });
    });
  });

  describe('URL construction correctness', () => {
    beforeEach(() => {
      vi.mocked(execSync).mockReturnValue('');
    });

    it('should construct correct URL for single package', () => {
      process.argv = ['node', 'cli.js', 'add', 'button'];

      cli();

      expect(vi.mocked(execSync)).toHaveBeenCalledWith('npx -y shadcn@latest add https://clerk.com/r/button.json', {
        stdio: 'inherit',
      });
    });

    it('should construct correct URLs for multiple packages', () => {
      process.argv = ['node', 'cli.js', 'add', 'button', 'card', 'dialog'];

      cli();

      expect(vi.mocked(execSync)).toHaveBeenCalledTimes(3);
      expect(vi.mocked(execSync)).toHaveBeenNthCalledWith(
        1,
        'npx -y shadcn@latest add https://clerk.com/r/button.json',
        { stdio: 'inherit' },
      );
      expect(vi.mocked(execSync)).toHaveBeenNthCalledWith(2, 'npx -y shadcn@latest add https://clerk.com/r/card.json', {
        stdio: 'inherit',
      });
      expect(vi.mocked(execSync)).toHaveBeenNthCalledWith(
        3,
        'npx -y shadcn@latest add https://clerk.com/r/dialog.json',
        { stdio: 'inherit' },
      );
    });

    it('should construct correct URL for package with special characters', () => {
      process.argv = ['node', 'cli.js', 'add', 'data-table'];

      cli();

      expect(vi.mocked(execSync)).toHaveBeenCalledWith('npx -y shadcn@latest add https://clerk.com/r/data-table.json', {
        stdio: 'inherit',
      });
    });

    it('should construct correct URL for package with numbers', () => {
      process.argv = ['node', 'cli.js', 'add', 'button2'];

      cli();

      expect(vi.mocked(execSync)).toHaveBeenCalledWith('npx -y shadcn@latest add https://clerk.com/r/button2.json', {
        stdio: 'inherit',
      });
    });
  });

  describe('Command execution', () => {
    it('should log component being added', () => {
      process.argv = ['node', 'cli.js', 'add', 'button'];
      vi.mocked(execSync).mockReturnValue('');

      cli();

      expect(consoleSpy.log).toHaveBeenCalledWith('Adding button component...');
    });

    it('should log multiple components being added', () => {
      process.argv = ['node', 'cli.js', 'add', 'button', 'card'];
      vi.mocked(execSync).mockReturnValue('');

      cli();

      expect(consoleSpy.log).toHaveBeenCalledWith('Adding button component...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Adding card component...');
    });

    it('should pass stdio: inherit option to execSync', () => {
      process.argv = ['node', 'cli.js', 'add', 'button'];
      vi.mocked(execSync).mockReturnValue('');

      cli();

      expect(vi.mocked(execSync)).toHaveBeenCalledWith('npx -y shadcn@latest add https://clerk.com/r/button.json', {
        stdio: 'inherit',
      });
    });
  });

  describe('Error handling', () => {
    it('should handle execSync errors gracefully', () => {
      process.argv = ['node', 'cli.js', 'add', 'nonexistent'];
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Command failed');
      });

      expect(() => cli()).toThrow('process.exit');

      expect(consoleSpy.error).toHaveBeenCalledWith('\nError: Failed to add component "nonexistent"');
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Could not fetch component from: https://clerk.com/r/nonexistent.json',
      );
      expect(consoleSpy.error).toHaveBeenCalledWith('Please ensure:');
      expect(consoleSpy.error).toHaveBeenCalledWith('  - The component name is correct');
      expect(consoleSpy.error).toHaveBeenCalledWith('  - You have internet connectivity');
      expect(consoleSpy.error).toHaveBeenCalledWith('  - The component exists at the specified URL');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should stop processing on first error', () => {
      process.argv = ['node', 'cli.js', 'add', 'button', 'nonexistent', 'card'];

      // Mock first call to succeed, second to fail
      vi.mocked(execSync)
        .mockReturnValueOnce('')
        .mockImplementationOnce(() => {
          throw new Error('Command failed');
        });

      expect(() => cli()).toThrow('process.exit');

      expect(vi.mocked(execSync)).toHaveBeenCalledTimes(2);
      expect(consoleSpy.log).toHaveBeenCalledWith('Adding button component...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Adding nonexistent component...');
      expect(consoleSpy.error).toHaveBeenCalledWith('\nError: Failed to add component "nonexistent"');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
