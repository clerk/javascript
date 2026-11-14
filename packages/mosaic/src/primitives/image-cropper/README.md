# ImageCropper

A headless image cropper. The user pans the image by dragging or with the arrow keys, zooms with the
wheel, a pinch, the keyboard, a slider or step buttons, turns it a quarter at a time, and resets it.
The crop is a square. `cropImage` draws the square the user chose into a new image.

## When to Use

- Cropping a picked image to a square before uploading it, such as an avatar or a logo.

The primitive emits zero styles. The caller sizes the frame, draws any mask over it, and styles the
controls through `data-*` attributes.

## Usage

```tsx
import { useState } from 'react';

import { type Crop, cropImage, ImageCropper, INITIAL_CROP } from '../../primitives/image-cropper';

function Cropper({ src, onSave }: { src: string; onSave: (blob: Blob) => void }) {
  const [crop, setCrop] = useState<Crop>(INITIAL_CROP);

  return (
    <ImageCropper.Root
      src={src}
      value={crop}
      onValueChange={setCrop}
    >
      <ImageCropper.Viewport aria-label='Crop. Drag or use the arrow keys to move, plus and minus to zoom.'>
        <ImageCropper.Area>
          <ImageCropper.Image />
        </ImageCropper.Area>
      </ImageCropper.Viewport>
      <ImageCropper.ZoomOut aria-label='Zoom out'>−</ImageCropper.ZoomOut>
      <ImageCropper.Zoom aria-label='Zoom' />
      <ImageCropper.ZoomIn aria-label='Zoom in'>+</ImageCropper.ZoomIn>
      <ImageCropper.Rotate>Rotate</ImageCropper.Rotate>
      <ImageCropper.Reset>Reset</ImageCropper.Reset>
      <button onClick={async () => onSave(await cropImage(src, crop, { type: 'image/png' }))}>Save</button>
    </ImageCropper.Root>
  );
}
```

`Area` is optional. Without it the whole `Viewport` is the crop. With it, the crop is the `Area`, and
the `Viewport` around it shows the rest of the image for context. Drags are measured against the
`Area`, so the image follows the pointer either way.

## Parts

| Part                    | Default Element        | Description                                                            |
| ----------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `ImageCropper.Root`     | none                   | Owns the crop and the image size, provides context                     |
| `ImageCropper.Viewport` | `<div>`                | The frame: pans on drag and arrow keys, zooms on wheel, pinch and keys |
| `ImageCropper.Area`     | `<div>`                | The square that is cropped, when it is smaller than the frame          |
| `ImageCropper.Image`    | `<img>`                | The image, placed by the crop. Reports its size on load                |
| `ImageCropper.Zoom`     | `<input type="range">` | Sets the zoom, from `minZoom` to `maxZoom`                             |
| `ImageCropper.ZoomIn`   | `<button>`             | Zooms in one step. Disabled at `maxZoom`                               |
| `ImageCropper.ZoomOut`  | `<button>`             | Zooms out one step. Disabled at `minZoom`                              |
| `ImageCropper.Rotate`   | `<button>`             | Turns the image a quarter clockwise                                    |
| `ImageCropper.Reset`    | `<button>`             | Returns to `INITIAL_CROP`                                              |

Every control stays disabled until the image has loaded, because the crop limits depend on its size.

## Props

### `ImageCropper.Root`

| Prop            | Type                   | Default        | Description                                     |
| --------------- | ---------------------- | -------------- | ----------------------------------------------- |
| `src`           | `string`               | —              | The image to crop, such as an object URL        |
| `value`         | `Crop`                 | —              | Controlled crop                                 |
| `defaultValue`  | `Crop`                 | `INITIAL_CROP` | Initial crop (uncontrolled)                     |
| `onValueChange` | `(crop: Crop) => void` | —              | Called on every pan, zoom, turn and reset       |
| `maxZoom`       | `number`               | `4`            | Largest zoom, as a multiple of the cover scale  |
| `disabled`      | `boolean`              | `false`        | Ignores every gesture and disables the controls |

A `Crop` is `{ x, y, zoom, rotation }`. `x` and `y` move the image centre from the frame centre, as a
fraction of the frame. `zoom` 1 is the smallest scale that still covers the frame. Below 1 the image
zooms out until it fits inside the frame, such as `0.5` for an image twice as wide as it is tall. `rotation` is `0`, `90`, `180` or `270`. The crop is always clamped so each edge of the image
stops at the frame's: an image larger than the frame covers it, and a smaller one stays inside it.

Other parts take no additional props. All parts except `Root` accept a `render` prop and standard
HTML attributes for their default element.

### `cropImage(src, crop, { type, size })`

Returns a `Promise<Blob>` holding the square the crop shows, encoded as `type`. A browser that
cannot encode `type` returns `image/png`, so read the type from the blob. The square keeps the
image's own resolution unless `size` says otherwise: it gets the square's side in the image's pixels
and returns the side to draw, such as `side => Math.min(side, 1024)` to cap it. Colors outside sRGB
are kept. It draws to a canvas, so an animated image keeps only its first frame. Below zoom 1 the
square is larger than the image and the area around it is left transparent, which a type without
transparency, such as `image/jpeg`, fills with black.

## Keyboard

On a focused `Viewport`:

| Key        | Action                   |
| ---------- | ------------------------ |
| Arrow keys | Pan. Hold Shift for more |
| `+` / `=`  | Zoom in one step         |
| `-` / `_`  | Zoom out one step        |
| `0`        | Reset                    |

## Data Attributes

| Attribute       | Applies To                                     | Description                         |
| --------------- | ---------------------------------------------- | ----------------------------------- |
| `data-dragging` | Viewport                                       | Present while a pointer is dragging |
| `data-loaded`   | Image                                          | Present once the image has loaded   |
| `data-disabled` | Viewport, Zoom, ZoomIn, ZoomOut, Rotate, Reset | Present when the part is disabled   |

## ARIA

- `Viewport` has `role="application"` so screen readers pass the arrow keys through. Give it an
  `aria-label` that names the keys. It leaves the tab order until the image has loaded.
- `Image` has an empty `alt`, because the `Viewport` label describes it.
- `ZoomIn`, `ZoomOut`, `Rotate` and `Reset` render `<button type="button">`. Give icon-only buttons an
  `aria-label`.
