import { useActionContext } from '@/ui/elements/Action/ActionRoot';

export const useProfileActionCloseController = () => {
  const { close } = useActionContext();
  return { onSuccess: close, onReset: close };
};
