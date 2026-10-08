import { useEnvironment } from '../../contexts';

export const useSignUpVerifyEmailModel = () => {
  const { userSettings } = useEnvironment();
  return {
    emailLinkStrategyEnabled: userSettings.attributes.email_address?.verifications?.includes('email_link') ?? false,
  };
};
