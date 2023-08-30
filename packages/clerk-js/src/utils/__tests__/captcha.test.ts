import { shouldRetryTurnstileErrorCode } from '../captcha';

describe('wow', () => {
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
    ['300100', true],
    ['600xxx', true],
    ['200010', false],
    ['100405', false],
    ['105001', false],
    ['110430', false],
  ])('validates the frontendApi format', (str, expected) => {
    expect(shouldRetryTurnstileErrorCode(str)).toBe(expected);
  });
});
