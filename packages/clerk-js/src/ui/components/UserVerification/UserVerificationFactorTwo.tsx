import { withCardStateProvider } from '../../elements';
import { UserVerificationFactorTwoTOTP } from './UserVerificationFactorTwoTOTP';

export function _UserVerificationFactorTwo(): JSX.Element {
  return <UserVerificationFactorTwoTOTP />;
}

export const UserVerificationFactorTwo = withCardStateProvider(_UserVerificationFactorTwo);
