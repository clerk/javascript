import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationProfileProfileSectionController } from '../organization-profile-profile-section.controller';

const ORG_NAME = 'Acme Inc';
const CUSTOM_LOGO = 'https://img.clerk.com/logo.png';
const DEFAULT_LOGO = 'https://example.com/avatar_placeholder.png';

let update: ReturnType<typeof vi.fn>;
let setLogo: ReturnType<typeof vi.fn>;
let checkAuthorization: ReturnType<typeof vi.fn>;
let isLoaded: boolean;
let isSessionLoaded: boolean;
let slugDisabled: boolean;
let organization: {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  update: (params: { name: string; slug?: string }) => Promise<void>;
  setLogo: (params: { file: File | null }) => Promise<void>;
} | null;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/shared/react')>();
  return {
    ...actual,
    useOrganization: () => ({ isLoaded, organization }),
    useSession: () => ({
      isLoaded: isSessionLoaded,
      session: isSessionLoaded ? { id: 'sess_1', checkAuthorization } : undefined,
    }),
    useClerk: () => ({
      __internal_environment: { organizationSettings: { slug: { disabled: slugDisabled } } },
    }),
  };
});

beforeEach(() => {
  update = vi.fn().mockResolvedValue(undefined);
  setLogo = vi.fn().mockResolvedValue(undefined);
  checkAuthorization = vi.fn().mockReturnValue(true);
  isLoaded = true;
  isSessionLoaded = true;
  slugDisabled = false;
  organization = { id: 'org_1', name: ORG_NAME, slug: 'acme', imageUrl: CUSTOM_LOGO, update, setLogo };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const controller = useOrganizationProfileProfileSectionController();
  if (controller.status !== 'ready') {
    return <output data-testid='state'>{controller.status}</output>;
  }
  return (
    <div>
      <output data-testid='state'>{controller.details.snapshot.value}</output>
      <output data-testid='canSubmit'>{String(controller.details.canSubmit)}</output>
      <output data-testid='canRemove'>{String(controller.logo.canRemove)}</output>
      <button onClick={() => controller.details.send({ type: 'OPEN' })}>Open</button>
      <button onClick={() => controller.details.send({ type: 'TYPE_NAME', value: 'New Name' })}>Type</button>
      <button onClick={() => controller.details.send({ type: 'SUBMIT' })}>Submit</button>
    </div>
  );
}

describe('useOrganizationProfileProfileSectionController', () => {
  it('is loading until the organization is loaded', () => {
    isLoaded = false;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
  });

  it('is loading until the session is loaded', () => {
    isSessionLoaded = false;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('loading');
    expect(checkAuthorization).not.toHaveBeenCalled();
  });

  it('is hidden when the user lacks the manage permission', () => {
    checkAuthorization.mockReturnValue(false);

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
    expect(checkAuthorization).toHaveBeenCalledWith({ permission: 'org:sys_profile:manage' });
  });

  it('is hidden when there is no active organization', () => {
    organization = null;

    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('hidden');
  });

  it('is ready and enables submit once the name diverges from the organization', () => {
    render(<Harness />);

    expect(screen.getByTestId('state')).toHaveTextContent('closed');

    fireEvent.click(screen.getByText('Open'));

    expect(screen.getByTestId('state')).toHaveTextContent('editing');
    expect(screen.getByTestId('canSubmit')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Type'));

    expect(screen.getByTestId('canSubmit')).toHaveTextContent('true');
  });

  it('omits the slug from the update when slugs are disabled', async () => {
    slugDisabled = true;

    render(<Harness />);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Type'));

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

    expect(update).toHaveBeenCalledWith({ name: 'New Name' });
  });

  it('allows removing a custom logo but not a default one', () => {
    const { unmount } = render(<Harness />);
    expect(screen.getByTestId('canRemove')).toHaveTextContent('true');
    unmount();

    organization = { id: 'org_1', name: ORG_NAME, slug: 'acme', imageUrl: DEFAULT_LOGO, update, setLogo };

    render(<Harness />);
    expect(screen.getByTestId('canRemove')).toHaveTextContent('false');
  });
});
