import React from 'react';

import { Button, Col, Flex, LocalizationKey, localizationKeys, Text } from '../customizables';
import { handleError } from '../utils';
import { useCardState } from './contexts';
import { FileDropArea } from './FileDropArea';

export type AvatarUploaderProps = {
  title: LocalizationKey;
  avatarPreview: React.ReactElement;
  onAvatarChange: (file: File) => Promise<unknown>;
};

export const AvatarUploader = (props: AvatarUploaderProps) => {
  const [showUpload, setShowUpload] = React.useState(false);
  const [objectUrl, setObjectUrl] = React.useState<string>();
  const card = useCardState();
  const { onAvatarChange, title, avatarPreview, ...rest } = props;

  const toggle = () => {
    setShowUpload(!showUpload);
  };

  const handleFileDrop = (file: File) => {
    setObjectUrl(URL.createObjectURL(file));
    card.setLoading();
    return onAvatarChange(file)
      .then(() => {
        toggle();
        card.setIdle();
      })
      .catch(err => handleError(err, [], card.setError));
  };

  React.useEffect(() => () => {
    objectUrl && URL.revokeObjectURL(objectUrl);
  });

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
          </Flex>
        </Col>
      </Flex>

      {showUpload && <FileDropArea onFileDrop={handleFileDrop} />}
    </Col>
  );
};
