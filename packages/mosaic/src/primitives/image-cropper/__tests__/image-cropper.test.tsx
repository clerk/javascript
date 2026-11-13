import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import type { Crop } from '../crop';
import { ImageCropper, type ImageCropperRootProps } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Harness(props: Partial<ImageCropperRootProps>) {
  return (
    <ImageCropper.Root
      src='photo.png'
      {...props}
    >
      <ImageCropper.Viewport aria-label='Crop'>
        <ImageCropper.Image alt='' />
      </ImageCropper.Viewport>
      <ImageCropper.Zoom aria-label='Zoom' />
      <ImageCropper.ZoomOut aria-label='Zoom out' />
      <ImageCropper.ZoomIn aria-label='Zoom in' />
      <ImageCropper.Rotate>Rotate</ImageCropper.Rotate>
      <ImageCropper.Reset>Reset</ImageCropper.Reset>
    </ImageCropper.Root>
  );
}

function load(width: number, height: number) {
  const image = document.querySelector('img');
  if (!image) {
    throw new Error('no image');
  }
  Object.defineProperty(image, 'naturalWidth', { value: width });
  Object.defineProperty(image, 'naturalHeight', { value: height });
  fireEvent.load(image);
  return image;
}

function lastCrop(onValueChange: ReturnType<typeof vi.fn<(crop: Crop) => void>>): Crop | undefined {
  return onValueChange.mock.lastCall?.[0];
}

