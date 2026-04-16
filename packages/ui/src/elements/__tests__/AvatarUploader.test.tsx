import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';

import { localizationKeys } from '../../customizables';
import { AvatarUploader, type AvatarUploaderProps } from '../AvatarUploader';
import { useCardState, withCardStateProvider } from '../contexts';

const { createFixtures } = bindCreateFixtures('UserProfile');

const StubPreview = (_props: { imageUrl?: string }) => <span data-testid='avatar-preview' />;

type HarnessProps = Omit<AvatarUploaderProps, 'title' | 'avatarPreview'>;

const Harness = withCardStateProvider((props: HarnessProps) => {
  const card = useCardState();
  return (
    <>
      <AvatarUploader
        {...props}
        title={localizationKeys('userProfile.profilePage.imageFormTitle')}
        avatarPreview={<StubPreview />}
      />
      {card.error ? <div data-testid='card-error'>{card.error}</div> : null}
    </>
  );
});

const makeImageFile = (size = 1024, type = 'image/png') => {
  const file = new File([new Uint8Array(size)], 'logo.png', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const makeDataTransfer = (files: File[] = [], types: string[] = ['Files']) =>
  ({
    files,
    types,
    items: files.map(f => ({ kind: 'file', type: f.type, getAsFile: () => f })),
    dropEffect: 'none',
    effectAllowed: 'all',
  }) as unknown as DataTransfer;

const findFileInput = (container: HTMLElement) => {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('Could not find hidden file input');
  return input;
};

const findDropZone = (container: HTMLElement) => {
  // The outer Flex registered with the drop handlers is the file input's next sibling.
  const sibling = findFileInput(container).nextElementSibling;
  if (!sibling) throw new Error('Could not find drop zone element');
  return sibling as HTMLElement;
};

describe('AvatarUploader', () => {
  describe('click-upload', () => {
    it('calls onAvatarChange with the selected file', async () => {
      const { wrapper } = await createFixtures();
      const onAvatarChange = vi.fn().mockResolvedValue(undefined);
      const file = makeImageFile();
      const { container } = render(<Harness onAvatarChange={onAvatarChange} />, { wrapper });

      fireEvent.change(findFileInput(container), { target: { files: [file] } });

      await waitFor(() => expect(onAvatarChange).toHaveBeenCalledWith(file));
    });
  });

  describe('drag-and-drop', () => {
    it('calls onAvatarChange when a valid image file is dropped', async () => {
      const { wrapper } = await createFixtures();
      const onAvatarChange = vi.fn().mockResolvedValue(undefined);
      const file = makeImageFile();
      const { container } = render(<Harness onAvatarChange={onAvatarChange} />, { wrapper });

      fireEvent.drop(findDropZone(container), { dataTransfer: makeDataTransfer([file]) });

      await waitFor(() => expect(onAvatarChange).toHaveBeenCalledWith(file));
    });

    it('rejects unsupported file types', async () => {
      const { wrapper } = await createFixtures();
      const onAvatarChange = vi.fn();
      const pdf = makeImageFile(1024, 'application/pdf');
      const { container, findByTestId } = render(<Harness onAvatarChange={onAvatarChange} />, { wrapper });

      fireEvent.drop(findDropZone(container), { dataTransfer: makeDataTransfer([pdf]) });

      const error = await findByTestId('card-error');
      expect(error).toHaveTextContent(/file type not supported/i);
      expect(onAvatarChange).not.toHaveBeenCalled();
    });

    it('rejects files exceeding the max size', async () => {
      const { wrapper } = await createFixtures();
      const onAvatarChange = vi.fn();
      const oversized = makeImageFile(11 * 1000 * 1000);
      const { container, findByTestId } = render(<Harness onAvatarChange={onAvatarChange} />, { wrapper });

      fireEvent.drop(findDropZone(container), { dataTransfer: makeDataTransfer([oversized]) });

      const error = await findByTestId('card-error');
      expect(error).toHaveTextContent(/file size exceeds/i);
      expect(onAvatarChange).not.toHaveBeenCalled();
    });

    it('ignores drops that do not contain files (e.g. text drags)', async () => {
      const { wrapper } = await createFixtures();
      const onAvatarChange = vi.fn();
      const { container } = render(<Harness onAvatarChange={onAvatarChange} />, { wrapper });

      fireEvent.drop(findDropZone(container), {
        dataTransfer: makeDataTransfer([], ['text/plain']),
      });

      expect(onAvatarChange).not.toHaveBeenCalled();
    });
  });

  describe('remove button', () => {
    it('is hidden when onAvatarRemove is not provided', async () => {
      const { wrapper } = await createFixtures();
      const { queryByRole } = render(<Harness onAvatarChange={vi.fn().mockResolvedValue(undefined)} />, { wrapper });

      expect(queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument();
    });

    it('stays visible after a successful upload', async () => {
      // Regression: previously `showUpload` was toggled inside handleFileDrop and the remove
      // button was gated on `!showUpload`, so it disappeared after each successful upload.
      const { wrapper } = await createFixtures();
      const onAvatarChange = vi.fn().mockResolvedValue(undefined);
      const onAvatarRemove = vi.fn();
      const { container, getByRole } = render(
        <Harness
          onAvatarChange={onAvatarChange}
          onAvatarRemove={onAvatarRemove}
        />,
        { wrapper },
      );

      expect(getByRole('button', { name: /^remove$/i })).toBeInTheDocument();

      fireEvent.change(findFileInput(container), { target: { files: [makeImageFile()] } });

      await waitFor(() => expect(onAvatarChange).toHaveBeenCalledTimes(1));
      await waitFor(() => {
        expect(getByRole('button', { name: /^remove$/i })).not.toBeDisabled();
      });
      expect(getByRole('button', { name: /^remove$/i })).toBeInTheDocument();
    });

    it('invokes onAvatarRemove when clicked', async () => {
      const user = userEvent.setup();
      const { wrapper } = await createFixtures();
      const onAvatarRemove = vi.fn();
      const { getByRole } = render(
        <Harness
          onAvatarChange={vi.fn().mockResolvedValue(undefined)}
          onAvatarRemove={onAvatarRemove}
        />,
        { wrapper },
      );

      await user.click(getByRole('button', { name: /^remove$/i }));

      await waitFor(() => expect(onAvatarRemove).toHaveBeenCalledTimes(1));
    });
  });
});
