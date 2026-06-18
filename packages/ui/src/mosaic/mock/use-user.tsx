import { useEffect, useState } from 'react';

import { delay, LOAD_DELAY_MS, MUTATION_DELAY_MS } from './organization-store';
import GradientAvatar from '../components/mock/gradient-1.jpg';

export interface MockEmail {
  id: string;
  address: string;
  isPrimary: boolean;
}

export interface MockPhone {
  id: string;
  number: string;
  isPrimary: boolean;
}

export interface MockConnectedAccount {
  id: string;
  provider: string;
  email?: string;
  connected: boolean;
}

export interface MockDevice {
  id: string;
  name: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface MockUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  emails: MockEmail[];
  phones: MockPhone[];
  connectedAccounts: MockConnectedAccount[];
  devices: MockDevice[];
  plan: { name: string; price: string; period?: string };
  destroy: () => Promise<void>;
}

export type UseUserReturn = { isLoaded: false; user: undefined } | { isLoaded: true; user: MockUser | null };

export function useUser(): UseUserReturn {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), LOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return { isLoaded: false, user: undefined };
  }

  return {
    isLoaded: true,
    user: {
      id: 'user_2nPC0mVKlBKCfg4kg',
      name: 'Mark Hoppus',
      username: '@mark.hoppus',
      avatar: GradientAvatar.src,
      emails: [
        { id: 'email_1', address: 'mark@clerk.dev', isPrimary: true },
        { id: 'email_2', address: 'mark182@aol.com', isPrimary: false },
      ],
      phones: [
        { id: 'phone_1', number: '(313) 555-3210', isPrimary: true },
        { id: 'phone_2', number: '(313) 780-4004', isPrimary: false },
      ],
      connectedAccounts: [
        { id: 'conn_1', provider: 'Google', email: 'michaelscott@gmail.com', connected: true },
        { id: 'conn_2', provider: 'GitHub', connected: false },
        { id: 'conn_3', provider: 'Apple', connected: false },
      ],
      devices: [
        {
          id: 'dev_1',
          name: 'Macintosh',
          browser: 'Chrome 149.0.0.0',
          location: 'Plymouth, MI, US',
          lastActive: 'Today at 8:56 PM',
          isCurrent: true,
        },
      ],
      plan: { name: 'Free', price: '$0' },
      destroy: () => delay(MUTATION_DELAY_MS),
    },
  };
}
