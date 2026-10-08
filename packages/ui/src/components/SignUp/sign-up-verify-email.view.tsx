import { SignUpEmailCodeCard } from './SignUpEmailCodeCard';
import { SignUpEmailLinkCard } from './SignUpEmailLinkCard';

export const SignUpVerifyEmailView = ({ emailLinkStrategyEnabled }: { emailLinkStrategyEnabled: boolean }) =>
  emailLinkStrategyEnabled ? <SignUpEmailLinkCard /> : <SignUpEmailCodeCard />;
