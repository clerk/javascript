import * as stylex from '@stylexjs/stylex';
import { createContext, useContext } from 'react';

import type { ActionMenuAction } from '../../components/action-menu';
import { ActionMenu } from '../../components/action-menu';
import type { AvatarProps } from '../../components/avatar';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { useOptionalFieldControlProps } from '../../components/field/field.context';
import { Icon } from '../../components/icon';
import { ArrowUp } from '../../icons/glyphs/arrow-up';
import { Block } from '../../icons/glyphs/block';
import type { FileUploadProps } from '../../primitives/file-upload';
import { FileUpload } from '../../primitives/file-upload';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { AVATAR_UPLOAD } from '../../utils/avatar-upload';
import { avatarUploadDropzoneScope } from './avatar-upload.markers.stylex';
import { styles } from './avatar-upload.styles';

export interface AvatarUploadRootProps extends Omit<
  FileUploadProps,
  'accept' | 'maxSize' | 'multiple' | 'value' | 'defaultValue' | 'onValueChange' | 'onChange'
> {
  name: string;
  imageUrl?: string;
  hasImage: boolean;
  onChange?: (file: File) => void;
  onRemove?: () => void;
}

export type AvatarUploadDropzoneProps = MosaicComponentProps<'div'>;

export type AvatarUploadImageProps = Omit<AvatarProps, 'children'>;

export interface AvatarUploadActionsLabels {
  upload: string;
  manage: string;
  change: string;
  remove: string;
}

export interface AvatarUploadActionsProps extends Omit<MosaicComponentProps<'div'>, 'children'> {
  labels: AvatarUploadActionsLabels;
}

export const AvatarUpload = {
  Root,
  Dropzone,
  Image,
  Actions,
};

function Root({ name, imageUrl, hasImage, onChange, onRemove, disabled = false, ...rest }: AvatarUploadRootProps) {
  const field = useOptionalFieldControlProps({ disabled });

  return (
    <AvatarUploadContext.Provider value={{ name, imageUrl, hasImage, canChange: Boolean(onChange), onRemove }}>
      <FileUpload.Root
        {...AVATAR_UPLOAD}
        {...rest}
        inputId={field?.id}
        disabled={(field?.disabled ?? disabled) || !onChange}
        onValueChange={files => {
          const file = files[0];
          if (file) {
            onChange?.(file);
          }
        }}
      />
    </AvatarUploadContext.Provider>
  );
}

function Dropzone({ xstyle, ...rest }: AvatarUploadDropzoneProps) {
  return (
    <FileUpload.Dropzone
      {...mergeStyleProps(
        themeProps('avatar-upload-dropzone'),
        stylex.props(avatarUploadDropzoneScope, styles.dropzone, xstyle),
        rest,
      )}
    />
  );
}

function Image(props: AvatarUploadImageProps) {
  const { name, imageUrl } = useAvatarUploadContext();

  return (
    <Avatar.Root {...props}>
      <Avatar.Image
        alt={name}
        src={imageUrl}
      />
      <Avatar.Fallback>{initials(name)}</Avatar.Fallback>
      <span
        aria-hidden
        {...mergeStyleProps(themeProps('avatar-upload-overlay'), stylex.props(reset.base, styles.overlay))}
      >
        <Icon
          glyph={ArrowUp}
          xstyle={styles.acceptIcon}
        />
        <Icon
          glyph={Block}
          xstyle={styles.rejectIcon}
        />
      </span>
    </Avatar.Root>
  );
}

function Actions({ labels, render, ...rest }: AvatarUploadActionsProps) {
  const { hasImage, canChange, onRemove } = useAvatarUploadContext();
  const { openFilePicker } = FileUpload.useFileUpload();
  const actions: ActionMenuAction[] = [];

  if (hasImage && canChange) {
    actions.push({ label: labels.change, onClick: openFilePicker });
  }

  if (hasImage && onRemove) {
    actions.push({ label: labels.remove, color: 'negative', onClick: onRemove });
  }

  const control =
    actions.length > 0 ? (
      <ActionMenu
        actions={actions}
        label={labels.manage}
      />
    ) : !hasImage && canChange ? (
      <FileUpload.Trigger
        render={
          <Button
            color='neutral'
            size='sm'
            variant='outline'
          />
        }
      >
        {labels.upload}
      </FileUpload.Trigger>
    ) : null;

  const element = useRender({ defaultTagName: 'div', render, props: { ...rest, children: control } });

  return control ? element : null;
}

interface AvatarUploadContextValue {
  name: string;
  imageUrl: string | undefined;
  hasImage: boolean;
  canChange: boolean;
  onRemove: (() => void) | undefined;
}

const AvatarUploadContext = createContext<AvatarUploadContextValue | null>(null);

function useAvatarUploadContext() {
  const context = useContext(AvatarUploadContext);
  if (!context) {
    throw new Error('AvatarUpload parts must be rendered inside <AvatarUpload.Root>');
  }
  return context;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
