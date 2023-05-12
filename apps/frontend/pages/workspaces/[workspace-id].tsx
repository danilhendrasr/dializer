import React, { MouseEventHandler, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useUnauthorizedProtection } from '../../hooks/use-unauthorized-protection.hook';
import { useRouter } from 'next/router';
import { useFlowchartStore } from '../../stores/flowchart';
import { WorkspaceEntity, WorkspaceVisibility } from '@dializer/types';
import { ControlPanel } from '../../components/control-panel';
import {
  ArrowLeft,
  DeviceFloppy,
  PlayerPause,
  PlayerPlay,
  Settings,
  Share,
  Trash,
} from 'tabler-icons-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { AnimationState } from '../../common/types';
import { InterpreterContext } from '../../contexts/expression-interpreter.context';
import { envStore, useEnvStore } from '../../stores/environment';
import { ExpressionInterpreter } from '@dializer/expression-interpreter';
import { Oval } from 'react-loader-spinner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkspaceService } from 'apps/frontend/services/workspace';

// Dynamically load the flowchart canvas component and disable ssr for it
// because it requires the presence of the "window" object.
const FlowchartCanvas = dynamic(
  async () => {
    const mod = await import('../../components/flowchart-canvas');
    return mod.FlowchartCanvas;
  },
  { ssr: false }
);

enum SideBarTab {
  Environment = 'Environment',
  Legend = 'Legend',
}

