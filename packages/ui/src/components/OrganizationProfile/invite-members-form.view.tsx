import { Flex } from '@/customizables';
import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { TagInput } from '@/ui/elements/TagInput';
import { isEmail } from '@/ui/utils/emailUtils';

import type { LocalizationKey } from '../../localization';
import { localizationKeys } from '../../localization';
import { mqu } from '../../styledSystem';
import type { useInviteMembersFormController } from './invite-members-form.controller';
import { RoleSelect } from './MemberListTable';

type InviteMembersFormViewProps = {
  controller: ReturnType<typeof useInviteMembersFormController>;
  onReset?: () => void;
  resetButtonLabel?: LocalizationKey;
  hideResetButton?: boolean;
};

export const InviteMembersFormView = ({
  controller,
  onReset,
  resetButtonLabel,
  hideResetButton,
}: InviteMembersFormViewProps) => {
  const {
    props: {
      setError,
      setWarning,
      setSuccess,
      setInfo,
      isFocused,
      validatePassword,
      setHasPassedComplexity,
      hasPassedComplexity,
      feedback,
      feedbackType,
      clearFeedback,
      ...restEmailAddressProps
    },
  } = controller.emailAddressField;

  return (
    <Form.Root onSubmit={controller.onSubmit}>
      <Card.Alert>{controller.error}</Card.Alert>
      <Form.ControlRow elementId={controller.emailAddressField.id}>
        <TagInput
          {...restEmailAddressProps}
          autoFocus
          validate={isEmail}
          sx={{ width: '100%' }}
          validateUnsubmittedEmail={controller.validateUnsubmittedEmail}
          placeholder={localizationKeys('formFieldInputPlaceholder__emailAddresses')}
        />
      </Form.ControlRow>
      <Flex
        align='center'
        justify='between'
        sx={t => ({
          marginTop: hideResetButton ? t.space.$none : t.space.$2,
          gap: t.space.$4,
          flexWrap: 'wrap',
          [mqu.sm]: { justifyContent: 'center' },
        })}
      >
        <AsyncRoleSelectView controller={controller} />
        <FormButtonContainer sx={t => ({ margin: t.space.$none, flexWrap: 'wrap', justifyContent: 'center' })}>
          <Form.SubmitButton
            block={false}
            isDisabled={!controller.canSubmit}
            localizationKey={
              controller.isPerSeatCostPlan && controller.mustPurchaseSeats
                ? localizationKeys('organizationProfile.invitePage.formButtonPrimary__purchaseSeats')
                : localizationKeys('organizationProfile.invitePage.formButtonPrimary__continue')
            }
          />
          {!hideResetButton && (
            <Form.ResetButton
              localizationKey={resetButtonLabel || localizationKeys('userProfile.formButtonReset')}
              block={false}
              onClick={onReset}
            />
          )}
        </FormButtonContainer>
      </Flex>
    </Form.Root>
  );
};

const AsyncRoleSelectView = ({ controller }: { controller: ReturnType<typeof useInviteMembersFormController> }) => (
  <Form.ControlRow elementId={controller.roleField.id}>
    <Flex
      direction='col'
      gap={2}
    >
      <RoleSelect
        {...controller.roleField.props}
        roles={controller.roles}
        isDisabled={controller.isRoleDisabled}
        onChange={value => controller.roleField.setValue(value)}
        triggerSx={t => ({ minWidth: t.sizes.$40, justifyContent: 'space-between', display: 'flex' })}
        optionListSx={t => ({ minWidth: t.sizes.$48 })}
        prefixLocalizationKey={controller.rolePrefix}
      />
    </Flex>
  </Form.ControlRow>
);
