import React, { MouseEventHandler, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkspaceService } from '../../services/workspace';
import { useForm } from 'react-hook-form';
import { Variants, motion } from 'framer-motion';

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
  Information = 'Information',
}

const controlPanelIconVariants: Variants = {
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' } },
  hidden: { opacity: 0, scale: 0.5 },
};

export default function Workbench() {
  useUnauthorizedProtection();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: workspace, isLoading } = useQuery({
    enabled: router.query['workspace-id'] !== undefined,
    queryKey: ['workspace', router.query['workspace-id']],
    queryFn: async () => {
      return await WorkspaceService.getInstance().getById(
        router.query['workspace-id'] as string
      );
    },
  });

  const workspaceMutation = useMutation({
    mutationFn: async (settings: SettingsModalInputs) => {
      const data: Partial<WorkspaceEntity> = {
        ...settings,
        visibility: settings.isPrivate
          ? WorkspaceVisibility.PRIVATE
          : WorkspaceVisibility.PUBLIC,
      };

      await WorkspaceService.getInstance().updateMetadata(
        router.query['workspace-id'] as string,
        data
      );

      queryClient.invalidateQueries([
        'workspace',
        router.query['workspace-id'],
      ]);
    },
    onSuccess: () => {
      toast.success('Workspace settings successfully updated.');
      setSettingsModalIsOpen(false);
    },
    onError: (e) => {
      const err = e as Error;
      toast.error(err.message);
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

  if (!workspace || isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Oval
          height={60}
          width={60}
          color="#570df8"
          secondaryColor="#e5e6e6"
          wrapperClass="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </motion.div>
    );
  }

  return (
    <InterpreterContext.Provider value={new ExpressionInterpreter(envStore)}>
      <div className="flex h-full flex-row">
        <Head>
          <title>Flow Chart Editor | Dializer</title>
        </Head>

        {/* Side bar */}
        <motion.div
          className="absolute h-full w-1/4 bg-base-100 z-50 shadow-md max-h-full overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.3, when: 'beforeChildren' },
            },
            hidden: { opacity: 0, x: -20 },
          }}
        >
          <motion.div
            className="grid grid-cols-[25px_1fr] gap-1 gap-x-3 items-center border-b border-base-200 px-5 py-5 box-border"
            variants={{
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            <motion.span
              className="hover:bg-base-200 cursor-pointer p-1 box-border row-span-2"
              variants={{
                visible: { opacity: 1, x: 0, transition: { delay: 0.3 } },
                hidden: { opacity: 0, x: -20 },
              }}
            >
              <Link href="/">
                <ArrowLeft size={27} />
              </Link>
            </motion.span>
            <motion.h1
              className="py-2 font-bold"
              variants={{
                visible: { opacity: 1, x: 0 },
                hidden: { opacity: 0, x: -20 },
              }}
            >
              {workspace && workspace.title}
            </motion.h1>
            {workspace.description ? (
              <motion.p
                className="text-sm col-start-2 text-slate-500"
                variants={{
                  visible: { opacity: 1, x: 0 },
                  hidden: { opacity: 0, x: -20 },
                }}
              >
                {workspace.description}
              </motion.p>
            ) : null}
          </motion.div>

          {/* Tabs */}
          <div className="h-full">
            <motion.div
              className="tabs w-full py-1"
              variants={{
                visible: { opacity: 1, y: 0, transition: { delay: 0.5 } },
                hidden: { opacity: 0, y: -20 },
              }}
            >
              {Object.values(SideBarTab).map((tabName, idx) => {
                let className = 'tab tab-bordered flex-1';
                if (tabName === activeTab) {
                  className += ' tab-active';
                }

                return (
                  <motion.h2
                    key={idx}
                    className={className}
                    onClick={() => setActiveTab(tabName)}
                  >
                    {tabName}
                  </motion.h2>
                );
              })}
            </motion.div>
            {/* End of tabs */}

            {/* Tab contents */}
            <div className="overflow-scroll px-3 h-full">
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

              {activeTab === SideBarTab.Information ? (
                <InformationSidebarTab />
              ) : null}
            </div>
            {/* End of tab contents */}
          </div>
          {/* End of tabs */}
        </motion.div>
        {/* End of side bar */}

        <ControlPanel
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.3,
                duration: 0.3,
                when: 'beforeChildren',
                staggerChildren: 0.03,
              },
            },
            hidden: { opacity: 0, y: -20 },
          }}
        >
          <motion.span variants={controlPanelIconVariants}>
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
          </motion.span>

          <motion.span variants={controlPanelIconVariants}>
            <PlayerPause
              size={18}
              onClick={stopAnimation}
              className={
                animationState !== AnimationState.Playing
                  ? 'pointer-events-none fill-base-300 text-base-300'
                  : 'cursor-pointer hover:fill-error transition hover:scale-110 active:scale-100'
              }
            />
          </motion.span>

          {workspace.visibility === WorkspaceVisibility.PRIVATE ? null : (
            <motion.span variants={controlPanelIconVariants}>
              <Share
                size={18}
                cursor="pointer"
                className="hover:fill-black hover:scale-110 active:scale-100 transition"
                onClick={handleWorkspaceShare}
              />
            </motion.span>
          )}

          <motion.span variants={controlPanelIconVariants}>
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
          </motion.span>

          <motion.span variants={controlPanelIconVariants}>
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
          </motion.span>

          <motion.span variants={controlPanelIconVariants}>
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
          </motion.span>
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
          onSave={workspaceMutation.mutate}
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

