import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Plus as PlusIcon, UserCircle } from 'tabler-icons-react';
import { useUnauthorizedProtection } from '../../hooks/use-unauthorized-protection.hook';
import useSWR from 'swr';
import { useUserId } from '../../hooks/use-user-id.hook';
import { swrFetcher } from '../../common/utils';
import { WorkspaceEntity } from '@dializer/types';
import Router from 'next/router';
import { Oval } from 'react-loader-spinner';
import { useState } from 'react';

export default function Index() {
  useUnauthorizedProtection();
  const userId = useUserId();
  const [queryParams, setQueryParams] = useState('');
  const { data, isLoading, error } = useSWR<WorkspaceEntity[]>(
    userId
      ? `http://localhost:3333/api/users/${userId}/workspaces?${queryParams}`
      : null,
    swrFetcher
  );

  const createNewWorkspace = async () => {
    const response = await fetch('http://localhost:3333/api/workspaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      console.log(response.text());
      alert('Failed creating new workspace, try again in a few minutes.');
      return;
    }

    const { id: newWorkspaceId } = await response.json();
    Router.replace(`/workspaces/${newWorkspaceId}`);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    Router.replace('/sign-in');
  };

  if (error) return <h1>There&apos;s an error occuring</h1>;

  return (
    <>
      <Head>
        <title>Workspaces | Dializer</title>
      </Head>

      <div className="navbar bg-base-100 px-5 shadow-sm">
        <h1 className="text-lg tracking-wider flex-1">Workspaces</h1>
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
                  <a>Profile</a>
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
              return (
                <Link key={idx} href={`/workspaces/${workspace.id}`}>
                  <div className="border border-base-300 hover:border-base-100 hover:bg-base-300 cursor-pointer px-5 py-3 box-border">
                    <h2 className="font-bold">{workspace.title}</h2>
                    <p>
                      Last updated:{' '}
                      {new Date(workspace.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </Link>
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
