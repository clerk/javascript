import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import type { ActionBlockedDetails } from '../ActionBlockedCard';
import { ActionBlockedCard } from '../ActionBlockedCard';

const { createFixtures } = bindCreateFixtures('SignIn');

const renderCard = async (details: ActionBlockedDetails) => {
  const { wrapper } = await createFixtures();
  return render(
    <CardStateProvider>
      <ActionBlockedCard details={details} />
    </CardStateProvider>,
    { wrapper },
  );
};

describe('ActionBlockedCard', () => {
  it('falls back to the default wording and shows the reference', async () => {
    await renderCard({ traceId: '7Q8ikxgt' });

    screen.getByText("We couldn't complete this request");
    screen.getByText('For your security, this request could not be completed.');
    screen.getByText('Reference');
    screen.getByText('7Q8ikxgt');
  });

  it("renders the application's wording as text, never as markup", async () => {
    const { container } = await renderCard({
      traceId: '7Q8ikxgt',
      title: '<b>Blocked</b>',
      description: '<img src=x onerror=alert(1)>',
    });

    screen.getByText('<b>Blocked</b>');
    screen.getByText('<img src=x onerror=alert(1)>');
    expect(container.querySelector('b')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('opens an https link in a new tab without an opener or referrer', async () => {
    await renderCard({ traceId: '7Q8ikxgt', linkUrl: 'https://help.example.com/blocked', linkText: 'Contact support' });

    const link = screen.getByRole('link', { name: 'Contact support' });
    expect(link).toHaveAttribute('href', 'https://help.example.com/blocked');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('drops a link that is not https and still renders the rest', async () => {
    const { container } = await renderCard({
      traceId: '7Q8ikxgt',
      title: 'Blocked',
      linkUrl: 'javascript:alert(1)',
      linkText: 'Click',
    });

    expect(screen.queryByText('Click')).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    screen.getByText('Blocked');
    screen.getByText('7Q8ikxgt');
  });
});
