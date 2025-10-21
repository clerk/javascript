import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, localizationKeys, SimpleButton, Text } from '../customizables';

export type AvatarUploaderProps = {
  title: LocalizationKey;
  avatarPreview?: React.ReactElement;
  onAvatarChange: (file: File) => void | Promise<void>;
  onAvatarRemove?: (() => void) | null;
  avatarPreviewPlaceholder?: React.ReactElement | null;
  previewImageUrl?: string | null;
  imageRemoved?: boolean;
};

const MAX_SIZE_BYTES = 10 * 1000 * 1000;
const SUPPORTED_MIME_TYPES = Object.freeze(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

const validType = (f: File | DataTransferItem) => SUPPORTED_MIME_TYPES.includes(f.type);
const validSize = (f: File) => f.size <= MAX_SIZE_BYTES;
const validFile = (f: File) => validType(f) && validSize(f);

export const AvatarUploader = (props: AvatarUploaderProps) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const openDialog = () => inputRef.current?.click();

  const {
    onAvatarChange,
    onAvatarRemove,
    title,
    avatarPreview,
    avatarPreviewPlaceholder,
    previewImageUrl,
    imageRemoved,
    ...rest
  } = props;

  const handleFileChange = async (file: File | undefined) => {
    if (file && validFile(file)) {
      try {
        await onAvatarChange(file);
      } catch (error) {
        console.error('Error in onAvatarChange:', error);
      }
    }
  };

  const handleRemove = () => {
    onAvatarRemove?.();
  };

  const previewElement = React.useMemo(() => {
    if (previewImageUrl && avatarPreview) {
      return React.cloneElement(avatarPreview, { imageUrl: previewImageUrl });
    }

    if (avatarPreview) {
      return avatarPreview;
    }

    // If we have a placeholder, clone it and pass the openDialog function
    if (avatarPreviewPlaceholder) {
      return React.cloneElement(avatarPreviewPlaceholder, { onClick: openDialog });
    }

    return null;
  }, [previewImageUrl, avatarPreview, avatarPreviewPlaceholder, openDialog]);

  return (
    <Col gap={4}>
      <input
        type='file'
        accept={SUPPORTED_MIME_TYPES.join(',')}
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => handleFileChange(e.currentTarget.files?.[0])}
        onClick={e => {
          e.currentTarget.value = '';
        }}
      />

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
              localizationKey={localizationKeys('userProfile.profilePage.imageFormSubtitle')}
              variant='outline'
              size='xs'
              onClick={openDialog}
            />

            {!!onAvatarRemove && (
              <Button
                elementDescriptor={descriptors.avatarImageActionsRemove}
                localizationKey={localizationKeys('userProfile.profilePage.imageFormDestructiveActionSubtitle')}
                sx={t => ({ color: t.colors.$danger500 })}
                size='xs'
                variant='ghost'
                colorScheme='danger'
                onClick={handleRemove}
              />
            )}
          </Flex>
          <Text
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
            localizationKey={localizationKeys('userProfile.profilePage.fileDropAreaHint')}
          />
        </Col>
      </Flex>
    </Col>
  );
};
