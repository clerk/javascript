export type CanvasTarget = 'email' | 'passkeys' | 'mfa' | 'password';
export type CanvasRow = {
  id: string;
  title: string;
  description: string;
  label: string;
  target: CanvasTarget;
  subtitle: string;
};
export const CANVAS_ROWS: CanvasRow[] = [
  {
    id: 'email',
    title: 'Email',
    description: 'preston@clerk.dev',
    label: 'Manage emails',
    target: 'email',
    subtitle: 'Add or remove the addresses you use to sign in and receive messages.',
  },
  {
    id: 'passkeys',
    title: 'Passkeys',
    description: 'Sign in with on-device biometric authentication',
    label: 'Manage passkeys',
    target: 'passkeys',
    subtitle: 'Use your device’s built-in security features like Face ID to sign in instead of remembering passwords.',
  },
  {
    id: 'mfa',
    title: 'Two-factor authentication',
    description: 'You have two-factor authentication enabled',
    label: 'Manage verification methods',
    target: 'mfa',
    subtitle: 'Confirm it’s you after using a password by providing a verification code.',
  },
  {
    id: 'password',
    title: 'Password',
    description: 'Change the password you use to log in',
    label: 'Change password',
    target: 'password',
    subtitle: '',
  },
];
