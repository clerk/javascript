import type { AgentConnectionResource } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { fireEvent, render, screen, waitFor } from '@/test/utils';

import { clearFetchCache } from '../../../hooks';
import { AgentConnectionsSection } from '../AgentConnectionsSection';

const { createFixtures } = bindCreateFixtures('UserProfile');
const connection: AgentConnectionResource = {
  id: 'connection_123',
  name: 'Personal agent',
  domain: 'agent.example',
  imageUrl: null,
  scopes: ['profile', 'email'],
  lastUsedAt: null,
};

describe('AgentConnectionsSection', () => {
  beforeEach(() => clearFetchCache());
  afterEach(() => vi.restoreAllMocks());

  it('shows agent name, domain, granted scopes, and unknown last use', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    fixtures.clerk.user?.__experimental_getAgentConnections.mockResolvedValue({ data: [connection], total_count: 1 });

    render(<AgentConnectionsSection />, { wrapper });

    await screen.findByText('Personal agent');
    screen.getByText('agent.example');
    screen.getByText('Scopes: profile, email');
    screen.getByText('Last used: Unknown');
    screen.getByText('P');
    expect(screen.queryByRole('img', { name: "Personal agent's logo" })).not.toBeInTheDocument();
  });

  it('shows the personal-agent logo', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    fixtures.clerk.user?.__experimental_getAgentConnections.mockResolvedValue({
      data: [{ ...connection, imageUrl: 'https://agent.example/logo.svg' }],
      total_count: 1,
    });

    render(<AgentConnectionsSection />, { wrapper });

    const logo = await screen.findByRole('img', { name: "Personal agent's logo" });
    expect(logo).toHaveAttribute('src', 'https://agent.example/logo.svg');
    expect(logo).not.toHaveAttribute('crossorigin');
  });

  it('shows initials when the personal-agent logo fails to load', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    fixtures.clerk.user?.__experimental_getAgentConnections.mockResolvedValue({
      data: [{ ...connection, imageUrl: 'https://agent.example/logo.svg' }],
      total_count: 1,
    });

    render(<AgentConnectionsSection />, { wrapper });

    const logo = await screen.findByRole('img', { name: "Personal agent's logo" });
    fireEvent.error(logo);

    expect(screen.queryByRole('img', { name: "Personal agent's logo" })).not.toBeInTheDocument();
    screen.getByText('P');
  });

  it('shows a known last-use date and unavailable domain without exposing a URL', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    fixtures.clerk.user?.__experimental_getAgentConnections.mockResolvedValue({
      data: [{ ...connection, domain: null, scopes: [], lastUsedAt: new Date('2026-10-01T12:00:00Z') }],
      total_count: 1,
    });

    render(<AgentConnectionsSection />, { wrapper });

    await screen.findByText('Domain unavailable');
    screen.getByText('Scopes: None');
    expect(screen.getByText(/^Last used:/)).not.toHaveTextContent('Unknown');
  });

  it('hides the section when there are no connections', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const { container } = render(<AgentConnectionsSection />, { wrapper });

    await waitFor(() => expect(fixtures.clerk.user?.__experimental_getAgentConnections).toHaveBeenCalled());
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('supports an older ClerkJS resource without the experimental method', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    Object.defineProperty(fixtures.clerk.user, '__experimental_getAgentConnections', { value: undefined });

    const { container } = render(<AgentConnectionsSection />, { wrapper });

    expect(container).toBeEmptyDOMElement();
  });

  it('reports a request failure and retries without showing an empty result', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    fixtures.clerk.user?.__experimental_getAgentConnections
      .mockRejectedValueOnce(new Error('Request failed'))
      .mockResolvedValueOnce({ data: [connection], total_count: 1 });
    const { userEvent } = render(<AgentConnectionsSection />, { wrapper });

    await screen.findByText('Agent connections could not be loaded.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await screen.findByText('Personal agent');
    expect(screen.queryByText('Agent connections could not be loaded.')).not.toBeInTheDocument();
  });

  it('requests the next connection page and does not retain the previous rows', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const getConnections = fixtures.clerk.user?.__experimental_getAgentConnections;
    getConnections?.mockResolvedValueOnce({ data: [connection], total_count: 11 }).mockResolvedValueOnce({
      data: [{ ...connection, id: 'connection_456', name: 'Second personal agent' }],
      total_count: 11,
    });
    const { userEvent } = render(<AgentConnectionsSection />, { wrapper });

    await screen.findByText('Personal agent');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    await screen.findByText('Second personal agent');
    expect(screen.queryByText('Personal agent')).not.toBeInTheDocument();
    expect(getConnections).toHaveBeenLastCalledWith({ pageSize: 10, initialPage: 2 });
  });

  it.each([10, 0])(
    'keeps Previous available when the last page becomes empty and total count is %s',
    async totalCount => {
      const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
      fixtures.clerk.user?.__experimental_getAgentConnections
        .mockResolvedValueOnce({ data: [connection], total_count: 11 })
        .mockResolvedValueOnce({ data: [], total_count: totalCount });
      const { userEvent } = render(<AgentConnectionsSection />, { wrapper });

      await screen.findByText('Personal agent');
      await userEvent.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => expect(screen.queryByText('Personal agent')).not.toBeInTheDocument());

      const previous = screen.getByRole('button', { name: /previous/i });
      expect(previous).toBeEnabled();
      await userEvent.click(previous);
      await screen.findByText('Personal agent');
    },
  );

  it('shows a refresh failure after a cached empty result expires', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    fixtures.clerk.user?.__experimental_getAgentConnections
      .mockResolvedValueOnce({ data: [], total_count: 0 })
      .mockRejectedValueOnce(new Error('Request failed'));
    const { container, unmount } = render(<AgentConnectionsSection />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.user?.__experimental_getAgentConnections).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    unmount();
    const now = Date.now;
    vi.spyOn(Date, 'now').mockImplementation(() => now() + 180_000);

    render(<AgentConnectionsSection />, { wrapper });

    await screen.findByText('Agent connections could not be loaded.');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled();
  });
});
