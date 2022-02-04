import React from 'react';
import renderer from 'react-test-renderer';

import { FileDropArea } from './fileDropArea';

it('renders correctly if only jpeg is accepted', () => {
  const output = renderer.create(
    <FileDropArea
      acceptedTypes={['image/jpeg']}
      sizeLimitBytes={1}
      handleSuccess={jest.fn()}
    />,
  );
  expect(output).toMatchSnapshot();
});

it('renders correctly if multiple types are accepted', () => {
  const output = renderer.create(
    <FileDropArea
      acceptedTypes={['image/gif', 'image/png']}
      sizeLimitBytes={1}
      handleSuccess={jest.fn()}
    />,
  );
  expect(output).toMatchSnapshot();
});
