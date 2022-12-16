import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouteProtection } from '../../hooks/use-route-protection.hook';
import { useRouter } from 'next/router';
import { useNodesStore } from '../../contexts/nodes.context';

const Workspace = dynamic(
  () =>
    import('../../components/workspace.page').then((mod) => mod.WorkspacePage),
  { ssr: false }
);

export default function WorkspaceWrapper() {
  useRouteProtection();
  const router = useRouter();
  const fetchNodes = useNodesStore((state) => state.fetch);

  useEffect(() => {
    if (!router.isReady) return;
    fetchNodes(router.query['workspace-id'] as string);
  }, [router, fetchNodes]);

  return (
    <>
      <Head>
        <title>Flow Chart Editor | Dializer</title>
      </Head>
      <Workspace />
    </>
  );
}
