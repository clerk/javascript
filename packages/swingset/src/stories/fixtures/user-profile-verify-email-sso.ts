import { useEffect, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosText } from '@/lib/chaos';

const exampleConnection = {
  provider: 'Okta SSO',
  domain: 'acme.co',
  icon: { logo: 'okta' as const },
};

export function useUserProfileVerifyEmailSsoFixture({ failConnect = false } = {}) {
  const emailAddress = useChaosFixture('example@email.com', () => chaosEmail(0));
  const connection = useChaosFixture(exampleConnection, item => ({
    ...item,
    provider: chaosText(item.provider),
    domain: 'engineering.eu-west.very-long-company-name.example.com',
  }));
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
    emailAddress,
    connection,
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
