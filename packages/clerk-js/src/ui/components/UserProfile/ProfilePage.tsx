import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreUser, useEnvironment } from '../../contexts';
import { Button, Col, Flex, localizationKeys, Text } from '../../customizables';
import { Avatar, FileDropArea, Form, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { FormButtons } from './FormButtons';
import { ContentPage } from './Page';
import { SuccessPage } from './SuccessPage';

export const ProfilePage = withCardStateProvider(() => {
  const title = localizationKeys('userProfile.profilePage.title');
  const card = useCardState();
  const user = useCoreUser();
  const [avatarChanged, setAvatarChanged] = React.useState(false);
  const { first_name, last_name } = useEnvironment().userSettings.attributes;
  const showFirstName = first_name.enabled;
  const showLastName = last_name.enabled;

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const firstNameField = useFormControl('firstName', user.firstName || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__firstName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__firstName'),
  });
  const lastNameField = useFormControl('lastName', user.lastName || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__lastName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__lastName'),
  });

  const userInfoChanged =
    (showFirstName && firstNameField.value && firstNameField.value !== user.firstName) ||
    (showLastName && lastNameField.value && lastNameField.value !== user.lastName);
  const canSubmit = userInfoChanged || avatarChanged;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    return (
      userInfoChanged
        ? user.update({ firstName: firstNameField.value, lastName: lastNameField.value })
        : Promise.resolve()
    )
      .then(() => {
        wizard.nextStep();
      })
      .catch(err => {
        handleError(err, [firstNameField, lastNameField], card.setError);
      });
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage.Root headerTitle={title}>
        <Form.Root onSubmit={onSubmit}>
          <AvatarUploader onAvatarChange={() => setAvatarChanged(true)} />
          {showFirstName && (
            <Form.ControlRow>
              <Form.Control
                {...firstNameField.props}
                required
              />
            </Form.ControlRow>
          )}
          {showLastName && (
            <Form.ControlRow>
              <Form.Control
                {...lastNameField.props}
                required
              />
            </Form.ControlRow>
          )}
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage.Root>
      <SuccessPage
        title={title}
        text={localizationKeys('userProfile.profilePage.successMessage')}
      />
    </Wizard>
  );
});

type AvatarUploaderProps = {
  onAvatarChange: () => void;
};

// TODO: Make this more generic if needed
const AvatarUploader = (props: AvatarUploaderProps) => {
  const [showUpload, setShowUpload] = React.useState(false);
  const card = useCardState();
  const user = useCoreUser();
  const { onAvatarChange, ...rest } = props;

  const toggle = () => {
    setShowUpload(!showUpload);
  };

  const upload = (file: File) => {
    card.setLoading();
    user
      .setProfileImage({ file })
      .then(() => {
        toggle();
        card.setIdle();
        onAvatarChange();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  return (
    <Col gap={4}>
      <Flex
        gap={4}
        align='center'
        {...rest}
      >
        <Avatar
          {...user}
          size={theme => theme.sizes.$11}
          optimize
        />
        <Col gap={1}>
          <Text
            localizationKey={localizationKeys('userProfile.profilePage.imageFormTitle')}
            variant='regularMedium'
          />
          <Flex gap={4}>
            <Button
              localizationKey={
                !showUpload
                  ? localizationKeys('userProfile.profilePage.imageFormSubtitle')
                  : localizationKeys('userProfile.formButtonReset')
              }
              isDisabled={card.isLoading}
              variant='link'
              onClick={(e: any) => {
                e.target?.blur();
                toggle();
              }}
            />
          </Flex>
        </Col>
      </Flex>

      {showUpload && <FileDropArea onFileDrop={upload} />}
    </Col>
  );
};
