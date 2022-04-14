import { Avatar, AvatarProps } from '@clerk/shared/components/avatar';
import { ImageUploader } from '@clerk/shared/components/imageUploader';
import React from 'react';
import { useCoreUser } from 'ui/contexts';

//@ts-ignore
import styles from './AvatarWithUploader.module.scss';

type Empty = unknown;

export const AvatarWithUploader = (props: AvatarProps): JSX.Element => {
  const user = useCoreUser();
  const saveImage = (file: File): Promise<Empty> => {
    return user.setProfileImage({ file }).catch(error => {
      alert(error);
    });
  };

  return (
    <ImageUploader
      title='Upload photo'
      subtitle='Select a profile photo'
      handleSuccess={saveImage}
      className={styles.wrapper}
      withResponsiveUploadIndicator={true}
    >
      <Avatar
        {...props}
        optimize
      />
    </ImageUploader>
  );
};
