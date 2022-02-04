import { render, renderJSON, screen, waitFor } from '@clerk/shared/testUtils';
import React from 'react';
import ReactDOM from 'react-dom';

import { MagicLinkVerificationStatusModal } from './MagicLinkVerificationStatusModal';

jest.mock('ui/contexts/EnvironmentContext', () => {
  return {
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        theme: {
          general: {
            font_color: '#000000',
          },
        },
        branded: true,
      },
    })),
  };
});

jest.mock('ui/router/RouteContext');

describe('<MagicLinkVerificationStatusModal/>', function () {
  beforeAll(() => {
    jest.useFakeTimers();
    //@ts-ignore
    ReactDOM.createPortal = (node) => node;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the <MagicLinkVerificationStatusModal/> component', function () {
    const tree = renderJSON(
      <MagicLinkVerificationStatusModal verificationStatus="loading" />
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders and shows correct message if status is verified', async function () {
    render(<MagicLinkVerificationStatusModal verificationStatus="verified" />);
    await waitFor(() => {
      screen.getByText('Successfully signed in');
    });
  });

  it('renders and shows correct message if status is expired', async function () {
    render(<MagicLinkVerificationStatusModal verificationStatus="expired" />);
    await waitFor(() => {
      screen.getByText('This magic link has expired');
    });
  });

  it('renders and shows correct message if status is failed', async function () {
    render(<MagicLinkVerificationStatusModal verificationStatus="failed" />);
    await waitFor(() => {
      screen.getByText('This magic link is invalid');
    });
  });
});