describe('ImageCropper', () => {
  it('keeps the controls disabled until the image has loaded', () => {
    render(<Harness />);

    expect(screen.getByRole('slider', { name: 'Zoom' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rotate' })).toBeDisabled();

    load(200, 100);

    expect(screen.getByRole('slider', { name: 'Zoom' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Rotate' })).toBeEnabled();
  });

  it('takes the size of an image that finished loading before it mounted', () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(100);

    render(<Harness />);

    expect(screen.getByRole('slider', { name: 'Zoom' })).toBeEnabled();
    expect(document.querySelector('img')?.style.width).toBe('200%');
  });

  it('sizes the image to cover the frame', () => {
    render(<Harness />);
    const image = load(200, 100);

    expect(image.style.width).toBe('200%');
    expect(image.style.height).toBe('100%');
    expect(image.style.left).toBe('50%');
  });

  it('zooms from the slider', () => {
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(<Harness onValueChange={onValueChange} />);
    load(100, 100);

    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), { target: { value: '2' } });

    expect(lastCrop(onValueChange)?.zoom).toBe(2);
  });

  it('steps the zoom from the zoom in and out buttons, and stops at each end', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(
      <Harness
        maxZoom={2}
        onValueChange={onValueChange}
      />,
    );
    load(100, 100);
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' });
    const zoomOut = screen.getByRole('button', { name: 'Zoom out' });
    expect(zoomOut).toBeDisabled();

    await user.click(zoomIn);
    expect(lastCrop(onValueChange)?.zoom).toBeGreaterThan(1);
    expect(zoomOut).toBeEnabled();

    await user.click(zoomIn);
    await user.click(zoomIn);
    await user.click(zoomIn);
    expect(lastCrop(onValueChange)?.zoom).toBe(2);
    expect(zoomIn).toBeDisabled();

    await user.click(zoomOut);
    expect(lastCrop(onValueChange)?.zoom).toBeLessThan(2);
  });

  it('turns the image a quarter clockwise', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(<Harness onValueChange={onValueChange} />);
    load(100, 100);

    await user.click(screen.getByRole('button', { name: 'Rotate' }));

    expect(lastCrop(onValueChange)?.rotation).toBe(90);
  });

  it('resets the crop', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(
      <Harness
        defaultValue={{ x: 0.2, y: 0, zoom: 2, rotation: 180 }}
        onValueChange={onValueChange}
      />,
    );
    load(100, 100);

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(lastCrop(onValueChange)).toEqual({ x: 0, y: 0, zoom: 1, rotation: 0 });
  });

  it('pans and zooms from the keyboard', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(<Harness onValueChange={onValueChange} />);
    load(200, 100);

    screen.getByRole('application', { name: 'Crop' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(lastCrop(onValueChange)?.x).toBeGreaterThan(0);

    await user.keyboard('+');
    expect(lastCrop(onValueChange)?.zoom).toBeGreaterThan(1);

    await user.keyboard('-');
    expect(lastCrop(onValueChange)?.zoom).toBeCloseTo(1);

    await user.keyboard('0');
    expect(lastCrop(onValueChange)).toEqual({ x: 0, y: 0, zoom: 1, rotation: 0 });
  });

  it('pans by dragging, in fractions of the frame', () => {
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(
      <Harness
        defaultValue={{ x: 0, y: 0, zoom: 2, rotation: 0 }}
        onValueChange={onValueChange}
      />,
    );
    load(100, 100);
    const viewport = screen.getByRole('application', { name: 'Crop' });
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ width: 200, height: 200 }));

    fireEvent.pointerDown(viewport, { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 150, clientY: 80 });
    expect(viewport).toHaveAttribute('data-dragging');
    fireEvent.pointerUp(viewport, { pointerId: 1, clientX: 150, clientY: 80 });

    expect(lastCrop(onValueChange)).toEqual({ x: 0.25, y: -0.1, zoom: 2, rotation: 0 });
    expect(viewport).not.toHaveAttribute('data-dragging');
  });

  it('pans in fractions of the crop area when the frame is larger than it', () => {
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(
      <ImageCropper.Root
        src='photo.png'
        defaultValue={{ x: 0, y: 0, zoom: 2, rotation: 0 }}
        onValueChange={onValueChange}
      >
        <ImageCropper.Viewport aria-label='Crop'>
          <ImageCropper.Area data-testid='area'>
            <ImageCropper.Image alt='' />
          </ImageCropper.Area>
        </ImageCropper.Viewport>
      </ImageCropper.Root>,
    );
    load(100, 100);
    const viewport = screen.getByRole('application', { name: 'Crop' });
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ width: 200, height: 200 }));
    vi.spyOn(screen.getByTestId('area'), 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ width: 100, height: 100 }),
    );

    fireEvent.pointerDown(viewport, { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 120, clientY: 100 });

    expect(lastCrop(onValueChange)).toEqual({ x: 0.2, y: 0, zoom: 2, rotation: 0 });
  });

  it('ends a drag when the pointer is cancelled', () => {
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(
      <Harness
        defaultValue={{ x: 0, y: 0, zoom: 2, rotation: 0 }}
        onValueChange={onValueChange}
      />,
    );
    load(100, 100);
    const viewport = screen.getByRole('application', { name: 'Crop' });
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ width: 200, height: 200 }));

    fireEvent.pointerDown(viewport, { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerCancel(viewport, { pointerId: 1 });
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 150, clientY: 100 });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(viewport).not.toHaveAttribute('data-dragging');
  });

  it('zooms with a two-finger pinch', () => {
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(<Harness onValueChange={onValueChange} />);
    load(100, 100);
    const viewport = screen.getByRole('application', { name: 'Crop' });
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ width: 200, height: 200 }));

    fireEvent.pointerDown(viewport, { pointerId: 1, clientX: 50, clientY: 100, button: 0 });
    fireEvent.pointerDown(viewport, { pointerId: 2, clientX: 150, clientY: 100, button: 0 });
    fireEvent.pointerMove(viewport, { pointerId: 2, clientX: 250, clientY: 100 });

    expect(lastCrop(onValueChange)?.zoom).toBe(2);
  });

  it('keeps a pinch that starts with both fingers on one point from breaking the crop', () => {
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(<Harness onValueChange={onValueChange} />);
    load(100, 100);
    const viewport = screen.getByRole('application', { name: 'Crop' });
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ width: 200, height: 200 }));

    fireEvent.pointerDown(viewport, { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerDown(viewport, { pointerId: 2, clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(viewport, { pointerId: 2, clientX: 200, clientY: 100 });

    expect(lastCrop(onValueChange)?.zoom).toBe(1);
  });

  it('zooms the same amount whether the wheel reports pixels or lines', () => {
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(<Harness onValueChange={onValueChange} />);
    load(100, 100);
    const viewport = screen.getByRole('application', { name: 'Crop' });

    fireEvent.wheel(viewport, { deltaY: -48, deltaMode: WheelEvent.DOM_DELTA_PIXEL });
    const byPixels = lastCrop(onValueChange)?.zoom;
    fireEvent.keyDown(viewport, { key: '0' });
    fireEvent.wheel(viewport, { deltaY: -3, deltaMode: WheelEvent.DOM_DELTA_LINE });

    expect(lastCrop(onValueChange)?.zoom).toBeCloseTo(byPixels ?? Number.NaN);
  });

  it('leaves the wheel and touch to the page until the image has loaded', () => {
    render(<Harness />);
    const viewport = screen.getByRole('application', { name: 'Crop' });

    expect(fireEvent.wheel(viewport, { deltaY: -48 })).toBe(true);
    expect(viewport.style.touchAction).toBe('');

    load(100, 100);

    expect(fireEvent.wheel(viewport, { deltaY: -48 })).toBe(false);
    expect(viewport.style.touchAction).toBe('none');
  });

  it('leaves arrow keys to a slider placed inside the frame', () => {
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(
      <ImageCropper.Root
        src='photo.png'
        onValueChange={onValueChange}
      >
        <ImageCropper.Viewport aria-label='Crop'>
          <ImageCropper.Image alt='' />
          <ImageCropper.Zoom aria-label='Zoom' />
        </ImageCropper.Viewport>
      </ImageCropper.Root>,
    );
    load(100, 100);

    expect(fireEvent.keyDown(screen.getByRole('slider', { name: 'Zoom' }), { key: 'ArrowLeft' })).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('clamps a crop passed in, so the image still covers the frame', () => {
    render(<Harness value={{ x: 0.5, y: 0, zoom: 1, rotation: 0 }} />);
    const image = load(100, 100);

    expect(image.style.left).toBe('50%');
  });

  it('ignores every gesture while disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(crop: Crop) => void>();
    render(
      <Harness
        disabled
        onValueChange={onValueChange}
      />,
    );
    load(100, 100);

    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
    screen.getByRole('application', { name: 'Crop' }).focus();
    await user.keyboard('+');

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Harness />);
    load(100, 100);

    expect(await axe(container)).toHaveNoViolations();
  });
});
