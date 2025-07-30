import { useClerk, useOrganizationList, useUser } from '@clerk/shared/react';
import type { CreateOrganizationParams } from '@clerk/types';
import React, { useState } from 'react';

import { withCoreSessionSwitchGuard } from '@/ui/contexts';
import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { Col, descriptors, Flex, Flow, Icon, localizationKeys, Spinner } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { IconButton } from '@/ui/elements/IconButton';
import { Organization } from '@/ui/icons';
import { createSlug } from '@/ui/utils/createSlug';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';
import { getIdentifier } from '@/utils/user';

import { useOrganizationListInView } from '../../OrganizationList/OrganizationListPage';
import { OrganizationProfileAvatarUploader } from '../../OrganizationProfile/OrganizationProfileAvatarUploader';
import { organizationListParams } from '../../OrganizationSwitcher/utils';
import { withTaskGuard } from './withTaskGuard';

const TaskSelectOrganizationInternal = () => {
  const { user } = useUser();
  const { userMemberships, userSuggestions, userInvitations } = useOrganizationListInView();

  const isLoading = userMemberships?.isLoading || userInvitations?.isLoading || userSuggestions?.isLoading;
  const hasExistingResources = !!(userMemberships?.count || userInvitations?.count || userSuggestions?.count);

  return (
    <Flow.Root flow='taskSelectOrganization'>
      <Card.Root>
        {!isLoading && user ? (
          <>
            <Card.Content>
              <Header.Root showLogo>
                <Header.Title localizationKey={localizationKeys('taskSelectOrganization.title')} />
                <Header.Subtitle localizationKey={localizationKeys('taskSelectOrganization.subtitle')} />
              </Header.Root>

              <TaskSelectOrganizationFlows initialFlow={hasExistingResources ? 'create' : 'select'} />
            </Card.Content>
            <Card.Footer>
              <Card.Action elementId='signOut'>
                <Card.ActionText
                  localizationKey={localizationKeys('taskSelectOrganization.signOut.actionText', {
                    // TODO -> Change this key name to identifier
                    // TODO -> what happens if the user does not email address? only username or phonenumber
                    // Signed in as +55482323232
                    emailAddress: user.primaryEmailAddress?.emailAddress || getIdentifier(user),
                  })}
                />
                <Card.ActionLink localizationKey={localizationKeys('taskSelectOrganization.signOut.actionLink')} />
              </Card.Action>
            </Card.Footer>
          </>
        ) : (
          // TODO -> Improve loading UI to keep consistent height with SignIn/SignUp
          <Flex
            direction={'row'}
            align={'center'}
            justify={'center'}
            sx={t => ({
              height: '100%',
              minHeight: t.sizes.$100,
            })}
          >
            <Spinner
              size={'lg'}
              colorScheme={'primary'}
              elementDescriptor={descriptors.spinner}
            />
          </Flex>
        )}
      </Card.Root>
    </Flow.Root>
  );
};

type TaskSelectOrganizationFlowsProps = {
  initialFlow: 'create' | 'select';
};

const TaskSelectOrganizationFlows = withCardStateProvider((props: TaskSelectOrganizationFlowsProps) => {
  const [currentFlow, setCurrentFlow] = useState(props.initialFlow);

  if (currentFlow === 'create') {
    return (
      <CreateOrganizationScreen
        onCancel={props.initialFlow === 'select' ? () => setCurrentFlow('select') : undefined}
      />
    );
  }

  return <></>;
});

type CreateOrganizationScreenProps = {
  onCancel?: () => void;
  hideSlug?: boolean;
};

