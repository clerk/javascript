import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';

import { useDeferredImageUpload } from '../useDeferredImageUpload';

const { createFixtures } = bindCreateFixtures('UserProfile');

describe('useDeferredImageUpload', () => {
  const mockResource = {
    imageUrl: 'https://example.com/image.jpg',
    id: '123',
    name: 'Test User',
  };

  describe('Initial state', () => {
    it('should initialize with no pending changes', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      expect(result.current.pendingFile).toBe(null);
      expect(result.current.imageRemoved).toBe(false);
      expect(result.current.imageChanged).toBe(false);
    });

    it('should return the original resource for preview', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      expect(result.current.resourceForPreview).toEqual(mockResource);
    });
  });

  describe('handleImageChange', () => {
    it('should set pending file when a new file is selected', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });

      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      expect(result.current.pendingFile).toBe(mockFile);
      expect(result.current.imageRemoved).toBe(false);
      expect(result.current.imageChanged).toBe(true);
    });

    it('should clear imageRemoved flag when a new file is selected', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      // First remove the image
      act(() => {
        result.current.handleImageRemove();
      });

      expect(result.current.imageRemoved).toBe(true);

      // Then select a new file
      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      expect(result.current.imageRemoved).toBe(false);
      expect(result.current.pendingFile).toBe(mockFile);
    });
  });

  describe('handleImageRemove', () => {
    it('should set imageRemoved flag', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      act(() => {
        result.current.handleImageRemove();
      });

      expect(result.current.imageRemoved).toBe(true);
      expect(result.current.pendingFile).toBe(null);
      expect(result.current.imageChanged).toBe(true);
    });

    it('should clear pending file when remove is called', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      // First set a pending file
      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      expect(result.current.pendingFile).toBe(mockFile);

      // Then remove
      act(() => {
        result.current.handleImageRemove();
      });

      expect(result.current.pendingFile).toBe(null);
      expect(result.current.imageRemoved).toBe(true);
    });

    it('should update resourceForPreview to show empty imageUrl', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      act(() => {
        result.current.handleImageRemove();
      });

      expect(result.current.resourceForPreview.imageUrl).toBeNull();
      expect(result.current.resourceForPreview.id).toBe(mockResource.id);
      expect(result.current.resourceForPreview.name).toBe(mockResource.name);
    });
  });

  describe('handleReset', () => {
    it('should clear all pending changes', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      // Set a pending file
      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      expect(result.current.imageChanged).toBe(true);

      // Reset
      act(() => {
        result.current.handleReset();
      });

      expect(result.current.pendingFile).toBe(null);
      expect(result.current.imageRemoved).toBe(false);
      expect(result.current.imageChanged).toBe(false);
    });

    it('should call onReset callback when provided', async () => {
      const { wrapper } = await createFixtures();
      const onReset = vi.fn();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource, onReset }), {
        wrapper,
      });

      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      act(() => {
        result.current.handleReset();
      });

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('should restore resourceForPreview to original after reset', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      // Remove image
      act(() => {
        result.current.handleImageRemove();
      });

      expect(result.current.resourceForPreview.imageUrl).toBeNull();

      // Reset
      act(() => {
        result.current.handleReset();
      });

      expect(result.current.resourceForPreview).toEqual(mockResource);
    });
  });

  describe('saveImage', () => {
    it('should call upload function with pending file when file is selected', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockUploadFn = vi.fn().mockResolvedValue(undefined);

      // Set pending file
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      // Save
      await act(async () => {
        await result.current.saveImage(mockUploadFn);
      });

      expect(mockUploadFn).toHaveBeenCalledWith(mockFile);
      expect(mockUploadFn).toHaveBeenCalledTimes(1);
    });

    it('should call upload function with null when image is removed', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockUploadFn = vi.fn().mockResolvedValue(undefined);

      // Remove image
      act(() => {
        result.current.handleImageRemove();
      });

      // Save
      await act(async () => {
        await result.current.saveImage(mockUploadFn);
      });

      expect(mockUploadFn).toHaveBeenCalledWith(null);
      expect(mockUploadFn).toHaveBeenCalledTimes(1);
    });

    it('should not call upload function when no changes are pending', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockUploadFn = vi.fn().mockResolvedValue(undefined);

      // Save without any changes
      await act(async () => {
        await result.current.saveImage(mockUploadFn);
      });

      expect(mockUploadFn).not.toHaveBeenCalled();
    });

    it('should reset pending state after successful save', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockUploadFn = vi.fn().mockResolvedValue(undefined);

      // Set pending file
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      expect(result.current.imageChanged).toBe(true);

      // Save
      await act(async () => {
        await result.current.saveImage(mockUploadFn);
      });

      expect(result.current.pendingFile).toBe(null);
      expect(result.current.imageRemoved).toBe(false);
      expect(result.current.imageChanged).toBe(false);
    });

    it('should reset pending state even when upload function fails', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockUploadFn = vi.fn().mockRejectedValue(new Error('Upload failed'));

      // Set pending file
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      // Save (will throw error)
      await expect(
        act(async () => {
          await result.current.saveImage(mockUploadFn);
        }),
      ).rejects.toThrow('Upload failed');

      // State should still be reset
      expect(result.current.pendingFile).toBe(null);
      expect(result.current.imageRemoved).toBe(false);
    });
  });

  describe('imageChanged', () => {
    it('should be false initially', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      expect(result.current.imageChanged).toBe(false);
    });

    it('should be true when pending file exists', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      expect(result.current.imageChanged).toBe(true);
    });

    it('should be true when image is removed', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      act(() => {
        result.current.handleImageRemove();
      });

      expect(result.current.imageChanged).toBe(true);
    });

    it('should be false after reset', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      expect(result.current.imageChanged).toBe(true);

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.imageChanged).toBe(false);
    });
  });

  describe('resourceForPreview', () => {
    it('should memoize and return same reference when nothing changes', async () => {
      const { wrapper } = await createFixtures();
      const { result, rerender } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const firstPreview = result.current.resourceForPreview;
      rerender();
      const secondPreview = result.current.resourceForPreview;

      expect(firstPreview).toBe(secondPreview);
    });

    it('should update when resource changes', async () => {
      const { wrapper } = await createFixtures();
      const { result, rerender } = renderHook(({ resource }) => useDeferredImageUpload({ resource }), {
        initialProps: { resource: mockResource },
        wrapper,
      });

      const firstPreview = result.current.resourceForPreview;

      const updatedResource = { ...mockResource, imageUrl: 'https://example.com/new-image.jpg' };
      rerender({ resource: updatedResource });

      const secondPreview = result.current.resourceForPreview;

      expect(firstPreview).not.toBe(secondPreview);
      expect(secondPreview.imageUrl).toBe('https://example.com/new-image.jpg');
    });

    it('should show empty imageUrl when imageRemoved is true', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      expect(result.current.resourceForPreview.imageUrl).toBe(mockResource.imageUrl);

      act(() => {
        result.current.handleImageRemove();
      });

      expect(result.current.resourceForPreview.imageUrl).toBeNull();
    });

    it('should preserve other resource properties when showing empty imageUrl', async () => {
      const { wrapper } = await createFixtures();
      const resourceWithMultipleProps = {
        imageUrl: 'https://example.com/image.jpg',
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const { result } = renderHook(() => useDeferredImageUpload({ resource: resourceWithMultipleProps }), {
        wrapper,
      });

      act(() => {
        result.current.handleImageRemove();
      });

      expect(result.current.resourceForPreview).toEqual({
        ...resourceWithMultipleProps,
        imageUrl: null,
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete upload workflow: select, save, reset', async () => {
      const { wrapper } = await createFixtures();
      const onReset = vi.fn();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource, onReset }), {
        wrapper,
      });

      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockUploadFn = vi.fn().mockResolvedValue(undefined);

      // 1. Select file
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      expect(result.current.imageChanged).toBe(true);
      expect(result.current.pendingFile).toBe(mockFile);

      // 2. Save
      await act(async () => {
        await result.current.saveImage(mockUploadFn);
      });

      expect(mockUploadFn).toHaveBeenCalledWith(mockFile);
      expect(result.current.imageChanged).toBe(false);

      // 3. Reset (even though already saved)
      act(() => {
        result.current.handleReset();
      });

      expect(onReset).toHaveBeenCalled();
    });

    it('should handle complete removal workflow: remove, save, cancel', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockUploadFn = vi.fn().mockResolvedValue(undefined);

      // 1. Remove image
      act(() => {
        result.current.handleImageRemove();
      });

      expect(result.current.imageChanged).toBe(true);
      expect(result.current.resourceForPreview.imageUrl).toBeNull();

      // 2. Save removal
      await act(async () => {
        await result.current.saveImage(mockUploadFn);
      });

      expect(mockUploadFn).toHaveBeenCalledWith(null);
      expect(result.current.imageChanged).toBe(false);
    });

    it('should handle cancel after selecting file', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });

      // 1. Select file
      await act(async () => {
        await result.current.handleImageChange(mockFile);
      });

      expect(result.current.imageChanged).toBe(true);

      // 2. Cancel
      act(() => {
        result.current.handleReset();
      });

      expect(result.current.imageChanged).toBe(false);
      expect(result.current.pendingFile).toBe(null);
      expect(result.current.resourceForPreview).toEqual(mockResource);
    });

    it('should handle changing file selection multiple times', async () => {
      const { wrapper } = await createFixtures();
      const { result } = renderHook(() => useDeferredImageUpload({ resource: mockResource }), {
        wrapper,
      });

      const mockFile1 = new File(['content1'], 'avatar1.jpg', { type: 'image/jpeg' });
      const mockFile2 = new File(['content2'], 'avatar2.jpg', { type: 'image/jpeg' });
      const mockFile3 = new File(['content3'], 'avatar3.jpg', { type: 'image/jpeg' });

      // Select first file
      await act(async () => {
        await result.current.handleImageChange(mockFile1);
      });
      expect(result.current.pendingFile).toBe(mockFile1);

      // Change to second file
      await act(async () => {
        await result.current.handleImageChange(mockFile2);
      });
      expect(result.current.pendingFile).toBe(mockFile2);

      // Change to third file
      await act(async () => {
        await result.current.handleImageChange(mockFile3);
      });
      expect(result.current.pendingFile).toBe(mockFile3);

      // Only the last file should be saved
      const mockUploadFn = vi.fn().mockResolvedValue(undefined);
      await act(async () => {
        await result.current.saveImage(mockUploadFn);
      });

      expect(mockUploadFn).toHaveBeenCalledWith(mockFile3);
      expect(mockUploadFn).toHaveBeenCalledTimes(1);
    });
  });
});
