import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { Plus as PlusIcon } from 'tabler-icons-react';
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

  const handleNewWorkspaceBtn = async () => {
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

  if (error) return <h1>Error gan</h1>;

  return (
    <StyledPage>
      <Head>
        <title>Workspaces | Dializer</title>
      </Head>
      <TopContainer>
        <h1>Workspaces</h1>
        <NewWorkspaceBtn onClick={handleNewWorkspaceBtn}>
          <PlusIcon size={18} />
        </NewWorkspaceBtn>
      </TopContainer>
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
                    Last updated: {new Date(workspace.updatedAt).toDateString()}
                  </p>
                </WorkspaceItem>
              );
            })}
          </WorkspacesWrapper>
        )
      )}
    </StyledPage>
  );
}

const StyledPage = styled.div`
  position: absolute;
  width: 600px;
  height: 450px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: sans-serif;
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 10px 20px;
  width: 100%;
  margin-bottom: 15px;
`;

const NewWorkspaceBtn = styled.button`
  margin: 20px;
  border-radius: 8px;
  border: none;
  padding: 10px;
  transition: 0.2s all;
  align-self: flex-end;
  box-sizing: border-box;

  &:hover {
    background-color: lightgrey;
    transition: 0.2s all;
    cursor: pointer;
  }
`;

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
