import React from 'react';

import { Button, Col, Flex, LocalizationKey, localizationKeys, Text } from '../customizables';
import { handleError } from '../utils';
import { useCardState } from './contexts';
import { FileDropArea } from './FileDropArea';

export type AvatarUploaderProps = {
  title: LocalizationKey;
  avatarPreview: React.ReactElement;
  onAvatarChange: (file: File | null) => Promise<unknown>;
  onAvatarRemove?: () => void;
  hasDefaultImageUrl?: boolean;
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

  const { onAvatarChange, onAvatarRemove, title, avatarPreview, hasDefaultImageUrl = true, ...rest } = props;

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

  return (
    <Col gap={4}>
      <Flex
        gap={4}
        align='center'
        {...rest}
      >
        {objectUrl
          ? React.cloneElement(avatarPreview, { logoUrl: objectUrl, profileImageUrl: objectUrl })
          : avatarPreview}
        <Col gap={1}>
          <Text
            localizationKey={title}
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

            {!hasDefaultImageUrl && !showUpload && (
              <Button
                localizationKey={localizationKeys('userProfile.profilePage.imageFormDestructiveActionSubtitle')}
                isDisabled={card.isLoading}
                sx={t => ({ color: t.colors.$danger500 })}
                variant='link'
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
