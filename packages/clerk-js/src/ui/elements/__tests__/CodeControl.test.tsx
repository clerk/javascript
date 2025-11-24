import { ClerkRuntimeError } from '@clerk/shared/error';
import { render, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';

import { OTPCodeControl, OTPRoot, useFieldOTP } from '../CodeControl';
import { withCardStateProvider } from '../contexts';

const { createFixtures } = bindCreateFixtures('UserProfile');

// Mock the sleep utility
vi.mock('@/ui/utils/sleep', () => ({
  sleep: vi.fn(() => Promise.resolve()),
}));

// Helper to create a test component with OTP functionality
const createOTPComponent = (
  onCodeEntryFinished: (code: string, resolve: any, reject: any) => void,
  onResendCodeClicked?: () => void,
  _options?: { length?: number },
) => {
  const MockOTPWrapper = withCardStateProvider(() => {
    const otpField = useFieldOTP({
      onCodeEntryFinished,
      onResendCodeClicked,
    });

    return (
      <OTPRoot
        otpControl={otpField.otpControl}
        isLoading={otpField.isLoading}
        onResendCode={otpField.onResendCode}
      >
        <OTPCodeControl />
      </OTPRoot>
    );
  });

  return MockOTPWrapper;
};

const label = 'Enter verification code';
const testId = 'otp-input-segment';

const typeCode = async (input: HTMLElement, user: UserEvent, code = '123456') => {
  await user.click(input);
  await user.keyboard(code);
};

describe('CodeControl', () => {
  describe('OTPCodeControl', () => {
    it('renders 6 "fake" input fields by default', async () => {
      const { wrapper } = await createFixtures();
      const onCodeEntryFinished = vi.fn();
      const Component = createOTPComponent(onCodeEntryFinished);

      const { getAllByTestId } = render(<Component />, { wrapper });
      const inputDivs = getAllByTestId(testId);

      expect(inputDivs).toHaveLength(6);
    });

    it('renders a transparent input for password manager compatibility', async () => {
      const { wrapper } = await createFixtures();
      const onCodeEntryFinished = vi.fn();
      const Component = createOTPComponent(onCodeEntryFinished);

      const { getByLabelText } = render(<Component />, { wrapper });
      const input = getByLabelText(label);

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-label', label);
      expect(input).toHaveAttribute('autoComplete', 'one-time-code');
      expect(input).toHaveAttribute('inputMode', 'numeric');
      expect(input).toHaveAttribute('pattern', '^\\d+$');
      expect(input).toHaveAttribute('maxLength', '6');
    });

    it('allows typing single digits in sequence', async () => {
      const { wrapper } = await createFixtures();
      const onCodeEntryFinished = vi.fn();
      const Component = createOTPComponent(onCodeEntryFinished);

      const { getAllByTestId, getByLabelText } = render(<Component />, { wrapper });
      const user = userEvent.setup();

      const input = getByLabelText(label);
      await user.click(input);
      await user.keyboard('123');

      const inputDivs = getAllByTestId(testId);

      expect(inputDivs[0]).toHaveTextContent('1');
      expect(inputDivs[1]).toHaveTextContent('2');
      expect(inputDivs[2]).toHaveTextContent('3');
      expect(inputDivs[3]).toHaveAttribute('data-focus-within', 'true');
      expect(inputDivs[4]).toBeEmptyDOMElement();
      expect(inputDivs[5]).toBeEmptyDOMElement();
    });

    it('calls onCodeEntryFinished when all 6 digits are entered', async () => {
      const { wrapper } = await createFixtures();
      const onCodeEntryFinished = vi.fn();
      const Component = createOTPComponent(onCodeEntryFinished);

      const { getByLabelText } = render(<Component />, { wrapper });
      const user = userEvent.setup();
      const input = getByLabelText(label);

      await typeCode(input, user);

      await waitFor(() => {
        expect(onCodeEntryFinished).toHaveBeenCalledWith('123456', expect.any(Function), expect.any(Function));
      });
    });

    it('handles paste operations correctly', async () => {
      const { wrapper } = await createFixtures();
      const onCodeEntryFinished = vi.fn();
      const Component = createOTPComponent(onCodeEntryFinished);

      const { getAllByTestId, getByLabelText } = render(<Component />, { wrapper });
      const user = userEvent.setup();

      const input = getByLabelText(label);
      const inputDivs = getAllByTestId(testId);

      await user.click(input);
      await user.paste('123456');
      await waitFor(() => {
        expect(inputDivs[0]).toHaveTextContent('1');
        expect(inputDivs[1]).toHaveTextContent('2');
        expect(inputDivs[2]).toHaveTextContent('3');
        expect(inputDivs[3]).toHaveTextContent('4');
        expect(inputDivs[4]).toHaveTextContent('5');
        expect(inputDivs[5]).toHaveTextContent('6');
      });
    });

    it('handles backspace to clear current field and move to previous', async () => {
      const { wrapper } = await createFixtures();
      const onCodeEntryFinished = vi.fn();
      const Component = createOTPComponent(onCodeEntryFinished);

      const { getAllByTestId, getByLabelText } = render(<Component />, { wrapper });
      const user = userEvent.setup();

      const input = getByLabelText(label);
      const inputDivs = getAllByTestId(testId);

      // Type some digits
      await typeCode(input, user, '123{Backspace}');

      expect(inputDivs[0]).toHaveTextContent('1');
      expect(inputDivs[1]).toHaveTextContent('2');
      expect(inputDivs[2]).toHaveAttribute('data-focus-within', 'true');
    });

    it('prevents space input', async () => {
      const { wrapper } = await createFixtures();
      const onCodeEntryFinished = vi.fn();
      const Component = createOTPComponent(onCodeEntryFinished);

      const { getAllByTestId, getByLabelText } = render(<Component />, { wrapper });
      const user = userEvent.setup();

      const input = getByLabelText(label);
      const inputDivs = getAllByTestId(testId);

      await typeCode(input, user, '{Space}');

      expect(input).toHaveValue('');
      expect(inputDivs[0]).toHaveAttribute('data-focus-within', 'true');
      expect(inputDivs[1]).toBeEmptyDOMElement();
      expect(inputDivs[2]).toBeEmptyDOMElement();
      expect(inputDivs[3]).toBeEmptyDOMElement();
      expect(inputDivs[4]).toBeEmptyDOMElement();
      expect(inputDivs[5]).toBeEmptyDOMElement();
    });

    it('filters non-numeric characters in autofill', async () => {
      const { wrapper } = await createFixtures();
      const onCodeEntryFinished = vi.fn();
      const Component = createOTPComponent(onCodeEntryFinished);

      const { getAllByTestId, getByLabelText } = render(<Component />, { wrapper });
      const user = userEvent.setup();

      const input = getByLabelText(label);

      await user.click(input);
      await user.paste('1a2b3c');

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      await user.paste('123456');

      await waitFor(() => {
        expect(input).toHaveValue('123456');
      });

      const inputDivs = getAllByTestId(testId);
      await waitFor(() => {
        expect(inputDivs[0]).toHaveTextContent('1');
        expect(inputDivs[1]).toHaveTextContent('2');
        expect(inputDivs[2]).toHaveTextContent('3');
        expect(inputDivs[3]).toHaveTextContent('4');
        expect(inputDivs[4]).toHaveTextContent('5');
        expect(inputDivs[5]).toHaveTextContent('6');
      });
    });
  });

  describe('useFieldOTP hook', () => {
    it('handles successful code entry', async () => {
      const { wrapper } = await createFixtures();
      const onCodeEntryFinished = vi.fn((_code, resolve) => {
        resolve('success');
      });

      const Component = createOTPComponent(onCodeEntryFinished);

      const { getByLabelText } = render(<Component />, { wrapper });
      const user = userEvent.setup();
      const input = getByLabelText(label);

      await typeCode(input, user);
      await waitFor(() => {
        expect(onCodeEntryFinished).toHaveBeenCalledWith('123456', expect.any(Function), expect.any(Function));
      });
    });

    it('handles code entry errors', async () => {
      const { wrapper } = await createFixtures();

      const onCodeEntryFinished = vi.fn((_, __, reject) => {
        // Simulate synchronous error handling - just call reject
        const error = new ClerkRuntimeError('Invalid code', { code: 'invalid_code' });
        reject(error);
      });

      const Component = createOTPComponent(onCodeEntryFinished);

      const { getByLabelText } = render(<Component />, { wrapper });
      const user = userEvent.setup();
      const input = getByLabelText(label);

      await typeCode(input, user);
      await waitFor(() => {
        expect(onCodeEntryFinished).toHaveBeenCalledWith('123456', expect.any(Function), expect.any(Function));
      });
    });
  });
});
