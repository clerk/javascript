import { Show, SignInButton, UserButton } from '@clerk/react';
import { UserProfile, OrganizationProfile } from '@clerk/ui/experimental';
import { useState } from 'react';

type ProfileType = 'user' | 'organization';
type UserTab = 'account' | 'security' | 'billing' | 'api-keys';
type OrgTab = 'general' | 'members' | 'billing' | 'api-keys';

export function App() {
  const [profileType, setProfileType] = useState<ProfileType>('user');
  const [userTab, setUserTab] = useState<UserTab>('account');
  const [orgTab, setOrgTab] = useState<OrgTab>('general');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Show
        when='signed-out'
        fallback={
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1>Experimental Composed Profiles</h1>
              <UserButton />
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setProfileType('user')}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  background: profileType === 'user' ? '#000' : '#fff',
                  color: profileType === 'user' ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                UserProfile
              </button>
              <button
                onClick={() => setProfileType('organization')}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  background: profileType === 'organization' ? '#000' : '#fff',
                  color: profileType === 'organization' ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                OrganizationProfile
              </button>
            </div>

            {profileType === 'user' && (
              <UserProfile.Provider>
                <TabBar
                  tabs={['account', 'security', 'billing', 'api-keys']}
                  active={userTab}
                  onChange={setUserTab}
                />
                {userTab === 'account' && <UserProfile.Account />}
                {userTab === 'security' && <UserProfile.Security />}
                {userTab === 'billing' && <UserProfile.Billing />}
                {userTab === 'api-keys' && <UserProfile.APIKeys />}
              </UserProfile.Provider>
            )}

            {profileType === 'organization' && (
              <OrganizationProfile.Provider>
                <TabBar
                  tabs={['general', 'members', 'billing', 'api-keys']}
                  active={orgTab}
                  onChange={setOrgTab}
                />
                {orgTab === 'general' && <OrganizationProfile.General />}
                {orgTab === 'members' && <OrganizationProfile.Members />}
                {orgTab === 'billing' && <OrganizationProfile.Billing />}
                {orgTab === 'api-keys' && <OrganizationProfile.APIKeys />}
              </OrganizationProfile.Provider>
            )}
          </>
        }
      >
        <h1>Experimental Composed Profiles Playground</h1>
        <p>Sign in to test the composed UserProfile and OrganizationProfile components.</p>
        <SignInButton />
      </Show>
    </div>
  );
}

function TabBar<T extends string>({ tabs, active, onChange }: { tabs: T[]; active: T; onChange: (tab: T) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: '8px 16px',
            border: '1px solid #ccc',
            borderRadius: 6,
            background: active === tab ? '#000' : '#fff',
            color: active === tab ? '#fff' : '#000',
            cursor: 'pointer',
            textTransform: 'capitalize',
          }}
        >
          {tab.replace('-', ' ')}
        </button>
      ))}
    </div>
  );
}
