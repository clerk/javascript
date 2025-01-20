import { CAPTCHA_ELEMENT_ID } from '../../utils/captcha';
import { Box } from '../customizables';

type CaptchaElementProps = {
  maxHeight?: string;
};

export const CaptchaElement = ({ maxHeight }: CaptchaElementProps) => (
  <Box
    id={CAPTCHA_ELEMENT_ID}
    sx={{ display: 'block', alignSelf: 'center', maxHeight }}
  />
);
