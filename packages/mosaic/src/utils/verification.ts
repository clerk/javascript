export const CODE_LENGTH = 6;
export const CODE_RESEND_SECONDS = 30;

export function resendUnlockTime(seconds: number): number {
  return Date.now() + seconds * 1000;
}

export function isResendUnlocked(resendAvailableAt: number | undefined): boolean {
  return resendAvailableAt === undefined || Date.now() >= resendAvailableAt;
}
