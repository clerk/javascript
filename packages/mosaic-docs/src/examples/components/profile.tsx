'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { Profile } from '@clerk/mosaic/components/profile';
import { Section } from '@clerk/mosaic/components/section';
import { ShieldCheck } from '@clerk/mosaic/icons/glyphs/shield-check';
import { UserCircle } from '@clerk/mosaic/icons/glyphs/user-circle';
import { useState } from 'react';

const titles: Record<string, string> = { account: 'Account', security: 'Security' };

export default function ProfileExample() {
  const [page, setPage] = useState('account');
  return (
    <Profile.Root
      value={page}
      onValueChange={setPage}
      elevation='flush'
    >
      <Profile.Title>User profile</Profile.Title>
      <Profile.Nav>
        <Profile.NavItem
          value='account'
          icon={<Icon glyph={UserCircle} />}
        >
          Account
        </Profile.NavItem>
        <Profile.NavItem
          value='security'
          icon={<Icon glyph={ShieldCheck} />}
        >
          Security
        </Profile.NavItem>
      </Profile.Nav>
      <Profile.Content pageTitle={titles[page]}>
        <Profile.ContentPanel value='account'>
          <ProfileSection
            title='Profile'
            label='Name'
            value='Ada Lovelace'
          />
        </Profile.ContentPanel>
        <Profile.ContentPanel value='security'>
          <ProfileSection
            title='Password'
            label='Password'
            value='Last changed 3 months ago'
          />
        </Profile.ContentPanel>
      </Profile.Content>
    </Profile.Root>
  );
}

function ProfileSection({ title, label, value }: { title: string; label: string; value: string }) {
  return (
    <Section.Root>
      <Section.Group>
        <Section.Header>
          <Section.Title>{title}</Section.Title>
        </Section.Header>
        <Section.Body>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>{label}</Section.Label>
                <Section.Description>{value}</Section.Description>
              </Section.Content>
              <Section.Actions>
                <Button
                  variant='outline'
                  color='neutral'
                >
                  Edit
                </Button>
              </Section.Actions>
            </Section.Item>
          </Section.Row>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}