export default function Workbench() {
  useUnauthorizedProtection();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', router.query['workspace-id']],
    queryFn: async () => {
      return await WorkspaceService.getInstance().getById(
        router.query['workspace-id'] as string
      );
    },
  });

  const [activeTab, setActiveTab] = useState(SideBarTab.Environment);
  const [deletionModalIsOpen, setDeletionModalIsOpen] = useState(false);
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false);

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

  const deletionModalId = 'deletion-modal';
  const settingsModalId = 'settings-modal';

  useEffect(() => {
    if (!router.isReady) return;
    const workspaceId = router.query['workspace-id'] as string;
    fetchNodes(workspaceId);
  }, [router, fetchNodes]);

  const handleTitleChange = async (e: React.FocusEvent<HTMLHeadingElement>) => {
    await WorkspaceService.getInstance().updateMetadata(
      router.query['workspace-id'] as string,
      { title: e.target.innerText }
    );
  };

  const handleWorkspaceShare = () => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_APP_HOST}${router.asPath}`
    );
    toast.success('Link copied to clipboard.');
  };

  const handleWorkspaceDelete: MouseEventHandler = async (e) => {
    e.preventDefault();

    try {
      setDeletionModalIsOpen(false);
      await WorkspaceService.getInstance().deleteById(
        router.query['workspace-id'] as string
      );

      toast.error(
        'Workspace successfully deleted, dismiss this alert to redirect to dashboard.'
      );

      toast.onChange((toast) => {
        if (toast.status === 'removed') {
          router.push('/');
        }
      });
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  const handleSettingsSave = async (settings: Partial<WorkspaceEntity>) => {
    try {
      await WorkspaceService.getInstance().updateMetadata(
        router.query['workspace-id'] as string,
        settings
      );

      queryClient.invalidateQueries([
        'workspace',
        router.query['workspace-id'],
      ]);
      toast.success('Workspace settings successfully updated.');
      setSettingsModalIsOpen(false);
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <Oval
        height={60}
        width={60}
        color="#570df8"
        secondaryColor="#e5e6e6"
        wrapperClass="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    );
  }

  return (
    <InterpreterContext.Provider value={new ExpressionInterpreter(envStore)}>
      <div className="flex h-full flex-row">
        <Head>
          <title>Flow Chart Editor | Dializer</title>
        </Head>
        {/* Side bar */}
        <div className="absolute h-full w-1/4 bg-base-100 z-50 shadow-md">
          {/* Tab header */}
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
          {/* End of tab header */}

          {/* Tabs */}
          <div>
            <div className="tabs w-full py-1">
              {Object.values(SideBarTab).map((tabName, idx) => {
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
              {activeTab === SideBarTab.Environment ? (
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
              {activeTab === SideBarTab.Legend ? <h1>Nodes Tab</h1> : null}
            </div>
            {/* End of tab contents */}
          </div>
          {/* End of tabs */}
        </div>
        {/* End of side bar */}

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

          {workspace.visibility === WorkspaceVisibility.PRIVATE ? null : (
            <Share
              size={18}
              cursor="pointer"
              className="hover:fill-black hover:scale-110 active:scale-100 transition"
              onClick={handleWorkspaceShare}
            />
          )}

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

          <label
            htmlFor={deletionModalId}
            onClick={() => setDeletionModalIsOpen(true)}
          >
            <Trash
              size={18}
              cursor={'pointer'}
              className="stroke-red-400 hover:stroke-red-600 hover:scale-110 active:scale-100 transition"
            />
          </label>

          <label
            htmlFor={settingsModalId}
            onClick={() => setSettingsModalIsOpen(true)}
          >
            <Settings
              size={18}
              cursor="pointer"
              className="hover:fill-black hover:scale-110 active:scale-100 transition"
            />
          </label>
        </ControlPanel>

        <FlowchartCanvas />

        {/* This is the modal's trigger */}
        <input
          type="checkbox"
          id={settingsModalId}
          className="modal-toggle"
          checked={settingsModalIsOpen}
          readOnly
        />
        <SettingsModal
          modalId={settingsModalId}
          workspaceData={workspace}
          onCancel={() => setSettingsModalIsOpen(false)}
          onSave={(settings) => handleSettingsSave(settings)}
        />

        {/* This is the modal's trigger */}
        <input
          type="checkbox"
          id={deletionModalId}
          className="modal-toggle"
          checked={deletionModalIsOpen}
          readOnly
        />
        <DeletionModal
          modalId={deletionModalId}
          onCancel={() => setDeletionModalIsOpen(false)}
          onConfirm={handleWorkspaceDelete}
        />
      </div>
    </InterpreterContext.Provider>
  );
}

type SettingsModalProps = {
  modalId: string;
  workspaceData: WorkspaceEntity;
  onCancel: () => void;
  onSave: (settings: Partial<WorkspaceEntity>) => void;
};

const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { modalId, workspaceData, onCancel, onSave } = props;

  const [visibility, setVisibility] = useState(workspaceData?.visibility);

  return (
    <div className="modal" id={modalId}>
      <div className="modal-box">
        <h1 className="py-4 font-bold text-xl">Settings</h1>
        <div>
          <div className="flex items-center gap-2">
            <label htmlFor="workspace-visibility">Is Private: </label>
            <input
              id="workspace-visibility"
              className="checkbox"
              type="checkbox"
              checked={
                visibility === WorkspaceVisibility.PRIVATE ? true : false
              }
              onChange={(e) => {
                const newVisibility = e.target.checked
                  ? WorkspaceVisibility.PRIVATE
                  : WorkspaceVisibility.PUBLIC;

                setVisibility(newVisibility);
              }}
            />
          </div>
        </div>
        <div className="modal-action">
          <label
            htmlFor={modalId}
            className="btn btn-outline"
            onClick={onCancel}
          >
            Cancel
          </label>
          <label
            htmlFor={modalId}
            className="btn"
            onClick={() => onSave({ visibility })}
          >
            Save
          </label>
        </div>
      </div>
    </div>
  );
};

type DeletionModalProps = {
  modalId: string;
  onCancel: () => void;
  onConfirm: React.MouseEventHandler;
};

const DeletionModal: React.FC<DeletionModalProps> = (props) => {
  const { modalId, onCancel, onConfirm } = props;

  return (
    <div className="modal" id={modalId}>
      <div className="modal-box">
        <h1 className="py-4 font-bold text-xl">Delete this workspace?</h1>
        <div className="modal-action">
          <label
            htmlFor={modalId}
            className="btn btn-outline"
            onClick={onCancel}
          >
            Cancel
          </label>
          <label htmlFor={modalId} className="btn" onClick={onConfirm}>
            Save
          </label>
        </div>
      </div>
    </div>
  );
};
