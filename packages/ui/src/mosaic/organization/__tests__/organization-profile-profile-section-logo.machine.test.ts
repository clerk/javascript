import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../machine/createActor';
import { organizationProfileProfileSectionLogoMachine } from '../organization-profile-profile-section-logo.machine';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const file = new File(['logo'], 'logo.png', { type: 'image/png' });

describe('organizationProfileProfileSectionLogoMachine', () => {
  it('uploads the selected file, then returns to idle', async () => {
    const setLogo = vi.fn(() => Promise.resolve());
    const actor = createActor(organizationProfileProfileSectionLogoMachine, { context: { setLogo } });
    actor.start();

    actor.send({ type: 'UPLOAD', file });

    expect(actor.getSnapshot().value).toBe('submitting');
    expect(setLogo).toHaveBeenCalledWith(file);

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('removes the logo by submitting a null file', async () => {
    const setLogo = vi.fn(() => Promise.resolve());
    const actor = createActor(organizationProfileProfileSectionLogoMachine, { context: { setLogo } });
    actor.start();

    actor.send({ type: 'REMOVE' });

    expect(actor.getSnapshot().value).toBe('submitting');
    expect(setLogo).toHaveBeenCalledWith(null);

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('returns to idle with an error when the mutation rejects', async () => {
    const setLogo = vi.fn(() => Promise.reject(new Error('too big')));
    const actor = createActor(organizationProfileProfileSectionLogoMachine, { context: { setLogo } });
    actor.start();

    actor.send({ type: 'UPLOAD', file });

    await tick();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.error).toBe('too big');
  });
});
