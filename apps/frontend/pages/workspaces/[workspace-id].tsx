import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useUnauthorizedProtection } from '../../hooks/use-unauthorized-protection.hook';
import { useRouter } from 'next/router';
import { useNodesStore } from '../../contexts/nodes.context';
import { WorkspaceEntity } from '@dializer/types';
import { ControlPanel } from '../../components/control-panel';
import {
  ArrowLeft,
  DeviceFloppy,
  PlayerPause,
  PlayerPlay,
  Share,
} from 'tabler-icons-react';
import Link from 'next/link';
import { ToastContainer as Toast } from 'react-toastify';

const FlowchartCanvas = dynamic(
  () =>
    import('../../components/workspace.page').then((mod) => mod.WorkspacePage),
  { ssr: false }
);

export default function Workbench() {
  useUnauthorizedProtection();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceEntity>();
  const fetchNodes = useNodesStore((state) => state.fetch);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);

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

  const handleTitleChange = async (e: React.FocusEvent<HTMLHeadingElement>) => {
    await fetch(
      `http://localhost:3333/api/workspaces/${router.query['workspace-id']}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ title: e.target.innerText }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  };

  return (
    <div className="flex h-full flex-row">
      <Head>
        <title>Flow Chart Editor | Dializer</title>
      </Head>

      <div className="absolute h-full w-1/4 bg-base-100 z-50 shadow-md">
        <div className="flex gap-1 items-center border-b border-base-200 px-5 py-3">
          <Link href="/">
            <ArrowLeft
              size={25}
              className="hover:bg-base-200 cursor-pointer p-1 box-border"
            />
          </Link>
          <h1
            className="hover:bg-base-200 focus:bg-base-300 flex-1 box-border p-2"
            contentEditable
            onBlur={handleTitleChange}
          >
            {workspace && workspace.title}
          </h1>
        </div>

        <div>
          <h2>Nodes</h2>
        </div>

        <div>
          <h2>Environments</h2>
        </div>
      </div>

      <ControlPanel>
        <PlayerPlay
          size={18}
          onClick={() => console.log('heytayo')}
          className="cursor-pointer hover:fill-success transition hover:scale-110"
        />

        <PlayerPause
          size={18}
          onClick={() => console.log('testing')}
          className="cursor-pointer hover:fill-error transition hover:scale-110"
        />

        <Share
          size={18}
          cursor="pointer"
          onClick={() => {
            navigator.clipboard.writeText(
              `http://localhost:4200${router.asPath}`
            );

            alert('Link copied to clipboard.');
          }}
        />

        <DeviceFloppy
          size={18}
          cursor="pointer"
          onClick={async () => {
            alert('Saved');
          }}
        />
      </ControlPanel>

      <FlowchartCanvas workspaceId={router.query['workspace-id'] as string} />

      <Toast
        position="bottom-center"
        theme="light"
        className="font-sans text-black text-sm"
      />
    </div>
  );
}
