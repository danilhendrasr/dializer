import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { Plus as PlusIcon } from 'tabler-icons-react';
import { v4 as uuidv4 } from 'uuid';
import { useRouteProtection } from '../../hooks/use-route-protection.hook';

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

export function Index() {
  useRouteProtection();
  const newWorkspaceId = uuidv4();

  return (
    <StyledPage>
      <Head>
        <title>Workspaces | Dializer</title>
      </Head>
      <TopContainer>
        <h1>Workspaces</h1>
        <Link href={`/workspaces/${newWorkspaceId}`}>
          <NewWorkspaceBtn>
            <PlusIcon size={18} />
          </NewWorkspaceBtn>
        </Link>
      </TopContainer>
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
    </StyledPage>
  );
}

export default Index;
