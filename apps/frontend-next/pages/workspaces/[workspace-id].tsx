import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouteProtection } from '../../hooks/use-route-protection.hook';
import { useRouter } from 'next/router';
import { useNodesStore } from '../../contexts/nodes.context';
import styled from 'styled-components';
import { WorkspaceEntity } from '@dializer/types';

const Workspace = dynamic(
  () =>
    import('../../components/workspace.page').then((mod) => mod.WorkspacePage),
  { ssr: false }
);

export default function WorkspaceWrapper() {
  useRouteProtection();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceEntity>();
  const fetchNodes = useNodesStore((state) => state.fetch);

  useEffect(() => {
    if (!router.isReady) return;
    const workspaceId = router.query['workspace-id'] as string;
    fetchNodes(workspaceId);

    const fetchWorkspaceDetail = async () => {
      const response = await fetch(
        `http://localhost:3333/api/workspaces/${workspaceId}`
      );

      const jsonResponse = await response.json();
      setWorkspace(jsonResponse);
    };

    fetchWorkspaceDetail();
  }, [router, fetchNodes]);

  return (
    <>
      <Head>
        <title>Flow Chart Editor | Dializer</title>
      </Head>
      <WorkspaceTitleContainer>
        <h1>{workspace && workspace.title}</h1>
      </WorkspaceTitleContainer>
      <Workspace />
    </>
  );
}
const WorkspaceTitleContainer = styled.div`
  position: absolute;
  display: flex;
  top: 10px;
  left: 20px;
  z-index: 999;
  width: fit-content;
  padding: 0 12px;
  background-color: white;
  border-radius: 5px;
  border: 1px solid lightgrey;
  /* gap: 10px; */
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

  h1 {
    font-family: sans-serif;
    font-size: 0.9rem;
    letter-spacing: 1px;
  }
`;
