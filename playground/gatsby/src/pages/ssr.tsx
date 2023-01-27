import * as React from 'react';
import { GetServerData } from 'gatsby';
import { withServerAuth } from 'gatsby-plugin-clerk/ssr';

export const getServerData: GetServerData<any> = withServerAuth(
  async props => {
    return { props: { data: '1', auth: props.auth } };
  },
  { loadUser: true },
);

function SSRPage({ serverData }: any) {
  return (
    <main>
      <h1>SSR Page with Dogs</h1>
      <pre>{JSON.stringify(serverData, null, 2)}</pre>
    </main>
  );
}

export default SSRPage;
