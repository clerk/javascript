import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { UserAvatar } from '@/ui/elements/UserAvatar';

import { AvatarUploader } from '../AvatarUploader';
import { withCardStateProvider } from '../contexts';

const { createFixtures } = bindCreateFixtures('UserProfile');

// Mock file for testing
const createMockFile = (name: string, type: string, size: number = 1000): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('AvatarUploader', () => {
  it('renders the component with avatar preview', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { getByRole, getByText } = render(<TestComponent />, { wrapper });

    expect(getByRole('button', { name: /upload/i })).toBeInTheDocument();
    expect(getByText('JD')).toBeInTheDocument(); // UserAvatar shows initials
  });

  it('calls onAvatarChange when valid file is selected', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { container } = render(<TestComponent />, { wrapper });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = createMockFile('test.png', 'image/png', 1000);

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(onAvatarChange).toHaveBeenCalledWith(validFile);
  });

  it('does not call onAvatarChange for invalid file type', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { container } = render(<TestComponent />, { wrapper });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = createMockFile('test.txt', 'text/plain', 1000);

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(onAvatarChange).not.toHaveBeenCalled();
  });

  it('does not call onAvatarChange for file that is too large', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { container } = render(<TestComponent />, { wrapper });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = createMockFile('test.png', 'image/png', 11 * 1000 * 1000); // 11MB

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(onAvatarChange).not.toHaveBeenCalled();
  });

  it('calls onAvatarRemove when remove button is clicked', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { getByRole } = render(<TestComponent />, { wrapper });

    const removeButton = getByRole('button', { name: /remove/i });
    await userEvent.click(removeButton);

    expect(onAvatarRemove).toHaveBeenCalled();
  });

  it('does not show remove button when onAvatarRemove is null', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={null}
      />
    ));

    const { queryByRole } = render(<TestComponent />, { wrapper });

    expect(queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('shows upload button and file drop hint', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { getByRole, getByText } = render(<TestComponent />, { wrapper });

    expect(getByRole('button', { name: /upload/i })).toBeInTheDocument();
    expect(getByText(/Recommended size 1:1, up to 10MB/i)).toBeInTheDocument();
  });

  it('accepts correct file types in file input', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { container } = render(<TestComponent />, { wrapper });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toBe('image/png,image/jpeg,image/gif,image/webp');
  });

  it('handles multiple file selection by using only the first file', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { container } = render(<TestComponent />, { wrapper });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = createMockFile('test1.png', 'image/png', 1000);
    const file2 = createMockFile('test2.png', 'image/png', 1000);

    fireEvent.change(fileInput, { target: { files: [file1, file2] } });

    expect(onAvatarChange).toHaveBeenCalledTimes(1);
    expect(onAvatarChange).toHaveBeenCalledWith(file1);
  });

  it('handles empty file selection gracefully', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { container } = render(<TestComponent />, { wrapper });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [] } });

    expect(onAvatarChange).not.toHaveBeenCalled();
  });

  it('handles undefined files gracefully', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { container } = render(<TestComponent />, { wrapper });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: undefined } });

    expect(onAvatarChange).not.toHaveBeenCalled();
  });

  it('renders with previewImageUrl when provided', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();
    const previewImageUrl = 'blob:mock-preview-url';

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
        previewImageUrl={previewImageUrl}
      />
    ));

    const { getByRole } = render(<TestComponent />, { wrapper });

    expect(getByRole('button', { name: /upload/i })).toBeInTheDocument();
    // The UserAvatar should receive the previewImageUrl as imageUrl prop
  });

  it('allows re-uploading the same file by clearing input value on click', async () => {
    const { wrapper } = await createFixtures();
    const mockUser = { id: 'user_123', firstName: 'John', lastName: 'Doe' };
    const onAvatarChange = vi.fn();
    const onAvatarRemove = vi.fn();

    const TestComponent = withCardStateProvider(() => (
      <AvatarUploader
        title='Upload Avatar'
        avatarPreview={<UserAvatar {...mockUser} />}
        onAvatarChange={onAvatarChange}
        onAvatarRemove={onAvatarRemove}
      />
    ));

    const { container } = render(<TestComponent />, { wrapper });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = createMockFile('test.png', 'image/png');

    // First upload
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    expect(onAvatarChange).toHaveBeenCalledTimes(1);

    // Click to clear value
    fireEvent.click(fileInput);

    // Upload the same file again
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    expect(onAvatarChange).toHaveBeenCalledTimes(2);
  });
});
