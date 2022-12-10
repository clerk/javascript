import { Flex } from '../customizables';
import { LocalizationKey, localizationKeys } from '../localization';
import { PropsOfComponent } from '../styledSystem';
import { Form } from './Form';
import { useNavigateToFlowStart } from './NavigateToFlowStartButton';

type FormButtonsProps = PropsOfComponent<typeof Form.SubmitButton> & {
  isDisabled?: boolean;
  submitLabel?: LocalizationKey;
  resetLabel?: LocalizationKey;
};

export const FormButtons = (props: FormButtonsProps) => {
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const { isDisabled, submitLabel, resetLabel, ...rest } = props;
  return (
    <FormButtonContainer>
      <Form.SubmitButton
        block={false}
        isDisabled={isDisabled}
        // Should the default key come from userProfile?
        localizationKey={submitLabel || localizationKeys('userProfile.formButtonPrimary__continue')}
        {...rest}
      />
      <Form.ResetButton
        // Should the default key come from userProfile?
        localizationKey={resetLabel || localizationKeys('userProfile.formButtonReset')}
        block={false}
        onClick={navigateToFlowStart}
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
      sx={[theme => ({ marginTop: theme.space.$4 }), props.sx]}
    >
      {props.children}
    </Flex>
  );
};
