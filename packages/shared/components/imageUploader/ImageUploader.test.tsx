import { renderJSON } from '@clerk/shared/testUtils';
import React from 'react';

import { ImageUploader } from './ImageUploader';

describe('ImageUploader', () => {
  it('renders correctly', () => {
    const mockHandleSuccess = jest.fn();
    const imageUploader = renderJSON(
      <ImageUploader
        title='Test'
        subtitle='test'
        handleSuccess={mockHandleSuccess}
      >
        Hello World
      </ImageUploader>,
    );
    expect(imageUploader).toMatchSnapshot();
  });

  it('renders correctly with mobile upload indicator', () => {
    const mockHandleSuccess = jest.fn();
    const imageUploader = renderJSON(
      <ImageUploader
        title='Test'
        subtitle='test'
        handleSuccess={mockHandleSuccess}
        withResponsiveUploadIndicator={true}
      >
        Hello World
      </ImageUploader>,
    );
    expect(imageUploader).toMatchSnapshot();
  });
});
