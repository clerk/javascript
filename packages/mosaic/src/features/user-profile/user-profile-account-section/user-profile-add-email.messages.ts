export const userProfileAddEmailMessages = {
  email: {
    title: 'Add email',
    description: 'You’ll need to verify this email address before it’s added to your account.',
    label: 'Email',
    submit: 'Continue',
    pending: 'Adding email',
  },
  verify: {
    title: 'Verify your email',
    description: 'Enter the code sent to {emailAddress}',
    label: 'Verification code',
    submit: 'Verify',
    pending: 'Verifying',
    cancel: 'Cancel',
    resend: 'Didn’t receive a code? Resend',
    resending: 'Sending code…',
    resendCountdown: 'Didn’t receive a code? Resend ({seconds})',
  },
} as const;
