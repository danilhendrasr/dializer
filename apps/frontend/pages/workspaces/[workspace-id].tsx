import React, { MouseEventHandler, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useUnauthorizedProtection } from '../../hooks/use-unauthorized-protection.hook';
import { useRouter } from 'next/router';
import { useFlowchartStore } from '../../stores/flowchart';
import { WorkspaceEntity } from '@dializer/types';
import { ControlPanel } from '../../components/control-panel';
import {
  ArrowLeft,
  DeviceFloppy,
  PlayerPause,
  PlayerPlay,
  Share,
  Trash,
} from 'tabler-icons-react';
import Link from 'next/link';
import useSWR from 'swr';
import { swrFetcher } from '../../common/utils';
import { toast } from 'react-toastify';
import { AnimationState, LocalStorageItems } from '../../common/types';
import { InterpreterContext } from '../../contexts/expression-interpreter.context';
import { envStore, useEnvStore } from '../../stores/environment';
import { ExpressionInterpreter } from '@dializer/expression-interpreter';

// Dynamically load the flowchart canvas component and disable ssr for it,
// as it requires the presence of the "window" object.
const FlowchartCanvas = dynamic(
  () =>
    import('../../components/flowchart-canvas').then(
      (mod) => mod.FlowchartCanvas
    ),
  { ssr: false }
);

enum SideTab {
  Environment = 'Environment',
  Nodes = 'Nodes',
}

export default function Workbench() {
  useUnauthorizedProtection();
  const router = useRouter();

  const { data: workspace } = useSWR<WorkspaceEntity>(
    router.query['workspace-id']
      ? `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${router.query['workspace-id']}`
      : null,
    swrFetcher
  );

  const [activeTab, setActiveTab] = useState(SideTab.Environment);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  const terminalNodesOnly = useFlowchartStore(
    (s) => s.computed.flowchartOnlyHasTerminalNodes
  );

  const env = useEnvStore((s) => s.variables);
  const thereIsUnsavedChanges = useFlowchartStore((s) => s.unsavedChangesExist);
  const animationState = useFlowchartStore((s) => s.animationState);
  const startAnimation = useFlowchartStore((s) => s.startAnimation);
  const stopAnimation = useFlowchartStore((s) => s.stopAnimation);
  const fetchNodes = useFlowchartStore((s) => s.fetchNodes);
  const saveNodes = useFlowchartStore((s) => s.saveNodes);

  useEffect(() => {
    if (!router.isReady) return;
    const workspaceId = router.query['workspace-id'] as string;
    fetchNodes(workspaceId);
  }, [router, fetchNodes]);

  const handleTitleChange = async (e: React.FocusEvent<HTMLHeadingElement>) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${router.query['workspace-id']}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ title: e.target.innerText }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(
            LocalStorageItems.ACCESS_TOKEN
          )}`,
        },
      }
    );
  };

  const handleWorkspaceShare = () => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_APP_HOST}${router.asPath}`
    );
    toast('Link copied to clipboard.', { type: 'success' });
  };

  const handleWorkspaceDelete: MouseEventHandler = async (e) => {
    setDeleteModalIsOpen(false);
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${router.query['workspace-id']}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem(
              LocalStorageItems.ACCESS_TOKEN
            )}`,
          },
        }
      );

      if (!res.ok) {
        const jsonRes = await res.json();
        throw new Error(jsonRes.message);
      }

      toast(
        'Workspace successfully deleted, dismiss this alert to redirect to dashboard.',
        { type: 'success' }
      );

      toast.onChange((toast) => {
        if (toast.status === 'removed') {
          router.push('/');
        }
      });
    } catch (e) {
      const err = e as Error;
      toast(err.message, { type: 'error' });
    }
  };

  return (
    <InterpreterContext.Provider value={new ExpressionInterpreter(envStore)}>
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
              suppressContentEditableWarning={true}
            >
              {workspace && workspace.title}
            </h1>
          </div>

          {/* Tabs */}
          <div>
            <div className="tabs w-full py-1">
              {Object.values(SideTab).map((tabName, idx) => {
                let className = 'tab tab-bordered flex-1';
                if (tabName === activeTab) {
                  className += ' tab-active';
                }

                return (
                  <h2
                    key={idx}
                    className={className}
                    onClick={() => setActiveTab(tabName)}
                  >
                    {tabName}
                  </h2>
                );
              })}
            </div>
            {/* End of tabs */}

            {/* Tab contents */}
            <div>
              {activeTab === SideTab.Environment ? (
                <>
                  {Object.entries(env).map(([key, val], idx) => (
                    <p
                      key={idx}
                      className="bg-base-200 px-3 py-2 font-mono text-sm transition"
                    >
                      {key}: {val as string}
                    </p>
                  ))}
                </>
              ) : null}
              {activeTab === SideTab.Nodes ? <h1>Nodes Tab</h1> : null}
            </div>
            {/* End of tab contents */}
          </div>
        </div>

        <ControlPanel>
          <PlayerPlay
            size={18}
            onClick={startAnimation}
            className={
              animationState === AnimationState.Playing ||
              animationState === AnimationState.TemporaryStopped ||
              terminalNodesOnly
                ? 'pointer-events-none fill-base-300 text-base-300'
                : 'cursor-pointer hover:fill-success transition hover:scale-110 active:scale-100'
            }
          />

          <PlayerPause
            size={18}
            onClick={stopAnimation}
            className={
              animationState !== AnimationState.Playing
                ? 'pointer-events-none fill-base-300 text-base-300'
                : 'cursor-pointer hover:fill-error transition hover:scale-110 active:scale-100'
            }
          />

          <Share
            size={18}
            cursor="pointer"
            className="hover:fill-black hover:scale-110 active:scale-100 transition"
            onClick={handleWorkspaceShare}
          />

          <DeviceFloppy
            size={18}
            cursor="pointer"
            onClick={() => saveNodes(workspace.id)}
            className={
              thereIsUnsavedChanges
                ? 'hover:fill-blue-200 hover:scale-110 active:scale-100 transition'
                : 'pointer-events-none fill-base-100 text-base-300'
            }
          />

          <label htmlFor="my-modal" onClick={() => setDeleteModalIsOpen(true)}>
            <Trash
              size={18}
              cursor={'pointer'}
              className="stroke-red-400 hover:stroke-red-600 hover:scale-110 active:scale-100 transition"
            />
          </label>
        </ControlPanel>

        <FlowchartCanvas />

        <input
          type="checkbox"
          id="my-modal"
          className="modal-toggle"
          checked={deleteModalIsOpen}
        />
        <div className="modal" id="my-modal">
          <div className="modal-box">
            <p className="py-4">
              Are you sure you want to delete this workspace?
            </p>
            <div className="modal-action">
              <label
                htmlFor="my-modal"
                className="btn btn-outline"
                onClick={() => setDeleteModalIsOpen(false)}
              >
                No
              </label>
              <label
                htmlFor="my-modal"
                className="btn"
                onClick={handleWorkspaceDelete}
              >
                Yes
              </label>
            </div>
          </div>
        </div>
      </div>
    </InterpreterContext.Provider>
  );
}
