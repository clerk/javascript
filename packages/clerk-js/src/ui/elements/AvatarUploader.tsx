import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, localizationKeys, SimpleButton, Text } from '../customizables';

export type AvatarUploaderProps = {
  title: LocalizationKey;
  avatarPreview: React.ReactElement;
  onAvatarChange: (file: File) => void;
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

  const handleFileChange = (file: File | undefined) => {
    if (file && validFile(file)) {
      onAvatarChange(file);
    }
  };

  const handleRemove = () => {
    onAvatarRemove?.();
  };

  const previewElement = React.useMemo(() => {
    // If we have a preview URL, show it
    if (previewImageUrl) {
      return React.cloneElement(avatarPreview, { imageUrl: previewImageUrl });
    }

    // Otherwise show the original avatar
    return avatarPreview;
  }, [previewImageUrl, avatarPreview]);

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
