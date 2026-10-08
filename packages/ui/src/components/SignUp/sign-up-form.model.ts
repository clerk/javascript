import { useAppearance } from '../../customizables';

export const useSignUpFormModel = () => {
  const { showOptionalFields } = useAppearance().parsedOptions;

  return { showOptionalFields };
};
