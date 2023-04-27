import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Plus as PlusIcon, Trash, UserCircle } from 'tabler-icons-react';
import { useUnauthorizedProtection } from '../../hooks/use-unauthorized-protection.hook';
import useSWR from 'swr';
import { useUserId } from '../../hooks/use-user-id.hook';
import { swrFetcher } from '../../common/utils';
import { WorkspaceEntity } from '@dializer/types';
import Router from 'next/router';
import { Oval } from 'react-loader-spinner';
import { useState } from 'react';
import { LocalStorageItems } from 'apps/frontend/common/types';
import { toast } from 'react-toastify';

export default function Index() {
  useUnauthorizedProtection();
  const userId = useUserId();
  const [queryParams, setQueryParams] = useState('');
  const { data, isLoading, error, mutate } = useSWR<WorkspaceEntity[]>(
    userId
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/workspaces?${queryParams}`
      : null,
    swrFetcher
  );

  const createNewWorkspace = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/workspaces`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );

    if (!response.ok) {
      console.log(response.text());
      alert('Failed creating new workspace, try again in a few minutes.');
      return;
    }

    const { id: newWorkspaceId } = await response.json();
    Router.replace(`/workspaces/${newWorkspaceId}`);
  };

  const logout = () => {
    localStorage.removeItem(LocalStorageItems.ACCESS_TOKEN);
    Router.replace('/sign-in');
  };

  if (error) return <h1>There&apos;s an error occuring</h1>;

  return (
    <>
      <Head>
        <title>Workspaces | Dializer</title>
      </Head>

      <div className="navbar bg-base-100 px-5 shadow-sm">
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
          <div className="form-control mx-3">
            <input
              type="text"
              placeholder="Search workspace"
              className="input input-bordered input-sm w-64 transition-all"
              onChange={(e) => setQueryParams(`search=${e.target.value}`)}
            />
          </div>

          <button
            className="group btn btn-ghost btn-circle hover:bg-primary"
            onClick={createNewWorkspace}
          >
            <PlusIcon
              className="text-black group-hover:text-base-100 transition-all"
              size={22}
            />
          </button>

          <div className="mr-1"></div>

          <button className="rounded-full group hover:bg-base-200 transition-all">
            <div className="dropdown dropdown-end p-0">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="rounded-full">
                  <UserCircle className="transition-all" size={22} />
                </div>
              </label>

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
            </div>
          </button>
        </div>
      </div>

      <div className="w-full p-10">
        {isLoading ? (
          <Oval
            height={80}
            width={80}
            color="#570df8"
            secondaryColor="#e5e6e6"
            wrapperClass="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-3 gap-5">
            {data.map((workspace, idx) => {
              const handleWorkspaceDelete = async (e) => {
                toast('Deleting 1 workspace...', {
                  type: 'info',
                  autoClose: 1000,
                });

                try {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspace.id}`,
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

                  toast.dismiss();
                  toast('1 workspace deleted successfully.', {
                    type: 'success',
                  });
                  mutate();
                } catch (e) {
                  const err = e as Error;
                  toast(err.message, { type: 'error' });
                }
              };

              return (
                <div className="border border-base-300 hover:border-base-100 hover:bg-base-300 cursor-pointer px-5 py-3 box-border">
                  <div className="flex justify-between items-center">
                    <Link key={idx} href={`/workspaces/${workspace.id}`}>
                      <h2 className="font-bold">{workspace.title}</h2>
                    </Link>
                    <Trash
                      size={18}
                      cursor={'pointer'}
                      className="stroke-red-400 hover:stroke-red-600 hover:scale-110 active:scale-100 transition"
                      onClick={handleWorkspaceDelete}
                    />
                  </div>
                  <p>
                    Last updated:{' '}
                    {new Date(workspace.updatedAt).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/not-found.svg"
              alt="No data decorative image."
              width={170}
              height={170}
              priority={true}
              style={{ margin: 15 }}
            />
            <p className="text-sm text-center leading-relaxed text-base-content my-5 font-sans">
              Could not find any workspaces. <br /> Create one by clicking the
              plus icon above.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
