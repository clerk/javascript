export const userProfileAddPhoneMessages = {
  phone: {
    title: 'Add phone number',
    description: 'We’ll send you a text to verify this phone number. Message and data rates may apply.',
    label: 'Phone',
    submit: 'Send code',
    pending: 'Sending code',
  },
  verify: {
    title: 'Verify your phone number',
    description: (phoneNumber: string) => `Enter the code sent to ${phoneNumber}`,
    label: 'Verification code',
    submit: 'Verify',
    pending: 'Verifying',
    cancel: 'Cancel',
    resend: 'Didn’t receive a code? Resend',
    resending: 'Sending a new code…',
    resendCountdown: (seconds: number) => `Didn’t receive a code? Resend (${seconds})`,
  },
};
