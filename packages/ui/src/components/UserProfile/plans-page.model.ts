import { useRouter } from '../../router';

export const usePlansPageModel = () => {
  const { navigate } = useRouter();
  return { navigate };
};
