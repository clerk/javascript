import * as stylex from '@stylexjs/stylex';
import { createContext, useContext, useState } from 'react';

import type { ActionMenuAction } from '../../components/action-menu';
import { ActionMenu } from '../../components/action-menu';
import type { AvatarProps } from '../../components/avatar';
import { Avatar } from '../../components/avatar';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { useOptionalFieldControlProps } from '../../components/field/field.context';
import { Icon } from '../../components/icon';
import { type PendingAction, usePendingAction } from '../../hooks/use-pending-action';
import { ArrowUp } from '../../icons/glyphs/arrow-up';
import { Block } from '../../icons/glyphs/block';
import { Minus } from '../../icons/glyphs/minus';
import { Plus } from '../../icons/glyphs/plus';
import type { FileUploadProps } from '../../primitives/file-upload';
import { FileUpload } from '../../primitives/file-upload';
import { type Crop, ImageCropper, INITIAL_CROP } from '../../primitives/image-cropper';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { AVATAR_UPLOAD, cropAvatar, croppedFile, skipsCrop } from '../../utils/avatar-upload';
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

export interface AvatarUploadCropLabels {
  title: string;
  frame: string;
  zoom: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
  cancel: string;
  save: string;
}

export interface AvatarUploadCropProps {
  labels: AvatarUploadCropLabels;
  /** The mask over the frame, matching how the image is shown once saved. @default 'circle' */
  shape?: 'circle' | 'square';
}

export const AvatarUpload = {
  Root,
  Dropzone,
  Image,
  Actions,
  Crop,
};

interface Pick {
  id: number;
  file: File;
  open: boolean;
}

function Root({ name, imageUrl, hasImage, onChange, onRemove, disabled = false, ...rest }: AvatarUploadRootProps) {
  const field = useOptionalFieldControlProps({ disabled });
  const [pick, setPick] = useState<Pick>();

  return (
    <AvatarUploadContext.Provider
      value={{
        name,
        imageUrl,
        hasImage,
        canChange: Boolean(onChange),
        onChange,
        onRemove,
        pick,
        closeCrop: () => setPick(current => (current ? { ...current, open: false } : current)),
      }}
    >
      <FileUpload.Root
        {...AVATAR_UPLOAD}
        {...rest}
        inputId={field?.id}
        disabled={(field?.disabled ?? disabled) || !onChange}
        onValueChange={files => {
          const file = files[0];
          if (!file) {
            return;
          }
          void skipsCrop(file)
            .catch(() => false)
            .then(skip => {
              if (skip) {
                onChange?.(file);
              } else {
                setPick(current => ({ id: (current?.id ?? 0) + 1, file, open: true }));
              }
            });
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

function Crop({ labels, shape = 'circle' }: AvatarUploadCropProps) {
  const { pick, closeCrop } = useAvatarUploadContext();
  const src = FileUpload.useObjectUrl(pick?.file);
  const save = usePendingAction();

  return (
    <Dialog.Root
      open={pick?.open ?? false}
      onOpenChange={open => {
        if (!open && !save.isPending) {
          save.reset();
          closeCrop();
        }
      }}
      shouldCloseOnInteractOutside={false}
    >
      <Dialog.Popup variant='card'>
        {pick && src ? (
          <CropStep
            key={pick.id}
            file={pick.file}
            src={src}
            labels={labels}
            shape={shape}
            save={save}
          />
        ) : null}
      </Dialog.Popup>
    </Dialog.Root>
  );
}

interface CropStepProps extends Required<AvatarUploadCropProps> {
  file: File;
  src: string;
  save: PendingAction<string>;
}

function CropStep({ file, src, labels, shape, save }: CropStepProps) {
  const { onChange, closeCrop } = useAvatarUploadContext();
  const [crop, setCrop] = useState<Crop>(INITIAL_CROP);

  const apply = () =>
    save.run('crop', async () => {
      const blob = await cropAvatar(src, crop, file.type);
      onChange?.(croppedFile(file, blob));
      closeCrop();
    });

  return (
    <Card.Root
      elevation='overlay'
      renderBranding={false}
    >
      <Card.Header>
        <Card.Title>{labels.title}</Card.Title>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {save.error}
      </Card.Banner>
      <ImageCropper.Root
        src={src}
        value={crop}
        onValueChange={setCrop}
        disabled={save.isPending}
      >
        <Card.Content xstyle={styles.cropContent}>
          <ImageCropper.Viewport
            aria-label={labels.frame}
            {...mergeStyleProps(
              themeProps('avatar-upload-crop-frame'),
              stylex.props(styles.frame, focusOutline.visible),
            )}
          >
            <ImageCropper.Area {...mergeStyleProps(themeProps('avatar-upload-crop-area'), stylex.props(styles.area))}>
              <ImageCropper.Image />
              <span
                aria-hidden
                {...stylex.props(styles.mask, shape === 'circle' && styles.circleMask)}
              />
            </ImageCropper.Area>
          </ImageCropper.Viewport>
          <div {...stylex.props(styles.zoomRow)}>
            <ImageCropper.ZoomOut
              aria-label={labels.zoomOut}
              render={
                <Button
                  color='neutral'
                  size='sm'
                  shape='circle'
                  variant='ghost'
                />
              }
            >
              <Icon glyph={Minus} />
            </ImageCropper.ZoomOut>
            <ImageCropper.Zoom
              aria-label={labels.zoom}
              {...mergeStyleProps(
                themeProps('avatar-upload-crop-zoom'),
                stylex.props(styles.zoom, focusOutline.visible),
              )}
            />
            <ImageCropper.ZoomIn
              aria-label={labels.zoomIn}
              render={
                <Button
                  color='neutral'
                  size='sm'
                  shape='circle'
                  variant='ghost'
                />
              }
            >
              <Icon glyph={Plus} />
            </ImageCropper.ZoomIn>
          </div>
        </Card.Content>
        <Card.Footer>
          <ImageCropper.Reset
            render={
              <Button
                color='neutral'
                variant='ghost'
                fullWidth={false}
              />
            }
          >
            {labels.reset}
          </ImageCropper.Reset>
          <div {...stylex.props(styles.footerActions)}>
            <Dialog.Close
              disabled={save.isPending}
              render={
                <Button
                  color='neutral'
                  variant='outline'
                />
              }
            >
              {labels.cancel}
            </Dialog.Close>
            <SubmitButton
              type='button'
              isPending={save.isPending}
              onClick={() => void apply()}
            >
              {labels.save}
            </SubmitButton>
          </div>
        </Card.Footer>
      </ImageCropper.Root>
    </Card.Root>
  );
}

interface AvatarUploadContextValue {
  name: string;
  imageUrl: string | undefined;
  hasImage: boolean;
  canChange: boolean;
  onChange: ((file: File) => void) | undefined;
  onRemove: (() => void) | undefined;
  pick: Pick | undefined;
  closeCrop: () => void;
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
