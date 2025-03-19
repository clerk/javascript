import { isWebAuthnAutofillSupported } from '@clerk/shared/webauthn';
import { useEffect, useState } from 'react';

import { useEnvironment } from '../../contexts';
import { useRouter } from '../../router';
import { useHandleAuthenticateWithPasskey } from './shared';

export const useAutoFillPasskey = () => {
  const [isSupported, setIsSupported] = useState(false);
  const { navigate } = useRouter();
  const onSecondFactor = () => navigate('factor-two');
  const authenticateWithPasskey = useHandleAuthenticateWithPasskey(onSecondFactor);
  const { userSettings } = useEnvironment();
  const { passkeySettings, attributes } = userSettings;

  useEffect(() => {
    async function runAutofillPasskey() {
      const _isSupported = await isWebAuthnAutofillSupported();
      setIsSupported(_isSupported);
      if (!_isSupported) {
        return;
      }

      await authenticateWithPasskey({ flow: 'autofill' });
    }

    if (passkeySettings.allow_autofill && attributes.passkey.enabled) {
      runAutofillPasskey();
    }
  }, []);

  return {
    isWebAuthnAutofillSupported: isSupported,
  };
};
