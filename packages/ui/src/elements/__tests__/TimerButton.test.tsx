import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';

import { TimerButton } from '../TimerButton';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('TimerButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('renders as enabled when startDisabled is false', async () => {
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();
      render(<TimerButton onClick={mockOnClick}>Test Button</TimerButton>, { wrapper });

      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Test Button');
    });

    it('renders as disabled when startDisabled is true', async () => {
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();
      render(
        <TimerButton
          onClick={mockOnClick}
          startDisabled
          throttleTimeInSec={5}
        >
          Test Button
        </TimerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: /test button \(5\)/i });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Test Button (5)');
    });

    it('renders without counter when showCounter is false', async () => {
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();
      render(
        <TimerButton
          onClick={mockOnClick}
          startDisabled
          showCounter={false}
        >
          Test Button
        </TimerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Test Button');
      expect(button).not.toHaveTextContent('(');
    });
  });

  describe('Countdown Functionality', () => {
    it('counts down from throttleTimeInSec to 0 and enables button', async () => {
      vi.useFakeTimers();
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();

      render(
        <TimerButton
          onClick={mockOnClick}
          startDisabled
          throttleTimeInSec={3}
        >
          Test Button
        </TimerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button');

      // Initial state - disabled with countdown
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Test Button (3)');

      // After 1 second
      await act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Test Button (2)');

      // After 2 seconds
      await act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Test Button (1)');

      // After 3 seconds - should be enabled
      await act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Test Button');
    });

    it('handles custom throttle time correctly', async () => {
      vi.useFakeTimers();
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();

      render(
        <TimerButton
          onClick={mockOnClick}
          startDisabled
          throttleTimeInSec={5}
        >
          Test Button
        </TimerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button');

      expect(button).toHaveTextContent('Test Button (5)');

      await act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Test Button (1)');

      await act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Test Button');
    });
  });

  describe('Click Behavior', () => {
    it('calls onClick when button is enabled', async () => {
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();
      render(<TimerButton onClick={mockOnClick}>Test Button</TimerButton>, { wrapper });

      const button = screen.getByRole('button');
      await button.click();

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when button is disabled during countdown', async () => {
      vi.useFakeTimers();
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();

      render(
        <TimerButton
          onClick={mockOnClick}
          startDisabled
          throttleTimeInSec={3}
        >
          Test Button
        </TimerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button');

      await button.click();
      expect(mockOnClick).not.toHaveBeenCalled();

      await act(() => {
        vi.advanceTimersByTime(3000);
      });

      await button.click();
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('re-disables button and starts new countdown after click', async () => {
      vi.useFakeTimers();
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();

      render(
        <TimerButton
          onClick={mockOnClick}
          throttleTimeInSec={2}
        >
          Test Button
        </TimerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button');

      expect(button).not.toBeDisabled();

      await button.click();
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Test Button (2)');

      await act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Test Button');
    });
  });

  describe('External Disabled State', () => {
    it('remains disabled when isDisabled prop is true', async () => {
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();
      render(
        <TimerButton
          onClick={mockOnClick}
          isDisabled
        >
          Test Button
        </TimerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('combines internal countdown disabled state with external disabled state', async () => {
      vi.useFakeTimers();
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();

      render(
        <TimerButton
          onClick={mockOnClick}
          startDisabled
          isDisabled
          throttleTimeInSec={2}
        >
          Test Button
        </TimerButton>,
        { wrapper },
      );

      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Test Button (2)');

      await act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Test Button');
    });
  });

  describe('Cleanup', () => {
    it('clears interval on unmount', async () => {
      vi.useFakeTimers();
      const { wrapper } = await createFixtures();
      const mockOnClick = vi.fn();
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const { unmount } = render(
        <TimerButton
          onClick={mockOnClick}
          startDisabled
          throttleTimeInSec={5}
        >
          Test Button
        </TimerButton>,
        { wrapper },
      );

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });
});
