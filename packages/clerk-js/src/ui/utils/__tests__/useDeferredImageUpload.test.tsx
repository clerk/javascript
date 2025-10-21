import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeferredImageUpload } from '../useDeferredImageUpload';

// Mock URL.createObjectURL and URL.revokeObjectURL for JSDOM
beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();
});

// Mock file for testing
const createMockFile = (name: string, type: string, size: number = 1000): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('useDeferredImageUpload', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useDeferredImageUpload());

    expect(result.current.pendingImageFile).toBeNull();
    expect(result.current.imageRemoved).toBe(false);
    expect(result.current.previewUrl).toBeNull();
    expect(result.current.hasImageChanges).toBe(false);
  });

  it('handles image change correctly', () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const mockFile = createMockFile('test.png', 'image/png');

    act(() => {
      result.current.handleImageChange(mockFile);
    });

    expect(result.current.pendingImageFile).toBe(mockFile);
    expect(result.current.imageRemoved).toBe(false);
    expect(result.current.previewUrl).toBeTruthy();
    expect(result.current.hasImageChanges).toBe(true);
  });

  it('handles image remove correctly', () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const mockFile = createMockFile('test.png', 'image/png');

    // First set a pending file
    act(() => {
      result.current.handleImageChange(mockFile);
    });

    // Then remove it
    act(() => {
      result.current.handleImageRemove();
    });

    expect(result.current.pendingImageFile).toBeNull();
    expect(result.current.imageRemoved).toBe(true);
    expect(result.current.previewUrl).toBeNull();
    expect(result.current.hasImageChanges).toBe(false);
  });

  it('handles reset correctly', () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const mockFile = createMockFile('test.png', 'image/png');

    // Set up some state
    act(() => {
      result.current.handleImageChange(mockFile);
    });

    act(() => {
      result.current.handleImageRemove();
    });

    // Reset everything
    act(() => {
      result.current.handleReset();
    });

    expect(result.current.pendingImageFile).toBeNull();
    expect(result.current.imageRemoved).toBe(false);
    expect(result.current.previewUrl).toBeNull();
    expect(result.current.hasImageChanges).toBe(false);
  });

  it('uploads pending image file', async () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const mockFile = createMockFile('test.png', 'image/png');
    const uploadFn = vi.fn().mockResolvedValue(undefined);

    act(() => {
      result.current.handleImageChange(mockFile);
    });

    await act(async () => {
      await result.current.uploadImage(uploadFn);
    });

    expect(uploadFn).toHaveBeenCalledWith(mockFile);
  });

  it('uploads null when image is removed', async () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const uploadFn = vi.fn().mockResolvedValue(undefined);

    act(() => {
      result.current.handleImageRemove();
    });

    await act(async () => {
      await result.current.uploadImage(uploadFn);
    });

    expect(uploadFn).toHaveBeenCalledWith(null);
  });

  it('does not call upload function when no changes', async () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const uploadFn = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.uploadImage(uploadFn);
    });

    expect(uploadFn).not.toHaveBeenCalled();
  });

  it('generates and cleans up preview URL correctly', () => {
    const { result, unmount } = renderHook(() => useDeferredImageUpload());
    const mockFile = createMockFile('test.png', 'image/png');

    act(() => {
      result.current.handleImageChange(mockFile);
    });

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    expect(result.current.previewUrl).toBe('blob:mock-url');

    // Unmount to trigger cleanup
    unmount();

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('handles multiple file changes correctly', () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const mockFile1 = createMockFile('test1.png', 'image/png');
    const mockFile2 = createMockFile('test2.png', 'image/png');

    act(() => {
      result.current.handleImageChange(mockFile1);
    });

    expect(result.current.pendingImageFile).toBe(mockFile1);

    act(() => {
      result.current.handleImageChange(mockFile2);
    });

    expect(result.current.pendingImageFile).toBe(mockFile2);
    expect(result.current.imageRemoved).toBe(false);
  });

  it('handles remove after change correctly', () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const mockFile = createMockFile('test.png', 'image/png');

    act(() => {
      result.current.handleImageChange(mockFile);
    });

    act(() => {
      result.current.handleImageRemove();
    });

    expect(result.current.pendingImageFile).toBeNull();
    expect(result.current.imageRemoved).toBe(true);
    expect(result.current.hasImageChanges).toBe(false);
  });

  it('handles change after remove correctly', () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const mockFile = createMockFile('test.png', 'image/png');

    act(() => {
      result.current.handleImageRemove();
    });

    act(() => {
      result.current.handleImageChange(mockFile);
    });

    expect(result.current.pendingImageFile).toBe(mockFile);
    expect(result.current.imageRemoved).toBe(false);
    expect(result.current.hasImageChanges).toBe(true);
  });

  it('handles upload error gracefully', async () => {
    const { result } = renderHook(() => useDeferredImageUpload());
    const mockFile = createMockFile('test.png', 'image/png');
    const uploadFn = vi.fn().mockRejectedValue(new Error('Upload failed'));

    act(() => {
      result.current.handleImageChange(mockFile);
    });

    await expect(
      act(async () => {
        await result.current.uploadImage(uploadFn);
      }),
    ).rejects.toThrow('Upload failed');

    expect(uploadFn).toHaveBeenCalledWith(mockFile);
  });
});
