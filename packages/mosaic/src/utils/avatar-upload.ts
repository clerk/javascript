import type { LocalizableError } from '../localization';
import type { FileRejectionReason } from '../primitives/file-upload';

export const AVATAR_UPLOAD = {
  accept: 'image/png,image/jpeg,image/gif,image/webp',
  /** Matches the limit the row's own description advertises. */
  maxSize: 10 * 1000 * 1000,
} as const;

/** A crop is saved as a square PNG, which keeps a logo's transparency. */
export const AVATAR_CROP = { size: 512, type: 'image/png' } as const;

/** A GIF is uploaded as picked, because drawing it to a canvas keeps only its first frame. */
export function skipsCrop(file: File): boolean {
  return file.type === 'image/gif';
}

/** The cropped image as a file named after the one the user picked. */
export function croppedFile(picked: File, blob: Blob): File {
  const base = picked.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${base}.png`, { type: blob.type });
}

/** Rejecting a pick locally reads the same as the server rejecting the upload. */
export const AVATAR_REJECTION_ERRORS: Record<FileRejectionReason, LocalizableError> = {
  accept: { code: 'avatar_file_type_invalid' },
  size: { code: 'avatar_file_size_exceeded' },
  overflow: { code: 'avatar_file_count_exceeded' },
};
