import { render } from '@testing-library/react';

import { ExternalElementMounter } from '../ExternalElementMounter';

describe('ExternalElementMounter', () => {
  it('should mount the element when component mounts', () => {
    const mockMount = jest.fn();
    const mockUnmount = jest.fn();

    render(
      <ExternalElementMounter
        mount={mockMount}
        unmount={mockUnmount}
      />,
    );

    expect(mockMount).toHaveBeenCalledTimes(1);
    expect(mockMount).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    expect(mockUnmount).not.toHaveBeenCalled();
  });

  it('should unmount the element when component unmounts', () => {
    const mockMount = jest.fn();
    const mockUnmount = jest.fn();

    const { unmount } = render(
      <ExternalElementMounter
        mount={mockMount}
        unmount={mockUnmount}
      />,
    );

    expect(mockMount).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockUnmount).toHaveBeenCalledTimes(1);
    expect(mockUnmount).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('should not re-mount when mount/unmount functions change', () => {
    const mockMount1 = jest.fn();
    const mockUnmount1 = jest.fn();
    const mockMount2 = jest.fn();
    const mockUnmount2 = jest.fn();

    const { rerender } = render(
      <ExternalElementMounter
        mount={mockMount1}
        unmount={mockUnmount1}
      />,
    );

    expect(mockMount1).toHaveBeenCalledTimes(1);
    expect(mockUnmount1).not.toHaveBeenCalled();

    rerender(
      <ExternalElementMounter
        mount={mockMount2}
        unmount={mockUnmount2}
      />,
    );

    expect(mockMount1).toHaveBeenCalledTimes(1);
    expect(mockMount2).not.toHaveBeenCalled();
    expect(mockUnmount1).not.toHaveBeenCalled();
    expect(mockUnmount2).not.toHaveBeenCalled();
  });

  it('should use the latest unmount function when component unmounts', () => {
    const mockMount1 = jest.fn();
    const mockUnmount1 = jest.fn();
    const mockMount2 = jest.fn();
    const mockUnmount2 = jest.fn();

    const { rerender, unmount } = render(
      <ExternalElementMounter
        mount={mockMount1}
        unmount={mockUnmount1}
      />,
    );

    rerender(
      <ExternalElementMounter
        mount={mockMount2}
        unmount={mockUnmount2}
      />,
    );

    unmount();

    expect(mockUnmount1).not.toHaveBeenCalled();
    expect(mockUnmount2).toHaveBeenCalledTimes(1);
  });

  it('should pass through additional props to the div element', () => {
    const mockMount = jest.fn();
    const mockUnmount = jest.fn();

    const { container } = render(
      <ExternalElementMounter
        mount={mockMount}
        unmount={mockUnmount}
        data-testid='test-id'
      />,
    );

    const div = container.firstChild as HTMLDivElement;
    expect(div.getAttribute('data-testid')).toBe('test-id');
  });
});