const InformationSidebarTab: React.FC = () => {
  return (
    <div className="pb-28">
      <div className="mb-7">
        <h2 className="text-xl border-b-slate-300 border-b py-2 mb-3">
          Node Types
        </h2>
        <ul className="grid grid-cols-2 gap-y-2">
          <li className="text-center flex flex-col items-center">
            <span className="my-1">Process</span>
            <Image
              src="/process-node.svg"
              alt="Process Node"
              width={90}
              height={90}
            />
          </li>
          <li className="text-center flex flex-col items-center">
            <span className="my-1">Conditional</span>
            <Image
              src="/if-node.svg"
              alt="Conditional Node"
              width={60}
              height={60}
            />
          </li>
          <li className="text-center flex flex-col items-center">
            <span className="my-1">Input</span>
            <Image
              src="/input-node.svg"
              alt="Input Node"
              width={100}
              height={100}
            />
          </li>
          <li className="text-center flex flex-col items-center">
            <span className="my-1">Output</span>
            <Image
              src="/output-node.svg"
              alt="Output Node"
              width={110}
              height={110}
            />
          </li>
        </ul>
      </div>

      <h2 className="text-xl border-b-slate-300 border-b py-2 mb-3">
        Expressions
      </h2>
      <p className="text-sm">
        For input, conditional, and process nodes, users can type in
        programmatic expressions that will be evaluated by Dializer.{' '}
      </p>
      <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box my-3">
        <input type="checkbox" />
        <div className="collapse-title flex items-center text-sm py-2 min-h-fit">
          <span className="font-bold">Variable Declaration and Assignment</span>
        </div>
        <div className="collapse-content">
          <p className="text-sm">
            Variable declarations can be done by declaring the variable name,
            follow it with an equal sign, and the variable&apos;s value:{' '}
          </p>
          <div className="py-3 text-xs flex gap-1">
            <kbd className="kbd">variableName</kbd>
            <kbd className="kbd">=</kbd>
            <kbd className="kbd">&quot;value&quot;</kbd>
          </div>
          <p className="text-sm">
            The above syntax can also acts as variable assignment if the
            variable has already been declared.
          </p>
        </div>
      </div>
      <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box my-3">
        <input type="checkbox" />
        <div className="collapse-title flex items-center text-sm py-2 min-h-fit">
          <span className="font-bold">Data Types</span>
        </div>
        <div className="collapse-content text-sm">
          <p>The following data types are supported:</p>
          <div className="mx-auto my-3">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Data Type</th>
                  <th>Examples</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>String</td>
                  <td className="flex gap-1 text-xs">
                    <kbd className="kbd">&quot;&quot;</kbd>
                    <kbd className="kbd">&quot;Hi!&quot;</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Integer</td>
                  <td className="flex gap-1 text-xs">
                    <kbd className="kbd">7</kbd>
                    <kbd className="kbd">128</kbd>
                    <kbd className="kbd">-5</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Boolean</td>
                  <td className="flex gap-1 text-xs">
                    <kbd className="kbd">true</kbd>
                    <kbd className="kbd">false</kbd>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm">
            The above syntax can also acts as variable assignment if the
            variable has already been declared.
          </p>
        </div>
      </div>
      <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box my-3">
        <input type="checkbox" />
        <div className="collapse-title flex items-center text-sm py-2 min-h-fit">
          <span className="font-bold">Comparison</span>
        </div>
        <div className="collapse-content text-sm">
          <p>
            Comparison between values can be done using the comparison
            operators:{' '}
          </p>
          <div className="mx-auto my-3">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Equals</td>
                  <td className="flex gap-1 text-xs">
                    <kbd className="kbd">==</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Not Equals</td>
                  <td className="flex gap-1 text-xs">
                    <kbd className="kbd">!=</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Less Than</td>
                  <td className="flex gap-1 text-xs">
                    <kbd className="kbd">&lt;</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Less Than Or Equals</td>
                  <td className="flex gap-1 text-xs">
                    <kbd className="kbd">&le;</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Greater Than</td>
                  <td className="flex gap-1 text-xs">
                    <kbd className="kbd">&gt;</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Greater Than Or Equals</td>
                  <td className="flex gap-1 text-xs">
                    <kbd className="kbd">&ge;</kbd>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <br />
            Comparison can then be done using the regular infix notation.
            <br />
            <br /> Examples:
          </p>
          <div className="my-2 text-xs flex gap-1">
            <kbd className="kbd">variable1</kbd>
            <kbd className="kbd">==</kbd>
            <kbd className="kbd">variable2</kbd>
          </div>
          <div className="my-2 text-xs flex gap-1">
            <kbd className="kbd">5</kbd>
            <kbd className="kbd">&lt;</kbd>
            <kbd className="kbd">6</kbd>
          </div>
          <div className="my-2 text-xs flex gap-1">
            <kbd className="kbd">variable2</kbd>
            <kbd className="kbd">&ge;</kbd>
            <kbd className="kbd">10</kbd>
          </div>
        </div>
      </div>
      <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box my-3">
        <input type="checkbox" />
        <div className="collapse-title flex items-center text-sm py-2 min-h-fit">
          <span className="font-bold">Arithmetic Operations</span>
        </div>
        <div className="collapse-content text-sm">
          <p>The following arithmetic operators are supported:</p>
          <div className="mx-auto my-3">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Sign</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>+</td>
                  <td>Addition</td>
                </tr>
                <tr>
                  <td>-</td>
                  <td>Subtraction</td>
                </tr>
                <tr>
                  <td>*</td>
                  <td>Multiplication</td>
                </tr>
                <tr>
                  <td>/</td>
                  <td>Division</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <br />
            Arithmetic operations can then be done using the regular infix
            notation.
            <br />
            <br /> Examples:
          </p>
          <div className="my-2 flex gap-1 text-xs">
            <kbd className="kbd">2</kbd>
            <kbd className="kbd">+</kbd>
            <kbd className="kbd">5</kbd>
          </div>
          <div className="my-2 flex gap-1 text-xs">
            <kbd className="kbd">variableName</kbd>
            <kbd className="kbd">-</kbd>
            <kbd className="kbd">5</kbd>
          </div>
          <div className="my-2 flex gap-1 text-xs">
            <kbd className="kbd">variable1</kbd>
            <kbd className="kbd">*</kbd>
            <kbd className="kbd">variable2</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

type SettingsModalInputs = {
  title: string;
  isPrivate: boolean;
  description: string;
};

type SettingsModalProps = {
  modalId: string;
  workspaceData: WorkspaceEntity;
  onCancel: () => void;
  onSave: (args: SettingsModalInputs) => void | Promise<void>;
};

const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { modalId, workspaceData, onCancel, onSave } = props;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SettingsModalInputs>({
    mode: 'onChange',
    defaultValues: {
      title: workspaceData.title,
      description: workspaceData.description,
      isPrivate: workspaceData.visibility === WorkspaceVisibility.PRIVATE,
    },
  });

  return (
    <div className="modal" id={modalId}>
      <div className="modal-box relative">
        <label
          htmlFor={modalId}
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onCancel}
        >
          ✕
        </label>
        <h3 className="text-lg font-bold">Workspace Settings</h3>
        <form className="my-2 text-sm w-full" onSubmit={handleSubmit(onSave)}>
          <div>
            <label className="label">
              <span className="label-text">Title: </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="My New Workspace"
              {...register('title', { required: true })}
            />
            {errors.title?.type === 'required' ? (
              <label className="label">
                <span className="label-text-alt text-red-500">
                  Title is required.
                </span>
              </label>
            ) : null}
          </div>
          <div className="my-1"></div>
          <div>
            <label className="label">
              <span className="label-text">Description: </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="This workspace is awesome"
              {...register('description')}
            ></textarea>
          </div>
          <div className="w-fit">
            <label className="label cursor-pointer">
              <span className="label-text mr-3">Private: </span>
              <input
                type="checkbox"
                className="toggle"
                placeholder="My New Workspace"
                {...register('isPrivate')}
              />
            </label>
          </div>
          <div className="modal-action">
            <label
              htmlFor={modalId}
              className="btn btn-outline"
              onClick={onCancel}
            >
              Cancel
            </label>
            <button className="btn">Save</button>
          </div>
        </form>
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
            No
          </label>
          <label htmlFor={modalId} className="btn" onClick={onConfirm}>
            Yes
          </label>
        </div>
      </div>
    </div>
  );
};
