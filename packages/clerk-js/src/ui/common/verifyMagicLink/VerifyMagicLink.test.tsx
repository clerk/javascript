import { render, renderJSON, screen, waitFor } from '@clerk/shared/testUtils';
import { MagicLinkError, MagicLinkErrorCode } from 'core/resources/Error';
import React from 'react';
import ReactDOM from 'react-dom';
import { VerifyMagicLink } from 'ui/common';

const mockHandleMagicLinkVerification = jest.fn();

const mockNavigate = jest.fn();
const mockSetSession = jest.fn();
const mockUseCoreClerk = jest.fn(() => ({
  handleMagicLinkVerification: mockHandleMagicLinkVerification,
  setSession: mockSetSession,
}));

jest.mock('ui/hooks', () => ({
  useNavigate: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('ui/contexts', () => {
  return {
    useCoreClerk: () => mockUseCoreClerk(),
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

describe('<VerifyMagicLink/>', function () {
  beforeAll(() => {
    jest.useFakeTimers();
    //@ts-ignore
    ReactDOM.createPortal = node => node;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    mockHandleMagicLinkVerification.mockReset();
  });

  it('renders the <VerifyMagicLink/> component', function () {
    const tree = renderJSON(<VerifyMagicLink />);
    expect(tree).toMatchSnapshot();
  });

  it('renders an expired screen for expired verification', async () => {
    mockHandleMagicLinkVerification.mockImplementationOnce(() => {
      throw new MagicLinkError(MagicLinkErrorCode.Expired);
    });

    render(<VerifyMagicLink />);

    await waitFor(() => {
      expect(
        screen.getByText('This magic link has expired'),
      ).toBeInTheDocument();
    });
  });

  it('renders a failed screen for failed verification', async () => {
    mockHandleMagicLinkVerification.mockImplementationOnce(() => {
      throw new MagicLinkError(MagicLinkErrorCode.Failed);
    });

    render(<VerifyMagicLink />);

    await waitFor(() => {
      expect(
        screen.getByText('This magic link is invalid'),
      ).toBeInTheDocument();
    });
  });
});
