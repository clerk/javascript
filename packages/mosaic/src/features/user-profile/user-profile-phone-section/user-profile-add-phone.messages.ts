export const userProfileAddPhoneMessages = {
  error: 'Something went wrong. Please try again.',
  phone: {
    title: 'Add phone number',
    description: 'We’ll send you a text to verify this phone number. Message and data rates may apply.',
    label: 'Phone',
    submit: 'Send code',
    pending: 'Sending code',
  },
  verify: {
    title: 'Verify your phone number',
    description: 'Enter the code sent to {phoneNumber}',
    label: 'Verification code',
    submit: 'Verify',
    pending: 'Verifying',
    cancel: 'Cancel',
    resend: 'Resend',
    resendText: 'Didn’t receive a code?',
    resending: 'Sending a new code…',
    resendCountdown: 'Resend ({seconds})',
  },
} as const;
