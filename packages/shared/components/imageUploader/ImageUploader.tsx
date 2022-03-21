import cn from 'classnames';
import React from 'react';

import { CameraIcon } from '../../assets/icons';
import { toSentence } from '../../utils/array';
import { extension, SupportedMimeType } from '../../utils/mimeTypeExtensions';
import { Button } from '../button';
import { FileDropArea } from '../fileDropArea';
import { Modal } from '../modal';
import { TitledCard } from '../titledCard';
//@ts-ignore
import styles from './ImageUploader.module.scss';

export type ImageUploaderProps = {
  title: string;
  subtitle: string;
  handleSuccess: (file: File) => Promise<unknown>;
  className?: string;
  children: React.ReactNode;
  acceptedTypes?: SupportedMimeType[];
  sizeLimitBytes?: number;
  withResponsiveUploadIndicator?: boolean;
};

export const IMAGE_UPLOADER_DEFAULT_TYPES: SupportedMimeType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function typesToSentence(types: SupportedMimeType[]): string {
  return toSentence(types.map(t => extension(t).toUpperCase()));
}

export function ImageUploader({
  title,
  subtitle,
  handleSuccess,
  className,
  children,
  acceptedTypes = IMAGE_UPLOADER_DEFAULT_TYPES,
  sizeLimitBytes = 10 * 1000 * 1000,
  withResponsiveUploadIndicator = false,
}: ImageUploaderProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [hasFileError, setHasFileError] = React.useState(false);
  const openModal = () => {
    setIsModalOpen(true);
    setHasFileError(false);
  };
  const closeModal = () => setIsModalOpen(false);
  const uploadSuccess = (img: any) => {
    void handleSuccess(img).then(() => closeModal());
  };
  const uploadError = () => {
    setHasFileError(true);
  };

  const typesSentence = typesToSentence(acceptedTypes);
  const helpTexts = {
    normal: <p className={styles.helpText}>Upload a {typesSentence} image smaller than 10 MB</p>,
    error: (
      <p className={styles.helpTextError}>
        Upload error. Select a {typesSentence} image smaller than 10MB and try again.
      </p>
    ),
  };

  return (
    <>
      <Modal
        active={isModalOpen}
        handleClose={closeModal}
      >
        <TitledCard
          title={title}
          subtitle={subtitle}
        >
          <FileDropArea
            acceptedTypes={acceptedTypes}
            sizeLimitBytes={sizeLimitBytes}
            handleSuccess={uploadSuccess}
            handleError={uploadError}
          />
          {hasFileError ? helpTexts['error'] : helpTexts['normal']}
          <Button
            flavor='text'
            onClick={closeModal}
          >
            Close
          </Button>
        </TitledCard>
      </Modal>
      <div
        className={cn(styles.uploaderWrapper, className)}
        onClick={openModal}
      >
        {children}
        {withResponsiveUploadIndicator && (
          <div className={styles.touchContainer}>
            <CameraIcon
              className={styles.touchIcon}
              viewBox='0 0 24 24'
            />
          </div>
        )}
        <div className={styles.hoverContainer}>
          <CameraIcon className={styles.hoverIcon} />
        </div>
      </div>
    </>
  );
}
