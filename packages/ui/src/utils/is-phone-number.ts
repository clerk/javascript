const phoneRegex = /^(\+\d{1,3}[-\s]?)?\(?[0-9]{3}\)?[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/;

export function isPhoneNumber(str: string) {
  return phoneRegex.test(str);
}
