import { useClerk, useOrganizationList } from '@clerk/shared/react';

import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { localizationKeys } from '@/ui/customizables';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { createSlug } from '@/ui/utils/createSlug';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { organizationListParams } from '../../../OrganizationSwitcher/utils';

type CreateOrganizationScreenProps = {
  onCancel?: () => void;
};

export const CreateOrganizationScreen = withCardStateProvider((props: CreateOrganizationScreenProps) => {
  const card = useCardState();
  const { __internal_navigateToTaskIfAvailable } = useClerk();
  const { redirectUrlComplete } = useSessionTasksContext();
  const { createOrganization, isLoaded, setActive } = useOrganizationList({
    userMemberships: organizationListParams.userMemberships,
  });

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationName'),
  });
  const slugField = useFormControl('slug', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationSlug'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationSlug'),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      const organization = await createOrganization({ name: nameField.value, slug: slugField.value });

      await setActive({ organization });

      await __internal_navigateToTaskIfAvailable({ redirectUrlComplete });
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
      <FormContainer>
        <Form.Root
          onSubmit={onSubmit}
          sx={t => ({ padding: `${t.space.$none} ${t.space.$10} ${t.space.$8}` })}
        >
          <Form.ControlRow elementId={nameField.id}>
            <Form.PlainInput
              {...nameField.props}
              onChange={onChangeName}
              isRequired
              autoFocus
              ignorePasswordManager
            />
          </Form.ControlRow>
          <Form.ControlRow elementId={slugField.id}>
            <Form.PlainInput
              {...slugField.props}
              onChange={event => updateSlugField(event.target.value)}
              isRequired
              pattern='^(?=.*[a-z0-9])[a-z0-9\-]+$'
              ignorePasswordManager
            />
          </Form.ControlRow>

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
});
