import { CAPTCHA_ELEMENT_ID } from '../../utils/captcha';
import { Box } from '../customizables';

export const CaptchaElement = () => (
  <Box
    id={CAPTCHA_ELEMENT_ID}
    sx={{ display: 'block', alignSelf: 'center', maxHeight: '0' }}
  />
);
