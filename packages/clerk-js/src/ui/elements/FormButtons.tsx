import { Flex } from '../customizables';
import { useNavigateToFlowStart } from '../hooks';
import type { LocalizationKey } from '../localization';
import { localizationKeys } from '../localization';
import type { PropsOfComponent } from '../styledSystem';
import { Form } from './Form';

type FormButtonsProps = PropsOfComponent<typeof Form.SubmitButton> & {
  isDisabled?: boolean;
  onReset?: () => void;
  hideReset?: boolean;
  submitLabel?: LocalizationKey;
  resetLabel?: LocalizationKey;
};

export const FormButtons = (props: FormButtonsProps) => {
  const { isDisabled, onReset, submitLabel, resetLabel, hideReset, ...rest } = props;
  const { navigateToFlowStart } = useNavigateToFlowStart();
  return (
    <FormButtonContainer>
      <Form.SubmitButton
        block={false}
        isDisabled={isDisabled}
        localizationKey={submitLabel || localizationKeys('userProfile.formButtonPrimary__save')}
        {...rest}
      />
      {!hideReset && (
        <Form.ResetButton
          localizationKey={resetLabel || localizationKeys('userProfile.formButtonReset')}
          block={false}
          onClick={onReset || navigateToFlowStart}
        />
      )}
    </FormButtonContainer>
  );
};

export const FormButtonContainer = (props: PropsOfComponent<typeof Flex>) => {
  return (
    <Flex
      direction={'rowReverse'}
      gap={2}
      {...props}
    >
      {props.children}
    </Flex>
  );
};
