import { determineInputTypeFromName } from '../determine-input-type-from-name';

// Jest tests for determineInputTypeFromName function
describe('determineInputTypeFromName', () => {
  it('should return "password" for password-related names', () => {
    expect(determineInputTypeFromName('password')).toBe('password');
    expect(determineInputTypeFromName('confirmPassword')).toBe('password');
    expect(determineInputTypeFromName('currentPassword')).toBe('password');
    expect(determineInputTypeFromName('newPassword')).toBe('password');
  });

  it('should return "email" for emailAddress', () => {
    expect(determineInputTypeFromName('emailAddress')).toBe('email');
  });

  it('should return "tel" for phoneNumber', () => {
    expect(determineInputTypeFromName('phoneNumber')).toBe('tel');
  });

  it('should return "otp" for code', () => {
    expect(determineInputTypeFromName('code')).toBe('otp');
  });

  it('should return "backup_code" for backup_code', () => {
    expect(determineInputTypeFromName('backup_code')).toBe('backup_code');
  });

  it('should return "text" for any other name', () => {
    expect(determineInputTypeFromName('username')).toBe('text');
    expect(determineInputTypeFromName('firstName')).toBe('text');
    expect(determineInputTypeFromName('lastName')).toBe('text');
  });
});
