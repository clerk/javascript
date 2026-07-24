import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import { FileUpload } from './index';

afterEach(() => cleanup());

function makeFile(name: string, type: string) {
  return new File(['content'], name, { type });
}

/** A default composition exercising every part, driven by the live file list. */
function Harness(props: Partial<React.ComponentProps<typeof FileUpload.Root>> = {}) {
  return (
    <FileUpload.Root
      {...props}
      data-testid='file-upload-root'
    >
      <FileUpload.Dropzone data-testid='file-upload-dropzone'>
        <FileUpload.Trigger data-testid='file-upload-trigger'>Choose files</FileUpload.Trigger>
        Drag files here
      </FileUpload.Dropzone>
      <Previews />
    </FileUpload.Root>
  );
}

function Previews() {
  const { files } = FileUpload.useFileUpload();
  return (
    <ul>
      {files.map(file => (
        <li key={file.name}>
          <FileUpload.Item file={file}>
            <FileUpload.ItemPreview data-testid='file-upload-item-preview' />
            <span>{file.name}</span>
            <FileUpload.ItemDelete>Remove {file.name}</FileUpload.ItemDelete>
          </FileUpload.Item>
        </li>
      ))}
    </ul>
  );
}

describe('FileUpload', () => {
  describe('trigger', () => {
    it('opens the native picker by clicking the hidden input', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');

      await user.click(screen.getByRole('button', { name: 'Choose files' }));

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('adds files chosen through the input', () => {
      const onValueChange = vi.fn();
      render(<Harness onValueChange={onValueChange} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [makeFile('photo.png', 'image/png')] } });

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls[0][0]).toHaveLength(1);
      expect(screen.getByText('photo.png')).toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('toggles data-dragging across enter/leave', () => {
      render(<Harness />);
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;

      fireEvent.dragEnter(dropzone, { dataTransfer: { files: [] } });
      expect(dropzone).toHaveAttribute('data-dragging', '');

      fireEvent.dragLeave(dropzone, { dataTransfer: { files: [] } });
      expect(dropzone).not.toHaveAttribute('data-dragging');
    });

    it('adds dropped files and clears the dragging state', () => {
      render(<Harness multiple />);
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;

      fireEvent.dragEnter(dropzone, { dataTransfer: { files: [makeFile('a.png', 'image/png')] } });
      fireEvent.drop(dropzone, { dataTransfer: { files: [makeFile('a.png', 'image/png')] } });

      expect(screen.getByText('a.png')).toBeInTheDocument();
      expect(dropzone).not.toHaveAttribute('data-dragging');
    });

    it('filters dropped files by accept', () => {
      const onValueChange = vi.fn();
      render(
        <Harness
          accept='image/*'
          multiple
          onValueChange={onValueChange}
        />,
      );
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;

      fireEvent.drop(dropzone, {
        dataTransfer: { files: [makeFile('a.png', 'image/png'), makeFile('doc.pdf', 'application/pdf')] },
      });

      expect(onValueChange).toHaveBeenCalledTimes(1);
      const accepted: File[] = onValueChange.mock.calls[0][0];
      expect(accepted.map(f => f.name)).toEqual(['a.png']);
    });
  });

  describe('validation (onReject / maxSize)', () => {
    function makeSizedFile(name: string, type: string, bytes: number) {
      return new File([new Uint8Array(bytes)], name, { type });
    }

    it('reports accept mismatches to onReject with reason "accept"', () => {
      const onReject = vi.fn();
      render(
        <Harness
          accept='image/*'
          multiple
          onReject={onReject}
        />,
      );
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;

      fireEvent.drop(dropzone, {
        dataTransfer: { files: [makeFile('a.png', 'image/png'), makeFile('doc.pdf', 'application/pdf')] },
      });

      expect(onReject).toHaveBeenCalledTimes(1);
      const rejections = onReject.mock.calls[0][0];
      expect(rejections).toEqual([{ file: expect.objectContaining({ name: 'doc.pdf' }), reason: 'accept' }]);
    });

    it('rejects files larger than maxSize with reason "size" and keeps the rest', () => {
      const onReject = vi.fn();
      const onValueChange = vi.fn();
      render(
        <Harness
          multiple
          maxSize={100}
          onReject={onReject}
          onValueChange={onValueChange}
        />,
      );
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;
      const small = makeSizedFile('small.png', 'image/png', 50);
      const big = makeSizedFile('big.png', 'image/png', 500);

      fireEvent.drop(dropzone, { dataTransfer: { files: [small, big] } });

      expect(onReject).toHaveBeenCalledTimes(1);
      expect(onReject.mock.calls[0][0]).toEqual([{ file: big, reason: 'size' }]);
      // The under-limit file is still accepted.
      expect(onValueChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(['small.png']);
      expect(screen.getByText('small.png')).toBeInTheDocument();
      expect(screen.queryByText('big.png')).not.toBeInTheDocument();
    });

    it('does not call onReject when every file is valid', () => {
      const onReject = vi.fn();
      render(
        <Harness
          accept='image/*'
          maxSize={1000}
          onReject={onReject}
        />,
      );
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;

      fireEvent.drop(dropzone, { dataTransfer: { files: [makeSizedFile('ok.png', 'image/png', 100)] } });

      expect(onReject).not.toHaveBeenCalled();
    });

    it('reports extra files as "overflow" in single mode and keeps the first', () => {
      const onReject = vi.fn();
      const onValueChange = vi.fn();
      // No `multiple` → single mode.
      render(
        <Harness
          onReject={onReject}
          onValueChange={onValueChange}
        />,
      );
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;
      const first = makeFile('first.png', 'image/png');
      const second = makeFile('second.png', 'image/png');

      fireEvent.drop(dropzone, { dataTransfer: { files: [first, second] } });

      expect(onValueChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(['first.png']);
      expect(onReject).toHaveBeenCalledTimes(1);
      expect(onReject.mock.calls[0][0]).toEqual([{ file: second, reason: 'overflow' }]);
    });

    it('checks accept before size (type mismatch wins)', () => {
      const onReject = vi.fn();
      render(
        <Harness
          accept='image/*'
          maxSize={100}
          onReject={onReject}
        />,
      );
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;
      // A PDF that is also oversized should be rejected for the type, not the size.
      fireEvent.drop(dropzone, { dataTransfer: { files: [makeSizedFile('big.pdf', 'application/pdf', 500)] } });

      expect(onReject.mock.calls[0][0]).toEqual([
        { file: expect.objectContaining({ name: 'big.pdf' }), reason: 'accept' },
      ]);
    });
  });

  describe('single vs multiple', () => {
    it('replaces the file in single mode', () => {
      render(<Harness defaultValue={[makeFile('first.png', 'image/png')]} />);
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;

      fireEvent.drop(dropzone, { dataTransfer: { files: [makeFile('second.png', 'image/png')] } });

      expect(screen.queryByText('first.png')).not.toBeInTheDocument();
      expect(screen.getByText('second.png')).toBeInTheDocument();
    });

    it('appends files in multiple mode', () => {
      render(
        <Harness
          multiple
          defaultValue={[makeFile('first.png', 'image/png')]}
        />,
      );
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;

      fireEvent.drop(dropzone, { dataTransfer: { files: [makeFile('second.png', 'image/png')] } });

      expect(screen.getByText('first.png')).toBeInTheDocument();
      expect(screen.getByText('second.png')).toBeInTheDocument();
    });
  });

  describe('items', () => {
    it('renders an <img> preview for image files', () => {
      render(<Harness defaultValue={[makeFile('a.png', 'image/png')]} />);
      const img = document.querySelector('[data-testid="file-upload-item-preview"]');
      expect(img?.tagName).toBe('IMG');
      expect(img).toHaveAttribute('alt', 'a.png');
      expect(img?.getAttribute('src')).toBeTruthy();
    });

    it('renders no preview for non-image files', () => {
      render(<Harness defaultValue={[makeFile('doc.pdf', 'application/pdf')]} />);
      expect(document.querySelector('[data-testid="file-upload-item-preview"]')).not.toBeInTheDocument();
    });

    it('removes a file via ItemDelete', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          multiple
          defaultValue={[makeFile('a.png', 'image/png'), makeFile('b.png', 'image/png')]}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Remove a.png' }));

      expect(screen.queryByText('a.png')).not.toBeInTheDocument();
      expect(screen.getByText('b.png')).toBeInTheDocument();
    });
  });

  describe('controlled value', () => {
    it('renders the controlled files and does not mutate them internally', () => {
      const onValueChange = vi.fn();
      render(
        <Harness
          value={[makeFile('locked.png', 'image/png')]}
          onValueChange={onValueChange}
        />,
      );
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;

      expect(screen.getByText('locked.png')).toBeInTheDocument();

      fireEvent.drop(dropzone, { dataTransfer: { files: [makeFile('new.png', 'image/png')] } });

      // Controlled: the callback fires but the rendered list stays as provided.
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('new.png')).not.toBeInTheDocument();
      expect(screen.getByText('locked.png')).toBeInTheDocument();
    });
  });

  describe('disabled', () => {
    it('disables trigger and hidden input', () => {
      render(<Harness disabled />);
      expect(screen.getByRole('button', { name: 'Choose files' })).toBeDisabled();
      expect(document.querySelector('input[type="file"]')).toBeDisabled();
    });

    it('ignores drops when disabled', () => {
      const onValueChange = vi.fn();
      render(
        <Harness
          disabled
          onValueChange={onValueChange}
        />,
      );
      const dropzone = document.querySelector('[data-testid="file-upload-dropzone"]') as HTMLElement;

      fireEvent.dragEnter(dropzone, { dataTransfer: { files: [makeFile('a.png', 'image/png')] } });
      fireEvent.drop(dropzone, { dataTransfer: { files: [makeFile('a.png', 'image/png')] } });

      expect(onValueChange).not.toHaveBeenCalled();
      expect(dropzone).not.toHaveAttribute('data-dragging');
    });

    it('applies data-disabled on root, dropzone, and trigger', () => {
      render(<Harness disabled />);
      expect(document.querySelector('[data-testid="file-upload-root"]')).toHaveAttribute('data-disabled', '');
      expect(document.querySelector('[data-testid="file-upload-dropzone"]')).toHaveAttribute('data-disabled', '');
      expect(document.querySelector('[data-testid="file-upload-trigger"]')).toHaveAttribute('data-disabled', '');
    });
  });

  describe('render prop', () => {
    it('lets the trigger customize its element via render', () => {
      render(
        <FileUpload.Root>
          <FileUpload.Trigger
            render={props => (
              // eslint-disable-next-line react/button-has-type -- `type` comes from the spread props; the Trigger sets type="button".
              <button
                {...props}
                data-custom='yes'
              />
            )}
          >
            Upload
          </FileUpload.Trigger>
        </FileUpload.Root>,
      );
      const trigger = screen.getByRole('button', { name: 'Upload' });
      expect(trigger).toHaveAttribute('data-custom', 'yes');
      expect(trigger).toHaveAttribute('type', 'button');
    });
  });

  describe('context guards', () => {
    it('throws when a part is used outside Root', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<FileUpload.Trigger>x</FileUpload.Trigger>)).toThrow(/must be used within <FileUpload.Root>/);
      spy.mockRestore();
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when empty', async () => {
      const { container } = render(<Harness />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations with an image preview', async () => {
      const { container } = render(<Harness defaultValue={[makeFile('a.png', 'image/png')]} />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
