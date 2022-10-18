import React from 'react';

import { useCoreUser } from '../contexts';
import { Button, Col, Flex, localizationKeys, Text } from '../customizables';
import { handleError } from '../utils';
import { Avatar } from './Avatar';
import { useCardState } from './contexts';
import { FileDropArea } from './FileDropArea';

type AvatarUploaderProps = {
  onAvatarChange: (file: File) => Promise<unknown>;
};

export const AvatarUploader = (props: AvatarUploaderProps) => {
  const [showUpload, setShowUpload] = React.useState(false);
  const card = useCardState();
  // TODO
  const user = useCoreUser();
  const { onAvatarChange, ...rest } = props;

  const toggle = () => {
    setShowUpload(!showUpload);
  };

  const handleFileDrop = (file: File) => {
    card.setLoading();
    return onAvatarChange(file)
      .then(() => {
        toggle();
        card.setIdle();
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

      {showUpload && <FileDropArea onFileDrop={handleFileDrop} />}
    </Col>
  );
};
