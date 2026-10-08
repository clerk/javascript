import { useSetSessionWithTimeout } from '../../hooks/useSetSessionWithTimeout';

export const useResetPasswordSuccessModel = () => {
  useSetSessionWithTimeout();
};
