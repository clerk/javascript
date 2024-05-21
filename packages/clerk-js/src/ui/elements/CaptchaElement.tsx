import { CAPTCHA_ELEMENT_ID } from '../../utils';
import { Box } from '../customizables';

export const CaptchaElement = () => (
  <Box
    id={CAPTCHA_ELEMENT_ID}
    sx={t => ({ display: 'none', marginBottom: t.space.$6, alignSelf: 'center' })}
  />
);
