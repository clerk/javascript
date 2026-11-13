import type { LocalizableError } from '../localization';
import type { FileRejectionReason } from '../primitives/file-upload';
import { type Crop, cropImage } from '../primitives/image-cropper';
import { SaveError } from './errors';

export const AVATAR_UPLOAD = {
  accept: 'image/png,image/jpeg,image/gif,image/webp',
  /** Matches the limit the row's own description advertises. */
  maxSize: 10 * 1000 * 1000,
} as const;

/** A crop is never drawn larger than the image, and a side never passes `maxSide`, which phones can still draw. */
const AVATAR_CROP = { maxSide: 4096, attempts: 3 } as const;

/**
 * Crops the picked image in its own format and at its own resolution. A JPEG zoomed out past the
 * frame is saved as PNG, because JPEG would fill the empty frame around it with black. A crop that encodes over
 * `AVATAR_UPLOAD.maxSize` is drawn smaller until it fits, or fails with the size error after `AVATAR_CROP.attempts` tries.
 */
export async function cropAvatar(src: string, crop: Crop, type: string): Promise<Blob> {
  const output = crop.zoom < 1 && type === 'image/jpeg' ? 'image/png' : type;
  let scale = 1;
  for (let attempt = 1; ; attempt++) {
    const blob = await cropImage(src, crop, {
      type: output,
      size: side => Math.min(side, AVATAR_CROP.maxSide) * scale,
    });
    if (blob.size <= AVATAR_UPLOAD.maxSize) {
      return blob;
    }
    if (attempt === AVATAR_CROP.attempts) {
      throw new SaveError({ global: AVATAR_REJECTION_ERRORS.size });
    }
    scale *= Math.sqrt(AVATAR_UPLOAD.maxSize / blob.size) * 0.9;
  }
}

/** A GIF, animated PNG or animated WebP is uploaded as picked, because drawing it to a canvas keeps only its first frame. */
export async function skipsCrop(file: File): Promise<boolean> {
  if (file.type === 'image/gif') {
    return true;
  }
  if (file.type !== 'image/png' && file.type !== 'image/webp') {
    return false;
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  return file.type === 'image/png' ? isAnimatedPng(bytes) : isAnimatedWebp(bytes);
}

/** The cropped image as a file named after the one the user picked, with an extension for the type it was saved as. */
export function croppedFile(picked: File, blob: Blob): File {
  if (blob.type === picked.type) {
    return new File([blob], picked.name, { type: blob.type });
  }
  const base = picked.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${base}.${blob.type.replace('image/', '')}`, { type: blob.type });
}

const ascii = (bytes: Uint8Array, from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));

function isAnimatedPng(bytes: Uint8Array): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let at = 8; at + 8 <= bytes.length; at += 12 + view.getUint32(at)) {
    const chunk = ascii(bytes, at + 4, at + 8);
    if (chunk === 'acTL') {
      return true;
    }
    if (chunk === 'IDAT') {
      return false;
    }
  }
  return false;
}

function isAnimatedWebp(bytes: Uint8Array): boolean {
  const animationFlag = 0x02;
  return ascii(bytes, 12, 16) === 'VP8X' && ((bytes[20] ?? 0) & animationFlag) !== 0;
}

/** Rejecting a pick locally reads the same as the server rejecting the upload. */
export const AVATAR_REJECTION_ERRORS: Record<FileRejectionReason, LocalizableError> = {
  accept: { code: 'avatar_file_type_invalid' },
  size: { code: 'avatar_file_size_exceeded' },
  overflow: { code: 'avatar_file_count_exceeded' },
};
