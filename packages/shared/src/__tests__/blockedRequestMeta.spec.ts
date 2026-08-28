import { describe, expect, it } from 'vitest';

import { ClerkAPIError } from '../errors/clerkApiError';
import { errorToJSON } from '../errors/parseError';

// The details shown on the blocked-request screen ride on the error's meta.
// Both directions of the mapping have an exhaustive field list, so a field
// added to one and not the other is dropped silently — which reads as "the
// application configured no message" rather than as a bug.
describe('blocked request error meta', () => {
  const json = {
    code: 'action_blocked',
    message: 'Action blocked',
    long_message: 'This action was detected as suspicious and has been blocked.',
    meta: {
      trace_id: '7Q8ikxgt',
      kind: 'vpn_detected',
      title: 'We could not verify this sign-in',
      description: 'Try again from a different network.',
      link_url: 'https://help.example.com/blocked?ref=7Q8ikxgt',
      link_text: 'Contact support',
      data: { region: 'EU', retryAfter: 3600, appeal: true },
    },
  };

  it('parses every field off the wire', () => {
    const error = new ClerkAPIError(json as any);
    expect(error.meta).toMatchObject({
      traceId: '7Q8ikxgt',
      kind: 'vpn_detected',
      title: 'We could not verify this sign-in',
      description: 'Try again from a different network.',
      linkUrl: 'https://help.example.com/blocked?ref=7Q8ikxgt',
      linkText: 'Contact support',
      data: { region: 'EU', retryAfter: 3600, appeal: true },
    });
  });

  // errorToJSON backs __internal_toSnapshot, so this is the SSR/hydration path:
  // without it the screen loses its message and reference after rehydration and
  // silently degrades to the generic wording.
  it('survives a snapshot round trip', () => {
    const roundTripped = new ClerkAPIError(errorToJSON(new ClerkAPIError(json as any)) as any);
    expect(roundTripped.meta).toMatchObject({
      traceId: '7Q8ikxgt',
      kind: 'vpn_detected',
      title: 'We could not verify this sign-in',
      description: 'Try again from a different network.',
      linkUrl: 'https://help.example.com/blocked?ref=7Q8ikxgt',
      linkText: 'Contact support',
      data: { region: 'EU', retryAfter: 3600, appeal: true },
    });
  });

  it('leaves an error without these fields alone', () => {
    const error = new ClerkAPIError({ code: 'form_param_nil', message: 'x', meta: { param_name: 'email' } } as any);
    expect(error.meta.traceId).toBeUndefined();
    expect(errorToJSON(error).meta?.trace_id).toBeUndefined();
  });
});
