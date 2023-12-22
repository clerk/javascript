import { Flex } from '../customizables';
import { useNavigateToFlowStart } from '../hooks';
import type { LocalizationKey } from '../localization';
import { localizationKeys } from '../localization';
import type { PropsOfComponent } from '../styledSystem';
import { Form } from './Form';

type FormButtonsProps = PropsOfComponent<typeof Form.SubmitButton> & {
  isDisabled?: boolean;
  onReset?: () => void;
  submitLabel?: LocalizationKey;
  resetLabel?: LocalizationKey;
};

export const FormButtons = (props: FormButtonsProps) => {
  const { isDisabled, onReset, submitLabel, resetLabel, ...rest } = props;
  const { navigateToFlowStart } = useNavigateToFlowStart();
  return (
    <FormButtonContainer>
      <Form.SubmitButton
        block={false}
        isDisabled={isDisabled}
        // TODO-RETHEME Should the default key come from userProfile?
        localizationKey={submitLabel || localizationKeys('userProfile.formButtonPrimary__save')}
        {...rest}
      />
      <Form.ResetButton
        // TODO-RETHEME Should the default key come from userProfile?
        localizationKey={resetLabel || localizationKeys('userProfile.formButtonReset')}
        block={false}
        onClick={onReset || navigateToFlowStart}
      />
    </FormButtonContainer>
  );
};

export const FormButtonContainer = (props: PropsOfComponent<typeof Flex>) => {
  return (
    <Flex
      direction={'rowReverse'}
      gap={2}
      {...props}
      sx={[theme => ({ marginTop: theme.space.$1 }), props.sx]}
    >
      {props.children}
    </Flex>
  );
};
