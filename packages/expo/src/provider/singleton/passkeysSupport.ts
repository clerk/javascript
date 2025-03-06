import type { BrowserClerk, HeadlessBrowserClerk } from '@clerk/clerk-react';
import type {
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
} from '@clerk/types';

import { errorThrower } from '../../errorThrower';
import type { BuildClerkOptions } from './types';

type PasskeysSupportParams = {
  passkeys?: BuildClerkOptions['__experimental_passkeys'];
  __internal_clerk: HeadlessBrowserClerk | BrowserClerk;
};

// Experimental Passkeys Support
export const __experimental_enablePasskeysSupport = ({ __internal_clerk, passkeys }: PasskeysSupportParams): void => {
  // @ts-expect-error - This is an internal API
  __internal_clerk.__internal_createPublicCredentials = (
    publicKeyCredential: PublicKeyCredentialCreationOptionsWithoutExtensions,
  ) => {
    return passkeys?.create
      ? passkeys?.create(publicKeyCredential)
      : errorThrower.throw('create() for passkeys is missing');
  };

  // @ts-expect-error - This is an internal API
  __internal_clerk.__internal_getPublicCredentials = ({
    publicKeyOptions,
  }: {
    publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions;
  }) => {
    return passkeys?.get ? passkeys.get({ publicKeyOptions }) : errorThrower.throw('get() for passkeys is missing');
  };
  // @ts-expect-error - This is an internal API
  __internal_clerk.__internal_isWebAuthnSupported = () => {
    return passkeys?.isSupported ? passkeys.isSupported() : errorThrower.throw('isSupported() for passkeys is missing');
  };

  // @ts-expect-error - This is an internal API
  __internal_clerk.__internal_isWebAuthnAutofillSupported = () => {
    return passkeys?.isAutoFillSupported
      ? passkeys.isAutoFillSupported()
      : errorThrower.throw('isSupported() for passkeys is missing');
  };

  // @ts-expect-error - This is an internal API
  __internal_clerk.__internal_isWebAuthnPlatformAuthenticatorSupported = () => {
    return Promise.resolve(true);
  };
};
