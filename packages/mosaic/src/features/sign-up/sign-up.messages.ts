export const signUpMessages = {
  start: {
    title: 'Create your account',
    description: 'Welcome! Please fill in the details to get started.',
  },
  continue: {
    title: 'Fill in missing fields',
    description: 'Please fill in the remaining details to continue.',
  },
  alternativePhone: {
    title: 'Sign up to {applicationName} with {provider}',
    description: 'Enter your phone number to get a verification code on {provider}.',
    label: '{provider} phone number',
  },
  wallets: {
    title: 'Sign up with Solana',
    description: 'Select a wallet below to sign up',
  },
  restricted: {
    title: 'Access restricted',
    description: 'Sign ups are currently disabled. If you believe you should have access, please contact support.',
    emailSupport: 'Email support',
  },
  waitlist: {
    title: 'Access restricted',
    description: 'Sign ups are currently disabled. To be the first to know when we launch, join the waitlist.',
    joinWaitlist: 'Join waitlist',
  },
  signInPrompt: 'Already have an account?',
  signInLink: 'Sign in',
} as const;
