import { useClerkInstanceContext } from '../contexts';

export const useWaitlist = () => {
  const clerk = useClerkInstanceContext();

  return {
    joinWaitlist: clerk.joinWaitlist,
  };
};
