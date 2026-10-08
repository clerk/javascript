import { useRouter } from '../../router';

export const useOrganizationPlansPageModel = () => {
  const { navigate } = useRouter();
  return { navigate };
};