const CreateOrganizationScreen = withCardStateProvider((props: CreateOrganizationScreenProps) => {
  const card = useCardState();
  const { __internal_navigateToTaskIfAvailable } = useClerk();
  const { redirectUrlComplete } = useSessionTasksContext();
  const { createOrganization, isLoaded, setActive } = useOrganizationList({
    userMemberships: organizationListParams.userMemberships,
  });

  const [file, setFile] = useState<File | null>();
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
      const createOrgParams: CreateOrganizationParams = { name: nameField.value };

      if (!props.hideSlug) {
        // TODO -> Should we always show the slug
        // should it be exposed as a prop on TaskSelectOrganization
        createOrgParams.slug = slugField.value;
      }

      const organization = await createOrganization(createOrgParams);

      if (file) {
        await organization.setLogo({ file });
      }

      await setActive({ organization });

      await __internal_navigateToTaskIfAvailable({ redirectUrlComplete });
    } catch (err) {
      handleError(err, [nameField, slugField], card.setError);
    }
  };

  const onAvatarRemove = () => {
    card.setIdle();
    return setFile(null);
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    nameField.setValue(event.target.value);
    updateSlugField(createSlug(event.target.value));
  };

  const onChangeSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSlugField(event.target.value);
  };

  const updateSlugField = (val: string) => {
    slugField.setValue(val);
  };

  const isSubmitButtonDisabled = !nameField.value || !isLoaded;

  return (
    <FormContainer sx={t => ({ minHeight: t.sizes.$60, gap: t.space.$6, textAlign: 'left' })}>
      <Form.Root onSubmit={onSubmit}>
        <Col>
          <OrganizationProfileAvatarUploader
            organization={{ name: nameField.value }}
            // TODO - Fix type of `onAvatarChange`
            onAvatarChange={async file => setFile(file)}
            onAvatarRemove={file ? onAvatarRemove : null}
            avatarPreviewPlaceholder={
              <IconButton
                variant='ghost'
                aria-label='Upload organization logo'
                // TODO -> Update to icon from Figma
                icon={
                  <Icon
                    size='md'
                    icon={Organization}
                    sx={t => ({
                      color: t.colors.$colorMutedForeground,
                      transitionDuration: t.transitionDuration.$controls,
                    })}
                  />
                }
                sx={t => ({
                  width: t.sizes.$16,
                  height: t.sizes.$16,
                  borderRadius: t.radii.$md,
                  borderWidth: t.borderWidths.$normal,
                  borderStyle: t.borderStyles.$dashed,
                  borderColor: t.colors.$borderAlpha200,
                  backgroundColor: t.colors.$neutralAlpha50,
                  ':hover': {
                    backgroundColor: t.colors.$neutralAlpha50,
                    svg: {
                      transform: 'scale(1.2)',
                    },
                  },
                })}
              />
            }
          />
        </Col>
        <Form.ControlRow elementId={nameField.id}>
          <Form.PlainInput
            {...nameField.props}
            onChange={onChangeName}
            isRequired
            // TODO -> Remove auto focus?
            autoFocus
            ignorePasswordManager
          />
        </Form.ControlRow>
        {!props.hideSlug && (
          <Form.ControlRow elementId={slugField.id}>
            <Form.PlainInput
              {...slugField.props}
              onChange={onChangeSlug}
              isRequired
              pattern='^(?=.*[a-z0-9])[a-z0-9\-]+$'
              ignorePasswordManager
            />
          </Form.ControlRow>
        )}
        <FormButtonContainer sx={t => ({ marginTop: t.space.$none, flexDirection: 'column' })}>
          <Form.SubmitButton
            block={false}
            sx={() => ({ width: '100%' })}
            isDisabled={isSubmitButtonDisabled}
            localizationKey={localizationKeys('taskSelectOrganization.createOrganizationScreen.formButtonSubmit')}
          />
          {props.onCancel && (
            <Form.ResetButton
              localizationKey={localizationKeys('taskSelectOrganization.createOrganizationScreen.formButtonReset')}
              block={false}
              onClick={props.onCancel}
            />
          )}
        </FormButtonContainer>
      </Form.Root>
    </FormContainer>
  );
});

export const TaskSelectOrganization = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskSelectOrganizationInternal)),
);
