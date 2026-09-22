const USER_CODE_PATTERN = /^[BCDFGHJKLMNPQRSTVWXZ]{8}$/;
const USER_CODE_SEPARATOR_PATTERN = /[-\p{White_Space}]/gu;

const canReadLocation = () => typeof window !== 'undefined' && !!window.location;

export function normalizeOAuthDeviceUserCode(value: string): string {
  return value.toUpperCase().replace(USER_CODE_SEPARATOR_PATTERN, '');
}

export function isValidOAuthDeviceUserCode(value: string): boolean {
  return USER_CODE_PATTERN.test(normalizeOAuthDeviceUserCode(value));
}

export function getOAuthDeviceUserCodeFromSearch(): string {
  if (!canReadLocation()) {
    return '';
  }
  return new URLSearchParams(window.location.search).get('user_code') ?? '';
}
