import { useAppearance, useLocalizations } from '../../customizables';

export type BlankCaptchaModel = {
  theme: string | undefined;
  size: string | undefined;
  language: string | undefined;
};

export function useBlankCaptchaModel(): BlankCaptchaModel {
  const { parsedCaptcha } = useAppearance();
  const { locale } = useLocalizations();

  return {
    theme: parsedCaptcha?.theme,
    size: parsedCaptcha?.size,
    language: parsedCaptcha?.language || locale?.toLowerCase(),
  };
}
