import { Show, SignInButton, UserButton } from '@clerk/react';
import { UserProfile, OrganizationProfile } from '@clerk/ui/experimental';
import { useState } from 'react';

type ProfileType = 'user' | 'organization';
type UserTab = 'account' | 'security' | 'billing' | 'api-keys';
type OrgTab = 'general' | 'members' | 'billing' | 'api-keys';
type ComposedMode = 'passthrough' | 'composed';

export function App() {
  const [profileType, setProfileType] = useState<ProfileType>('user');
  const [userTab, setUserTab] = useState<UserTab>('account');
  const [orgTab, setOrgTab] = useState<OrgTab>('general');
  const [composedMode, setComposedMode] = useState<ComposedMode>('passthrough');

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

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setComposedMode('passthrough')}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  background: composedMode === 'passthrough' ? '#555' : '#fff',
                  color: composedMode === 'passthrough' ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Page
              </button>
              <button
                onClick={() => setComposedMode('composed')}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  background: composedMode === 'composed' ? '#555' : '#fff',
                  color: composedMode === 'composed' ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Sections
              </button>
            </div>

            {profileType === 'user' && (
              <UserProfile.Provider>
                <TabBar
                  tabs={['account', 'security', 'billing', 'api-keys']}
                  active={userTab}
                  onChange={setUserTab}
                />
                {composedMode === 'passthrough' ? (
                  <>
                    {userTab === 'account' && <UserProfile.Account />}
                    {userTab === 'security' && <UserProfile.Security />}
                    {userTab === 'billing' && <UserProfile.Billing />}
                    {userTab === 'api-keys' && <UserProfile.APIKeys />}
                  </>
                ) : (
                  <>
                    {userTab === 'account' && (
                      <UserProfile.Account>
                        <UserProfile.AccountProfile />
                        <div style={{ padding: '1rem', textAlign: 'center', background: 'lime' }}>hello world</div>
                        <UserProfile.AccountEmails />
                        <UserProfile.AccountPhone />
                        <UserProfile.AccountConnectedAccounts />
                        <UserProfile.AccountWeb3 />
                      </UserProfile.Account>
                    )}
                    {userTab === 'security' && (
                      <UserProfile.Security>
                        <UserProfile.SecurityPassword />
                        <UserProfile.SecurityPasskeys />
                        <UserProfile.SecurityMfa />
                        <UserProfile.SecurityActiveDevices />
                        <UserProfile.SecurityDelete />
                      </UserProfile.Security>
                    )}
                    {userTab === 'billing' && <UserProfile.Billing />}
                    {userTab === 'api-keys' && <UserProfile.APIKeys />}
                  </>
                )}
              </UserProfile.Provider>
            )}

            {profileType === 'organization' && (
              <OrganizationProfile.Provider>
                <TabBar
                  tabs={['general', 'members', 'billing', 'api-keys']}
                  active={orgTab}
                  onChange={setOrgTab}
                />
                {composedMode === 'passthrough' ? (
                  <>
                    {orgTab === 'general' && <OrganizationProfile.General />}
                    {orgTab === 'members' && <OrganizationProfile.Members />}
                    {orgTab === 'billing' && <OrganizationProfile.Billing />}
                    {orgTab === 'api-keys' && <OrganizationProfile.APIKeys />}
                  </>
                ) : (
                  <>
                    {orgTab === 'general' && (
                      <OrganizationProfile.General>
                        <OrganizationProfile.GeneralOrganizationProfile />
                        <OrganizationProfile.GeneralVerifiedDomains />
                        <OrganizationProfile.GeneralLeaveOrganization />
                        <OrganizationProfile.GeneralDeleteOrganization />
                      </OrganizationProfile.General>
                    )}
                    {orgTab === 'members' && <OrganizationProfile.Members />}
                    {orgTab === 'billing' && <OrganizationProfile.Billing />}
                    {orgTab === 'api-keys' && <OrganizationProfile.APIKeys />}
                  </>
                )}
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
