# FileUpload

A headless file upload primitive. Users can pick files through a `Trigger` button or by dragging
them onto a `Dropzone`, and selected files render as compound `Item` parts with an optional image
`Preview`. Supports controlled/uncontrolled selection, `accept` filtering (applied to both the
picker and dropped files), single/multiple modes, and a disabled state.

## When to Use

- Any file input where you want the native picker behind your own styled trigger.
- Drag-and-drop upload zones with live image thumbnails.
- Avatar / logo pickers (single mode) or multi-file attachment lists (multiple mode).

The primitive owns a hidden `<input type="file">` internally, so you never render one yourself. It
emits zero styles — everything is driven by `data-cl-*` attributes.

## Usage

```tsx
import { FileUpload } from '@clerk/headless/file-upload';

function Uploader() {
  return (
    <FileUpload.Root
      accept='image/*'
      multiple
    >
      <FileUpload.Dropzone>
        <FileUpload.Trigger>Choose files</FileUpload.Trigger>
        <p>or drag files here</p>
      </FileUpload.Dropzone>

      <FileList />
    </FileUpload.Root>
  );
}

// Read the live file list and render each file as an Item.
function FileList() {
  const { files } = FileUpload.useFileUpload();
  return (
    <ul>
      {files.map(file => (
        <li key={file.name}>
          <FileUpload.Item file={file}>
            <FileUpload.ItemPreview />
            <span>{file.name}</span>
            <FileUpload.ItemDelete>Remove</FileUpload.ItemDelete>
          </FileUpload.Item>
        </li>
      ))}
    </ul>
  );
}
```

`ItemPreview` renders an `<img>` only for image files; for other types it renders nothing, so it is
safe to include unconditionally.

### Controlled

```tsx
const [files, setFiles] = useState<File[]>([]);

<FileUpload.Root
  value={files}
  onValueChange={setFiles}
>
  {/* ... */}
</FileUpload.Root>;
```

### Single file (avatar)

```tsx
<FileUpload.Root accept='image/*'>
  <FileUpload.Trigger>Upload avatar</FileUpload.Trigger>
</FileUpload.Root>
```

In single mode a new selection replaces the previous file; in multiple mode selections are appended.

### Validation

`accept` and `maxSize` reject non-matching files, and `onReject` reports them so you can show an
error. Rejections fire for both the picker and drops; accepted files in the same batch are still
added.

```tsx
<FileUpload.Root
  accept='image/png,image/jpeg'
  maxSize={10 * 1000 * 1000}
  onReject={rejections => {
    for (const { file, reason } of rejections) {
      setError(reason === 'size' ? `${file.name} is too large` : `${file.name} is not a supported type`);
    }
  }}
  onValueChange={([file]) => file && upload(file)}
>
  <FileUpload.Trigger>Upload</FileUpload.Trigger>
</FileUpload.Root>
```

## Parts

| Part                     | Default Element | Description                                                         |
| ------------------------ | --------------- | ------------------------------------------------------------------- |
| `FileUpload.Root`        | `<div>`         | Owns the file state + hidden input, provides context                |
| `FileUpload.Trigger`     | `<button>`      | Opens the native file picker                                        |
| `FileUpload.Dropzone`    | `<div>`         | Drag-and-drop target; filters dropped files by `accept`             |
| `FileUpload.Item`        | `<div>`         | Wraps a single selected file, provides item context                 |
| `FileUpload.ItemPreview` | `<img>`         | Image thumbnail for the item's file (renders nothing for non-image) |
| `FileUpload.ItemDelete`  | `<button>`      | Removes the item's file                                             |

`FileUpload.useFileUpload()` is a hook (not a component) that returns
`{ files, addFiles, removeFile, clearFiles, openFilePicker, disabled }` for reading the selection
and driving custom UI. It must be called inside `FileUpload.Root`.

## Props

### `FileUpload.Root`

| Prop            | Type                                    | Default | Description                                                    |
| --------------- | --------------------------------------- | ------- | -------------------------------------------------------------- |
| `value`         | `File[]`                                | —       | Controlled list of selected files                              |
| `defaultValue`  | `File[]`                                | `[]`    | Initial list of files (uncontrolled)                           |
| `onValueChange` | `(files: File[]) => void`               | —       | Called with the full list whenever it changes                  |
| `multiple`      | `boolean`                               | `false` | Allow selecting more than one file                             |
| `accept`        | `string`                                | —       | `accept` string (e.g. `image/*,.pdf`), also filters drops      |
| `maxSize`       | `number`                                | —       | Max size in bytes for a single file; larger files are rejected |
| `onReject`      | `(rejections: FileRejection[]) => void` | —       | Called with files rejected by `accept` or `maxSize`            |
| `disabled`      | `boolean`                               | `false` | Disables the trigger, dropzone, and picker                     |

A `FileRejection` is `{ file: File; reason: 'accept' | 'size' }`. Rejections are reported for both
the picker and drops; `accept` is checked before `maxSize`. Accepted files in the same batch are
still added.

### `FileUpload.Item`

| Prop   | Type   | Default | Description                   |
| ------ | ------ | ------- | ----------------------------- |
| `file` | `File` | —       | The file this item represents |

Other parts take no additional props. All parts accept a `render` prop for polymorphic rendering and
standard HTML attributes for their default element.

## Data Attributes

| Attribute          | Applies To                          | Description                                     |
| ------------------ | ----------------------------------- | ----------------------------------------------- |
| `data-cl-slot`     | All parts                           | Part identifier (e.g. `"file-upload-dropzone"`) |
| `data-cl-empty`    | Root                                | Present when no files are selected              |
| `data-cl-dragging` | Dropzone                            | Present while a valid drag is over the zone     |
| `data-cl-image`    | Item                                | Present when the item's file is an image        |
| `data-cl-disabled` | Root, Trigger, Dropzone, ItemDelete | Present when disabled                           |

## ARIA

- The hidden `<input type="file">` is `aria-hidden` and removed from the tab order; the `Trigger`
  button is the accessible control and forwards its click to the input.
- `Trigger` and `ItemDelete` render real `<button type="button">` elements and reflect `disabled`.
- `Dropzone` sets `aria-disabled` when the upload is disabled.
- `ItemPreview` uses the file name as its `alt` text.
