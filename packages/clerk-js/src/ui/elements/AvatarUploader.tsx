import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, localizationKeys, SimpleButton } from '../customizables';
import { handleError } from '../utils';
import { useCardState } from './contexts';
import { FileDropArea } from './FileDropArea';

export type AvatarUploaderProps = {
  title: LocalizationKey;
  avatarPreview: React.ReactElement;
  onAvatarChange: (file: File) => Promise<unknown>;
  onAvatarRemove?: (() => void) | null;
  avatarPreviewPlaceholder?: React.ReactElement | null;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const AvatarUploader = (props: AvatarUploaderProps) => {
  const [showUpload, setShowUpload] = React.useState(false);
  const [objectUrl, setObjectUrl] = React.useState<string>();
  const card = useCardState();

  const { onAvatarChange, onAvatarRemove, title, avatarPreview, avatarPreviewPlaceholder, ...rest } = props;

  const toggle = () => {
    setShowUpload(!showUpload);
  };

  const handleFileDrop = (file: File | null) => {
    if (file === null) {
      return setObjectUrl('');
    }

    void fileToBase64(file).then(setObjectUrl);
    card.setLoading();
    return onAvatarChange(file)
      .then(() => {
        toggle();
        card.setIdle();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  const handleRemove = () => {
    card.setLoading();
    handleFileDrop(null);
    return onAvatarRemove?.();
  };

  const previewElement = objectUrl
    ? React.cloneElement(avatarPreview, { imageUrl: objectUrl })
    : avatarPreviewPlaceholder
    ? React.cloneElement(avatarPreviewPlaceholder, { onClick: toggle })
    : avatarPreview;

  return (
    <Col gap={4}>
      <Flex
        gap={4}
        align='center'
        {...rest}
      >
        {previewElement}
        <Col gap={1}>
          <Flex
            elementDescriptor={descriptors.avatarImageActions}
            gap={2}
          >
            <SimpleButton
              elementDescriptor={descriptors.avatarImageActionsUpload}
              localizationKey={
                !showUpload
                  ? localizationKeys('userProfile.profile.profileSection.profileScreen.imageFormSubtitle')
                  : localizationKeys('userProfile.formButtonReset')
              }
              isDisabled={card.isLoading}
              variant='secondary'
              onClick={(e: any) => {
                e.target?.blur();
                toggle();
              }}
            />

            {!!onAvatarRemove && !showUpload && (
              <Button
                elementDescriptor={descriptors.avatarImageActionsRemove}
                localizationKey={localizationKeys(
                  'userProfile.profile.profileSection.profileScreen.imageFormDestructiveActionSubtitle',
                )}
                isDisabled={card.isLoading}
                sx={t => ({ color: t.colors.$danger500 })}
                variant='ghostDanger'
                onClick={handleRemove}
              />
            )}
          </Flex>
        </Col>
      </Flex>

      {showUpload && <FileDropArea onFileDrop={handleFileDrop} />}
    </Col>
  );
};
