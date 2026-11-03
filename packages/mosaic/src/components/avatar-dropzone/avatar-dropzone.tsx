import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { ArrowUp } from '../../icons/glyphs/arrow-up';
import { FileUpload } from '../../primitives/file-upload';
import type { MosaicComponentProps, MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { Icon } from '../icon';
import { avatarDropzoneScope } from './avatar-dropzone.markers.stylex';
import { styles } from './avatar-dropzone.styles';

export type AvatarDropzoneProps = MosaicComponentProps<'div'>;

const AvatarDropzoneRoot = React.forwardRef<HTMLDivElement, AvatarDropzoneProps>(function MosaicAvatarDropzoneRoot(
  { xstyle, ...rest },
  ref,
) {
  return (
    <FileUpload.Dropzone
      ref={ref}
      {...mergeStyleProps(themeProps('avatar-dropzone'), stylex.props(avatarDropzoneScope, xstyle), rest)}
    />
  );
});

export type AvatarDropzoneOverlayProps = MosaicElementProps<'span'>;

const AvatarDropzoneOverlay = React.forwardRef<HTMLSpanElement, AvatarDropzoneOverlayProps>(
  function MosaicAvatarDropzoneOverlay({ xstyle, ...rest }, ref) {
    return (
      <span
        ref={ref}
        aria-hidden
        {...mergeStyleProps(
          themeProps('avatar-dropzone-overlay'),
          stylex.props(reset.base, styles.overlay, xstyle),
          rest,
        )}
      >
        <Icon glyph={ArrowUp} />
      </span>
    );
  },
);

export const AvatarDropzone = {
  Root: AvatarDropzoneRoot,
  Overlay: AvatarDropzoneOverlay,
};
