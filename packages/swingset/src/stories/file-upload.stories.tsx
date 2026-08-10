import { FileUpload } from '@clerk/headless/file-upload';

import type { StoryMeta } from '@/lib/types';

// Headless primitives ship no styles. This single demo renders the primitive raw —
// unstyled — so it faithfully reflects what `@clerk/headless` provides: file selection via
// a trigger or drag-and-drop, live image previews, and the `data-*` attributes each part
// emits, with zero appearance. The only inline styles below constrain the preview thumbnail
// so a full-resolution image can't blow out the demo; they are not part of the primitive.
// It is embedded once into the overview via `<Story>` in the MDX (the one thing prose can't
// convey: that picking or dropping a file actually renders a preview). There is no
// interactive knob canvas for headless primitives.

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'FileUpload',
  label: 'File Upload',
  source: 'packages/headless/src/primitives/file-upload/index.ts',
};

function SelectedFiles() {
  const { files } = FileUpload.useFileUpload();
  if (files.length === 0) {
    return null;
  }
  return (
    <ul>
      {files.map(file => (
        <li key={`${file.name}-${file.size}-${file.lastModified}`}>
          <FileUpload.Item file={file}>
            <FileUpload.ItemPreview style={{ width: 48, height: 48, objectFit: 'cover' }} />
            <span>{file.name}</span>
            <FileUpload.ItemDelete>Remove</FileUpload.ItemDelete>
          </FileUpload.Item>
        </li>
      ))}
    </ul>
  );
}

export function Default() {
  return (
    <FileUpload.Root
      accept='image/*'
      multiple
    >
      <FileUpload.Dropzone>
        <FileUpload.Trigger>Choose images</FileUpload.Trigger>
        <span> or drag images here</span>
      </FileUpload.Dropzone>
      <SelectedFiles />
    </FileUpload.Root>
  );
}
