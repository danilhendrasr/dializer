import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Router from 'next/router';
import { Plus as PlusIcon, Trash, UserCircle } from 'tabler-icons-react';
import { useUnauthorizedProtection } from '../../hooks/use-unauthorized-protection.hook';
import { useUserId } from '../../hooks/use-user-id.hook';
import { Oval } from 'react-loader-spinner';
import { useEffect, useState } from 'react';
import { LocalStorageItems } from '../../common/types';
import { toast } from 'react-toastify';
import { WorkspaceService } from '../../services/workspace';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkspaceEntity, WorkspaceVisibility } from '@dializer/types';
import { formatDistance } from 'date-fns';
import { useDebounce } from 'use-debounce';
import { useForm } from 'react-hook-form';
import { MotionProps, Variants, motion } from 'framer-motion';
import { STATUS, Step } from 'react-joyride';
import dynamic from 'next/dynamic';
import NextError from 'next/error';

const tourSteps: Step[] = [
  {
    content: (
      <div className="flex items-center flex-col">
        <Image
          src={'/dializer-logo.svg'}
          alt="Dializer logo"
          width={70}
          height={70}
        />
        <h2 className="text-xl font-bold my-2">Welcome to Dializer!</h2>
        <p>Let&apos;s start our journey!</p>
      </div>
    ),
    locale: { skip: <strong aria-label="skip">SKIP</strong> },
    placement: 'center',
    target: 'body',
  },
  {
    target: '.create-workspace-button',
    content: 'You can create a new workspace by clicking this icon.',
    disableBeacon: true,
  },
  {
    target: '.profile-button',
    content: 'You can edit your profile or logout here.',
    disableBeacon: true,
  },
  {
    target: '.search-bar',
    content: 'Or you can search your workspaces here.',
    disableBeacon: true,
  },
];

const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

export default function UserDashboard() {
  useUnauthorizedProtection();
  const userId = useUserId();
  const queryClient = useQueryClient();

  const [runTour, setRunTour] = useState(false);
  const [queryParams, setQueryParams] = useState('');
  const [queryParamsValue] = useDebounce(queryParams, 500);
  const { data, isLoading, error } = useQuery({
    queryKey: ['workspaces', userId, queryParamsValue],
    queryFn: async () => {
      return await WorkspaceService.getInstance().getByUserId(
        userId,
        queryParams
      );
    },
    enabled: userId !== undefined,
  });

  const createNewWorkspace = async (data: WorkspaceCreationInputs) => {
    try {
      const { id } = await WorkspaceService.getInstance().create({
        ...data,
        visibility: data.isPrivate
          ? WorkspaceVisibility.PRIVATE
          : WorkspaceVisibility.PUBLIC,
      });
      Router.replace(`/workspaces/${id}`);
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  const handleWorkspaceDelete = async (id: string) => {
    toast.info('Deleting 1 workspace...', { autoClose: 1000 });

    try {
      await WorkspaceService.getInstance().deleteById(id);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.dismiss();
      toast.success('1 workspace deleted successfully.');
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem(LocalStorageItems.ACCESS_TOKEN);
    Router.replace('/sign-in');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dashboardTourPassed = localStorage.getItem(
      LocalStorageItems.DASHBOARD_TOUR_PASSED
    );

    if (!dashboardTourPassed) {
      setTimeout(() => {
        setRunTour(true);
      }, 500);
    }
  }, []);

  if (error) return <NextError statusCode={500} />;

  return (
    <>
      <Head>
        <title>Workspaces | Dializer</title>
      </Head>

      {/* Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0, transition: { duration: 0.5 } }}
        className="navbar bg-base-100 px-5 shadow-sm"
      >
        <Joyride
          run={runTour}
          steps={tourSteps}
          continuous={true}
          callback={({ status }) => {
            if (status === STATUS.FINISHED) {
              localStorage.setItem(
                LocalStorageItems.DASHBOARD_TOUR_PASSED,
                'true'
              );
            }
          }}
          styles={{
            options: {
              primaryColor: '#570df8',
            },
          }}
        />
        <div className="flex-1">
          <Image
            src={'/dializer-logo.svg'}
            alt="Dializer logo"
            width={40}
            height={40}
          />
          <div className="mx-2"></div>
          <h1 className="text-lg tracking-wider">Workspaces</h1>
        </div>

        <div>
          {/* Search bar */}
          <div className="form-control mx-3 search-bar">
            <input
              type="text"
              placeholder="Search workspace"
              className="input input-bordered input-sm w-64 transition-all"
              onChange={(e) => setQueryParams(`search=${e.target.value}`)}
            />
          </div>
          {/* End of search bar */}

          {/* New workspace button */}
          <label
            htmlFor="my-modal-3"
            className="group btn btn-ghost btn-circle hover:bg-primary create-workspace-button"
            title="Create new workspace"
          >
            <PlusIcon
              className="text-black group-hover:text-base-100 transition-all"
              size={22}
            />
          </label>
          {/* End of new workspace button */}

          <div className="mr-1"></div>

          <button className="rounded-full group hover:bg-base-200 transition-all">
            <div className="dropdown dropdown-end p-0">
              {/* Profile button */}
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar profile-button"
                title="User profile"
              >
                <div className="rounded-full">
                  <UserCircle className="transition-all" size={22} />
                </div>
              </label>
              {/* End of profile button */}

              {/* Profile click options */}
              <ul
                tabIndex={0}
                className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/profile">Profile</Link>
                </li>
                <li onClick={logout}>
                  <a>Logout</a>
                </li>
              </ul>
              {/* End of profile click options */}
            </div>
          </button>
        </div>
      </motion.div>
      {/* End of header */}

      {isLoading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Oval
            height={60}
            width={60}
            color="#570df8"
            secondaryColor="#e5e6e6"
            wrapperClass="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </motion.div>
      ) : !data || data.length === 0 ? (
        <WorkspaceNotFoundPlaceholder />
      ) : (
        <div className="w-full p-10">
          <motion.div
            className="grid grid-cols-3 gap-5"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                opacity: 1,
                transition: {
                  when: 'beforeChildren',
                  staggerChildren: 0.1,
                },
              },
              hidden: {
                opacity: 0,
                transition: {
                  when: 'afterChildren',
                },
              },
            }}
          >
            {data.map((workspace, idx) => {
              return (
                <WorkspaceItem
                  key={idx}
                  variants={{
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 24,
                      },
                    },
                    hidden: {
                      opacity: 0,
                      y: 20,
                      transition: { duration: 0.2 },
                    },
                  }}
                  workspaceData={workspace}
                  onDelete={() => handleWorkspaceDelete(workspace.id)}
                />
              );
            })}
          </motion.div>
        </div>
      )}

      <WorkspaceCreationModal onSave={createNewWorkspace} />
      {/* Put this part before </body> tag */}
    </>
  );
}

