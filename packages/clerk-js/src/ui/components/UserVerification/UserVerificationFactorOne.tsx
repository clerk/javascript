import { withCardStateProvider } from '../../elements';
import { UserVerificationFactorOnePasswordCard } from './UserVerificationFactorOnePassword';

export function _UserVerificationFactorOne(): JSX.Element {
  return <UserVerificationFactorOnePasswordCard />;
}

export const UserVerificationFactorOne = withCardStateProvider(_UserVerificationFactorOne);
