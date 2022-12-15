import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouteProtection } from '../../hooks/use-route-protection.hook';

const Workspace = dynamic(
  () =>
    import('../../components/workspace.page').then((mod) => mod.WorkspacePage),
  { ssr: false }
);

export default function WorkspaceWrapper() {
  useRouteProtection();

  return (
    <>
      <Head>
        <title>Flow Chart Editor | Dializer</title>
      </Head>
      <Workspace />
    </>
  );
}