type WorkspaceCreationInputs = {
  title: string;
  isPrivate: boolean;
  description: string;
};

type WorkspaceCreationModalProps = {
  onSave: (args: WorkspaceCreationInputs) => Promise<void>;
};

const WorkspaceCreationModal: React.FC<WorkspaceCreationModalProps> = ({
  onSave,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<WorkspaceCreationInputs>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      isPrivate: true,
    },
  });

  return (
    <>
      <input type="checkbox" id="my-modal-3" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <label
            htmlFor="my-modal-3"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </label>
          <h3 className="text-lg font-bold">Create new workspace</h3>
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
              <button className="btn mt-4 mb-1">Create</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

type WorkspaceItemProps = {
  workspaceData: WorkspaceEntity;
  onDelete: () => void;
} & MotionProps;

const WorkspaceItem: React.FC<WorkspaceItemProps> = (props) => {
  const {
    workspaceData: workspace,
    onDelete: handleDelete,
    ...motionProps
  } = props;

  return (
    <motion.div
      className="border border-base-300 hover:border-base-100 hover:bg-base-300 cursor-pointer px-5 py-3 box-border"
      {...motionProps}
    >
      <Link href={`/workspaces/${workspace.id}`}>
        <div className="flex justify-between items-center border-b mb-2">
          <h2 className="font-bold py-2">{workspace.title}</h2>
          <object title="Delete workspace">
            <Trash
              size={18}
              cursor={'pointer'}
              className="stroke-red-400 hover:stroke-red-600 hover:scale-110 active:scale-100 transition"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            />
          </object>
        </div>
        {workspace.description ? (
          <p className="text-sm text-slate-500 my-1">
            {workspace.description.length > 60
              ? workspace.description.substring(0, 60) + '...'
              : workspace.description}
          </p>
        ) : null}
        <p className="text-xs text-slate-400">
          Edited {formatDistance(new Date(), new Date(workspace.updatedAt))} ago
        </p>
      </Link>
    </motion.div>
  );
};

const WorkspaceNotFoundPlaceholder: React.FC = () => {
  const variant: Variants = {
    hidden: { opacity: 0, transform: 'translate(-50%, -50%) scale(0.95)' },
    visible: {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)',
      transition: { duration: 0.8 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variant}
      className="flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <Image
        src="/not-found.svg"
        alt="No data decorative image."
        width={170}
        height={170}
        priority={true}
        style={{ margin: 15 }}
      />
      <motion.p
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        className="text-sm text-center leading-relaxed text-base-content my-5 font-sans"
      >
        Could not find any workspaces. <br /> Create one by clicking the plus
        icon above.
      </motion.p>
    </motion.div>
  );
};
