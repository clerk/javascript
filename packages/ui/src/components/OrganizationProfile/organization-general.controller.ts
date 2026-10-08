import { useActionContext } from '@/ui/elements/Action/ActionRoot';

export const useOrganizationGeneralScreenController = () => {
  const { close } = useActionContext();
  return { close };
};
