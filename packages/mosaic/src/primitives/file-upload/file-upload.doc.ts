import type { ComponentDoc } from '../../docs-schema';
import type { FileUploadDropzoneProps } from './file-upload-dropzone';
import type { FileUploadItemProps } from './file-upload-item';
import type { FileUploadItemDeleteProps } from './file-upload-item-delete';
import type { FileUploadItemPreviewProps } from './file-upload-item-preview';
import type { FileUploadProps } from './file-upload-root';
import type { FileUploadTriggerProps } from './file-upload-trigger';

export default {
  name: 'FileUpload',
  description:
    'Headless, unstyled file picker and drop zone. Owns a hidden `<input type="file">`, checks each file against `accept` and `maxSize` for the picker and for drops, and reports the rest through `onReject`. `FileUpload.useFileUpload()` reads the files and actions inside the root; `FileUpload.useObjectUrl(file)` gives a preview URL that is revoked when the file changes or the caller unmounts.',
  useFor: [
    'a file picker behind your own button',
    'a drag and drop zone for files',
    'a metadata or key file upload',
    'a list of picked files with image thumbnails and remove buttons',
  ],
  keywords: ['file upload', 'file input', 'dropzone', 'drag and drop', 'attachment', 'picker', 'accept', 'maxSize'],
  practices: [
    { do: false, text: 'Use it for an avatar or logo row. Use `AvatarUpload` instead.' },
    { do: false, text: 'Render your own `<input type="file">`. The root owns one.' },
    {
      do: true,
      text: 'Show feedback from `onReject`. A rejected file is never added, while the accepted files in the same batch are.',
    },
    {
      do: true,
      text: 'Treat `data-drag-rejected` as a hint. During a drag the browser hides file names, so extension-only `accept` entries and blank types are not flagged.',
    },
    {
      do: true,
      text: 'Use `FileUpload.useObjectUrl` to show a picked image in your own element, instead of `URL.createObjectURL` by hand.',
    },
  ],
  parts: {
    'FileUpload.Root': {
      description:
        'Holds the selected files and the hidden input. Renders a `div`, or the `render` element, with `data-empty` and `data-disabled`. In single mode a new pick replaces the file; in multiple mode picks append.',
      props: {
        value: { type: 'File[]', doc: 'The selected files, when controlled.' },
        defaultValue: { type: 'File[]', doc: 'The selected files on mount, when uncontrolled.', default: '[]' },
        onValueChange: { type: '(files: File[]) => void', doc: 'Called with the full file list whenever it changes.' },
        multiple: { type: 'boolean', doc: 'Allows more than one file.', default: 'false' },
        accept: { type: 'string', doc: 'Native `accept` string, such as `image/*,.pdf`. Also applied to drops.' },
        maxSize: { type: 'number', doc: 'Largest size in bytes for one file.' },
        onReject: {
          type: '(rejections: FileRejection[]) => void',
          doc: 'Called with each rejected file and its reason: `accept`, `size`, or `overflow` for extra files in single mode.',
        },
        disabled: { type: 'boolean', doc: 'Disables the trigger, the drop zone and the picker.', default: 'false' },
        inputId: {
          type: 'string',
          doc: 'The hidden input `id`, so a `<label htmlFor>` opens the picker.',
          default: 'a generated id',
        },
      },
    },
    'FileUpload.Trigger': {
      description: 'A `button` that opens the native picker. Carries `data-disabled`.',
    },
    'FileUpload.Dropzone': {
      description:
        'A `div` that takes dropped files and ignores drags that carry none. Carries `data-dragging`, `data-drag-rejected` and `data-disabled`.',
    },
    'FileUpload.Item': {
      description: 'Wraps one picked file for `ItemPreview` and `ItemDelete`. Carries `data-image` for an image file.',
      props: { file: { type: 'File', doc: 'The file it represents, usually from `useFileUpload().files`.' } },
    },
    'FileUpload.ItemPreview': {
      description:
        "An `img` of the item's file, with the file name as `alt`. Renders nothing for a file that is not an image.",
    },
    'FileUpload.ItemDelete': {
      description: "A `button` that removes the item's file. Carries `data-disabled`.",
    },
  },
  examples: [
    {
      title: 'A drop zone with a file list',
      code: `
<FileUpload.Root accept='image/*' multiple onReject={showRejections}>
  <FileUpload.Dropzone>
    <FileUpload.Trigger>Choose files</FileUpload.Trigger>
  </FileUpload.Dropzone>
  <FileList />
</FileUpload.Root>

function FileList() {
  const { files } = FileUpload.useFileUpload();
  return files.map(file => (
    <FileUpload.Item key={file.name} file={file}>
      <FileUpload.ItemPreview />
      <FileUpload.ItemDelete>Remove</FileUpload.ItemDelete>
    </FileUpload.Item>
  ));
}
`,
    },
  ],
  related: ['AvatarUpload', 'ImageCropper'],
} satisfies ComponentDoc<{
  'FileUpload.Root': FileUploadProps;
  'FileUpload.Trigger': FileUploadTriggerProps;
  'FileUpload.Dropzone': FileUploadDropzoneProps;
  'FileUpload.Item': FileUploadItemProps;
  'FileUpload.ItemPreview': FileUploadItemPreviewProps;
  'FileUpload.ItemDelete': FileUploadItemDeleteProps;
}>;
