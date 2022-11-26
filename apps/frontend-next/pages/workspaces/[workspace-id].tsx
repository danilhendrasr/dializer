import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const Workspace = dynamic(
  () =>
    import('../../components/workspace.page').then((mod) => mod.WorkspacePage),
  { ssr: false }
);

export default function WorkspaceWrapper() {
  return (
    <>
      <Head>
        <title>Flow Chart Editor | Dializer</title>
      </Head>
      <Workspace />
    </>
  );
}
