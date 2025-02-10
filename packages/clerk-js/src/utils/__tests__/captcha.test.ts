import { shouldRetryTurnstileErrorCode } from '../captcha/turnstile';

describe('shouldRetryTurnstileErrorCode', () => {
  it.each([
    ['crashed', true],
    ['undefined_error', true],
    ['102', true],
    ['102xxx', true],
    ['102002', true],
    ['103xxx', true],
    ['104xxx', true],
    ['106xxx', true],
    ['110600', true],
    ['300xxx', true],
    ['600xxx', true],
    ['200010', false],
    ['100405', false],
    ['105001', false],
    ['110430', false],
  ])('should the error code %s trigger a retry: %s', (str, expected) => {
    expect(shouldRetryTurnstileErrorCode(str)).toBe(expected);
  });
});
