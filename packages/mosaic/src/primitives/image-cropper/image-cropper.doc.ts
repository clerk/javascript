import type { ComponentDoc } from '../../docs-schema';
import type { ImageCropperAreaProps } from './image-cropper-area';
import type { ImageCropperImageProps } from './image-cropper-image';
import type { ImageCropperResetProps } from './image-cropper-reset';
import type { ImageCropperRootProps } from './image-cropper-root';
import type { ImageCropperRotateProps } from './image-cropper-rotate';
import type { ImageCropperViewportProps } from './image-cropper-viewport';
import type { ImageCropperZoomProps } from './image-cropper-zoom';
import type { ImageCropperZoomInProps, ImageCropperZoomOutProps } from './image-cropper-zoom-step';

export default {
  name: 'ImageCropper',
  description:
    'Headless, unstyled square image cropper. The user pans by dragging or with the arrow keys, zooms with the wheel, a pinch, the keyboard, a slider or step buttons, turns the image a quarter at a time, and resets it. The crop is a `Crop` (`{ x, y, zoom, rotation }`), with zoom clamped between the zoom where the whole image fits in the frame and `maxZoom`. At zoom `1` and above the image covers the frame. Below `1` the frame shows empty space along the short side of the image, and the long side stays cropped until the minimum zoom, where the whole image fits. `cropImage(src, crop, { type, size })` draws the chosen square into a `Blob`. Every control stays disabled until the image has loaded.',
  useFor: [
    'cropping a picked image to a square before upload',
    'pan, zoom and rotate controls for an image',
    'drawing a cropped image to a blob',
  ],
  keywords: ['crop', 'cropper', 'image', 'zoom', 'rotate', 'pan', 'avatar', 'logo', 'cropImage', 'INITIAL_CROP'],
  practices: [
    {
      do: false,
      text: 'Build an avatar or logo crop dialog from it. Use `AvatarUpload`, which already wraps the cropper.',
    },
    {
      do: true,
      text: 'Give `Viewport` an `aria-label` that names the keys. It has `role="application"` and the image has an empty `alt`.',
    },
    { do: true, text: 'Give icon-only `ZoomIn`, `ZoomOut`, `Rotate` and `Reset` buttons an `aria-label`.' },
    {
      do: true,
      text: 'Size the frame, any mask and the controls yourself. The primitive emits no styles apart from placing the image.',
    },
    {
      do: true,
      text: 'Read the output type from the blob `cropImage` returns. A browser that cannot encode `type` returns `image/png`.',
    },
  ],
  parts: {
    'ImageCropper.Root': {
      description: 'Owns the crop and the image size and provides them to the parts. Renders no element.',
      props: {
        src: { type: 'string', doc: 'The image to crop, such as an object URL for a picked file.' },
        value: { type: 'Crop', doc: 'The crop, when controlled.' },
        defaultValue: { type: 'Crop', doc: 'The crop on mount, when uncontrolled.', default: '`INITIAL_CROP`' },
        onValueChange: {
          type: '(crop: Crop) => void',
          doc: 'Called with the next crop on every pan, zoom, turn and reset.',
        },
        maxZoom: {
          type: 'number',
          doc: 'Largest zoom, as a multiple of the scale that covers the frame.',
          default: '4',
        },
        disabled: { type: 'boolean', doc: 'Ignores every gesture and disables the controls.', default: 'false' },
      },
    },
    'ImageCropper.Viewport': {
      description:
        'The frame, a `div` with `role="application"`. Pans on drag and arrow keys (Shift for more), zooms on wheel, pinch and `+`/`-`, resets on `0`. Leaves the tab order until the image loads. Carries `data-dragging` and `data-disabled`.',
    },
    'ImageCropper.Area': {
      description:
        'Optional `div` marking the square that is cropped when it is smaller than the frame. Drags are measured against it, and the `Viewport` around it shows the rest of the image.',
    },
    'ImageCropper.Image': {
      description:
        'The `img`, placed by the crop and hidden until loaded. Reports its size on load and carries `data-loaded`.',
    },
    'ImageCropper.Zoom': {
      description:
        'An `input type="range"` from the zoom where the whole image fits to `maxZoom`. Carries `data-disabled`.',
    },
    'ImageCropper.ZoomIn': {
      description: 'A `button` that zooms in one `ZOOM_STEP`. Disabled at `maxZoom`. Carries `data-disabled`.',
    },
    'ImageCropper.ZoomOut': {
      description:
        'A `button` that zooms out one `ZOOM_STEP`. Disabled once the whole image fits in the frame. Carries `data-disabled`.',
    },
    'ImageCropper.Rotate': {
      description: 'A `button` that turns the image a quarter clockwise. Carries `data-disabled`.',
    },
    'ImageCropper.Reset': {
      description: 'A `button` that returns to `INITIAL_CROP`. Carries `data-disabled`.',
    },
  },
  examples: [
    {
      title: 'Crop and save',
      code: `
const [crop, setCrop] = useState<Crop>(INITIAL_CROP);

<ImageCropper.Root src={src} value={crop} onValueChange={setCrop}>
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
`,
    },
  ],
  related: ['AvatarUpload', 'FileUpload'],
} satisfies ComponentDoc<{
  'ImageCropper.Root': ImageCropperRootProps;
  'ImageCropper.Viewport': ImageCropperViewportProps;
  'ImageCropper.Area': ImageCropperAreaProps;
  'ImageCropper.Image': ImageCropperImageProps;
  'ImageCropper.Zoom': ImageCropperZoomProps;
  'ImageCropper.ZoomIn': ImageCropperZoomInProps;
  'ImageCropper.ZoomOut': ImageCropperZoomOutProps;
  'ImageCropper.Rotate': ImageCropperRotateProps;
  'ImageCropper.Reset': ImageCropperResetProps;
}>;
