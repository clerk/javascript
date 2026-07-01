import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import type { OrganizationProfileProfileSectionDetailsContext } from '../organization-profile-profile-section-details.machine';
import { organizationProfileProfileSectionDetailsMachine } from '../organization-profile-profile-section-details.machine';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

function start(context: Partial<OrganizationProfileProfileSectionDetailsContext> = {}) {
  const updateOrganization = vi.fn(() => Promise.resolve());
  const actor = createActor(organizationProfileProfileSectionDetailsMachine, {
    context: {
      committedName: 'Acme Inc',
      committedSlug: 'acme',
      slugEnabled: true,
      updateOrganization,
      ...context,
    },
  });
  actor.start();
  actor.send({ type: 'OPEN' });
  return { actor, updateOrganization };
}

describe('organizationProfileProfileSectionDetailsMachine', () => {
  it('cannot submit while the draft still matches the committed values', () => {
    const { actor } = start();

    expect(actor.can({ type: 'SUBMIT' })).toBe(false);
  });

  it('cannot submit when the effective name is empty', () => {
    const { actor } = start();

    actor.send({ type: 'TYPE_NAME', value: '   ' });

    expect(actor.can({ type: 'SUBMIT' })).toBe(false);
  });

  it('can submit once the name diverges from the committed value', () => {
    const { actor } = start();

    actor.send({ type: 'TYPE_NAME', value: 'New Name' });

    expect(actor.can({ type: 'SUBMIT' })).toBe(true);
  });

  it('saves the effective name and slug, then clears the drafts', async () => {
    const { actor, updateOrganization } = start();

    actor.send({ type: 'TYPE_NAME', value: 'New Name' });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('saving');
    expect(updateOrganization).toHaveBeenCalledWith({ name: 'New Name', slug: 'acme' });

    await tick();

    expect(actor.getSnapshot().value).toBe('closed');
    expect(actor.getSnapshot().context.draftName).toBeNull();
    expect(actor.getSnapshot().context.draftSlug).toBeNull();
  });

  it('omits the slug when the slug field is disabled', async () => {
    const { actor, updateOrganization } = start({ slugEnabled: false });

    actor.send({ type: 'TYPE_NAME', value: 'New Name' });
    actor.send({ type: 'SUBMIT' });

    await tick();

    expect(updateOrganization).toHaveBeenCalledWith({ name: 'New Name' });
  });

  it('returns to editing with an error when the update rejects', async () => {
    const updateOrganization = vi.fn(() => Promise.reject(new Error('nope')));
    const actor = createActor(organizationProfileProfileSectionDetailsMachine, {
      context: { committedName: 'Acme Inc', committedSlug: 'acme', slugEnabled: true, updateOrganization },
    });
    actor.start();
    actor.send({ type: 'OPEN' });

    actor.send({ type: 'TYPE_NAME', value: 'New Name' });
    actor.send({ type: 'SUBMIT' });

    await tick();

    expect(actor.getSnapshot().value).toBe('editing');
    expect(actor.getSnapshot().context.error).toBe('nope');
  });

  it('discards drafts and closes on CANCEL', () => {
    const { actor } = start();

    actor.send({ type: 'TYPE_NAME', value: 'New Name' });
    actor.send({ type: 'TYPE_SLUG', value: 'new-slug' });
    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().value).toBe('closed');
    expect(actor.getSnapshot().context.draftName).toBeNull();
    expect(actor.getSnapshot().context.draftSlug).toBeNull();
  });
});
