import { Flex } from '../customizables';
import type { LocalizationKey } from '../localization';
import { localizationKeys } from '../localization';
import type { PropsOfComponent } from '../styledSystem';
import { Form } from './Form';
import { useNavigateToFlowStart } from './NavigateToFlowStartButton';

type FormButtonsProps = PropsOfComponent<typeof Form.SubmitButton> & {
  isDisabled?: boolean;
  submitLabel?: LocalizationKey;
  resetLabel?: LocalizationKey;
  onReset?: () => unknown | Promise<unknown>;
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
        onClick={props?.onReset || navigateToFlowStart}
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
