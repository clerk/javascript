import { describe, expect, it } from 'vitest';

import { isPromptSkipped } from '../one-tap-start';

describe('isPromptSkipped', () => {
  it('returns true when isSkippedMoment returns true', () => {
    expect(isPromptSkipped({ isSkippedMoment: () => true })).toBe(true);
  });

  it('returns true when getMomentType returns skipped', () => {
    expect(isPromptSkipped({ getMomentType: () => 'skipped' })).toBe(true);
  });

  it('returns false when getMomentType returns dismissed', () => {
    expect(isPromptSkipped({ getMomentType: () => 'dismissed' })).toBe(false);
  });

  it('returns false when no methods exist', () => {
    expect(isPromptSkipped({})).toBe(false);
  });

  it('prioritizes isSkippedMoment over getMomentType', () => {
    expect(
      isPromptSkipped({
        isSkippedMoment: () => true,
        getMomentType: () => 'dismissed',
      }),
    ).toBe(true);
  });
});
