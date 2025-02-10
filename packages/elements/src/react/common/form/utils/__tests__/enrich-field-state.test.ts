import { FIELD_STATES } from '../../types';
import { enrichFieldState } from '../enrich-field-state';

describe('enrichFieldState', () => {
  it('should return FIELD_STATES.error when validity is false', () => {
    const validity = { valid: false } as ValidityState;
    const fieldState = FIELD_STATES.success;
    const result = enrichFieldState(validity, fieldState);
    expect(result).toBe(FIELD_STATES.error);
  });

  it('should return the original fieldState when validity is true', () => {
    const validity = { valid: true } as ValidityState;
    const fieldState = FIELD_STATES.success;
    const result = enrichFieldState(validity, fieldState);
    expect(result).toBe(fieldState);
  });

  it('should return the original fieldState when validity is undefined', () => {
    const fieldState = FIELD_STATES.success;
    const result = enrichFieldState(undefined, fieldState);
    expect(result).toBe(fieldState);
  });
});
