import type { LocalizableError } from '../localization';
import type { FileRejectionReason } from '../primitives/file-upload';

export const AVATAR_UPLOAD = {
  accept: 'image/png,image/jpeg,image/gif,image/webp',
  /** Matches the limit the row's own description advertises. */
  maxSize: 10 * 1000 * 1000,
} as const;

/** Rejecting a pick locally reads the same as the server rejecting the upload. */
export const AVATAR_REJECTION_ERRORS: Record<FileRejectionReason, LocalizableError> = {
  accept: { code: 'avatar_file_type_invalid' },
  size: { code: 'avatar_file_size_exceeded' },
  overflow: { code: 'avatar_file_count_exceeded' },
};
