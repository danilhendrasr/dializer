import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { Plus as PlusIcon, UserCircle } from 'tabler-icons-react';
import { useUnauthorizedProtection } from '../../hooks/use-unauthorized-protection.hook';
import useSWR from 'swr';
import { useUserId } from '../../hooks/use-user-id.hook';
import { swrFetcher } from '../../common/utils';
import { WorkspaceEntity } from '@dializer/types';
import Router from 'next/router';

export default function Index() {
  useUnauthorizedProtection();
  const userId = useUserId();
  const { data, isLoading, error } = useSWR<WorkspaceEntity[]>(
    userId ? `http://localhost:3333/api/users/${userId}/workspaces` : null,
    swrFetcher
  );

  const createNewWorkspace = async () => {
    const response = await fetch('http://localhost:3333/api/workspaces', {
      method: 'POST',
    });

    if (!response.ok) {
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

      <div className="navbar bg-base-100 px-5 rounded-2xl shadow-md w-9/12 absolute left-1/2 top-5 -translate-x-1/2">
        <h1 className="text-lg tracking-wider flex-1">Workspaces</h1>
        <div>
          <button
            className="group btn btn-ghost btn-circle hover:bg-primary"
            onClick={createNewWorkspace}
          >
            <PlusIcon
              className="text-primary group-hover:text-base-100 transition-all"
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
                className="mt-1 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
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

      <div className="w-full h-full bg-base-200 px-10">
        {isLoading ? (
          <EmptyWorkspaceWrapper>
            <Image
              src="/no-data.svg"
              alt="No data decorative image."
              width={155}
              height={155}
              priority={true}
              style={{ margin: 15 }}
            />
            <NoWorkspaceText>You have no workspace.</NoWorkspaceText>
          </EmptyWorkspaceWrapper>
        ) : (
          data && (
            <WorkspacesWrapper>
              {data.map((workspace, idx) => {
                console.log('updated at', workspace.updatedAt);
                return (
                  <WorkspaceItem key={idx}>
                    <Link href={`/workspaces/${workspace.id}`}>
                      <h2>{workspace.title}</h2>
                    </Link>
                    <p>
                      Last updated:{' '}
                      {new Date(workspace.updatedAt).toDateString()}
                    </p>
                  </WorkspaceItem>
                );
              })}
            </WorkspacesWrapper>
          )
        )}
      </div>
    </>
  );
}

const EmptyWorkspaceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  box-sizing: border-box;
`;

const NoWorkspaceText = styled.p`
  font-family: sans-serif;
  color: grey;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
`;

const WorkspacesWrapper = styled.div`
  display: flex;
`;

const WorkspaceItem = styled.div`
  height: fit-content;
  width: 100%;
  border: 1px solid lightgrey;
  border-radius: 8px;
  margin: 10px;
  padding: 10px;

  &:hover {
    background-color: lightgrey;
  }

  a {
    text-decoration: none;
  }

  h2 {
    font-size: 0.9rem;
    color: black;
    margin: 0;
  }

  p {
    margin-bottom: 0;
    font-size: 0.7rem;
  }
`;
