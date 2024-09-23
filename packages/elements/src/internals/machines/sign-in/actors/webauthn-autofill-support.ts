import { isWebAuthnAutofillSupported } from '@clerk/shared/webauthn';
import { fromPromise } from 'xstate';

export const webAuthnAutofillSupport = fromPromise(() => isWebAuthnAutofillSupported());
