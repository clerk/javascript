import { useOrganizationList } from '@clerk/shared/react';
import type { CreateOrganizationParams } from '@clerk/shared/types';

import { useEnvironment } from '@/ui/contexts';
import { useTaskChooseOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import { localizationKeys } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { useRouter } from '@/ui/router';
import { createSlug } from '@/ui/utils/createSlug';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { organizationListParams } from '../../../OrganizationSwitcher/utils';

type CreateOrganizationScreenProps = {
  onCancel?: () => void;
};

export const CreateOrganizationScreen = (props: CreateOrganizationScreenProps) => {
  const card = useCardState();
  const { navigate } = useRouter();
  const { redirectUrlComplete } = useTaskChooseOrganizationContext();
  const { createOrganization, isLoaded, setActive } = useOrganizationList({
    userMemberships: organizationListParams.userMemberships,
  });
  const { organizationSettings } = useEnvironment();

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('taskChooseOrganization.createOrganization.formFieldLabel__name'),
    placeholder: localizationKeys('taskChooseOrganization.createOrganization.formFieldInputPlaceholder__name'),
  });
  const slugField = useFormControl('slug', '', {
    type: 'text',
    label: localizationKeys('taskChooseOrganization.createOrganization.formFieldLabel__slug'),
    placeholder: localizationKeys('taskChooseOrganization.createOrganization.formFieldInputPlaceholder__slug'),
  });

  const organizationSlugEnabled = !organizationSettings.slug.disabled;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      const createOrgParams: CreateOrganizationParams = { name: nameField.value };

      if (organizationSlugEnabled) {
        createOrgParams.slug = slugField.value;
      }

      const organization = await createOrganization(createOrgParams);

      await setActive({
        organization,
        navigate: async () => {
          // TODO(after-auth) ORGS-779 - Handle next tasks
          await navigate(redirectUrlComplete);
        },
      });
    } catch (err) {
      handleError(err, [nameField, slugField], card.setError);
    }
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    nameField.setValue(event.target.value);
    updateSlugField(createSlug(event.target.value));
  };

  const updateSlugField = (val: string) => {
    slugField.setValue(val);
  };

  const isSubmitButtonDisabled = !nameField.value || !isLoaded;

  return (
    <>
      <Header.Root
        showLogo
        sx={t => ({ padding: `${t.space.$none} ${t.space.$8}` })}
      >
        <Header.Title localizationKey={localizationKeys('taskChooseOrganization.createOrganization.title')} />
        <Header.Subtitle localizationKey={localizationKeys('taskChooseOrganization.createOrganization.subtitle')} />
      </Header.Root>
      <FormContainer sx={t => ({ padding: `${t.space.$none} ${t.space.$10} ${t.space.$8}` })}>
        <Form.Root onSubmit={onSubmit}>
          <Form.ControlRow elementId={nameField.id}>
            <Form.PlainInput
              {...nameField.props}
              onChange={onChangeName}
              isRequired
              autoFocus
              ignorePasswordManager
            />
          </Form.ControlRow>
          {organizationSlugEnabled && (
            <Form.ControlRow elementId={slugField.id}>
              <Form.PlainInput
                {...slugField.props}
                onChange={event => updateSlugField(event.target.value)}
                isRequired
                pattern='^(?=.*[a-z0-9])[a-z0-9\-]+$'
                ignorePasswordManager
              />
            </Form.ControlRow>
          )}

          <FormButtonContainer sx={() => ({ flexDirection: 'column' })}>
            <Form.SubmitButton
              block
              isDisabled={isSubmitButtonDisabled}
              localizationKey={localizationKeys('taskChooseOrganization.createOrganization.formButtonSubmit')}
            />
            {props.onCancel && (
              <Form.ResetButton
                localizationKey={localizationKeys('taskChooseOrganization.createOrganization.formButtonReset')}
                onClick={props.onCancel}
              />
            )}
          </FormButtonContainer>
        </Form.Root>
      </FormContainer>
    </>
  );
};
