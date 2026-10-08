import { Button } from '../../customizables';
import type { LocalizationKey } from '../../localization';
import type { PropsOfComponent } from '../../styledSystem';

export const CheckoutSubmitButtonView = ({
  isLoading,
  submitLabel,
  ...props
}: PropsOfComponent<typeof Button> & {
  isLoading: boolean;
  submitLabel: LocalizationKey;
}) => (
  <Button
    type='submit'
    colorScheme='primary'
    size='sm'
    textVariant={'buttonLarge'}
    sx={{ width: '100%' }}
    isLoading={isLoading}
    localizationKey={submitLabel}
    {...props}
  />
);
