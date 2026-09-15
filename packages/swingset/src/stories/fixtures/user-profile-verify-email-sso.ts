import { useEffect, useState } from 'react';

export function useUserProfileVerifyEmailSsoFixture({ failConnect = false } = {}) {
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!isConnecting) {
      return;
    }
    const timer = setTimeout(() => {
      setIsConnecting(false);
      if (failConnect) {
        setErrorMessage('Unable to connect to Okta. Try again.');
      } else {
        setOpen(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [isConnecting, failConnect]);

  return {
    open,
    emailAddress: 'example@email.com',
    connection: {
      provider: 'Okta SSO',
      domain: 'acme.co',
      iconUrl: 'https://img.clerk.com/static/okta.svg',
    },
    isConnecting,
    errorMessage,
    onOpenChange: (value: boolean) => {
      setOpen(value);
      setIsConnecting(false);
      setErrorMessage(undefined);
    },
    onConnect: () => {
      setErrorMessage(undefined);
      setIsConnecting(true);
    },
  };
}
