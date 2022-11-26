import styled from 'styled-components';
import { X as XIcon } from 'tabler-icons-react';
import Draggable from 'react-draggable';
import { useAppState } from '../contexts/app-state.context';
import React from 'react';
import { useNodesContext } from '../hooks/use-node-context.hook';
import { NodeActions, NodeTypes } from '../types';

const Container = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  transform: translateY(-50%);
  height: 200px;
  width: 300px;
  border: 1px solid lightgrey;
  border-radius: 8px;
  background-color: white;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  box-sizing: border-box;
  overflow: hidden;
`;

const PanelTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
  padding: 10px;
  justify-content: space-between;
  font-family: sans-serif;
  font-weight: 600;
  font-size: 0.8em;
  letter-spacing: 1px;
`;

const PanelContentContainer = styled.div`
  padding: 10px;
  display: flex;
  flex: 1;
  flex-direction: row;
`;

const Btn = styled.button`
  width: 100%;
  display: block;
  padding: 10px;
  border-radius: 8px;
  background-color: lightgrey;
  border: 1px solid lightgrey;
  box-sizing: border-box;
`;

type Props = {
  x: number;
  y: number;
  callerIdx: number;
  callerType: NodeTypes;
};

export const NodeContextMenu: React.FC<Props> = (props) => {
  const { x, y, callerIdx } = props;
  const appState = useAppState();
  const nodesContext = useNodesContext();

  const handleClose = () => {
    if (!appState || appState?.contextMenu === null) return;
    appState.contextMenu.setContextMenu(undefined);
  };

  const handleOnDelete = () => {
    if (!nodesContext) return;
    nodesContext?.nodesDispatch({
      type: NodeActions.DELETE,
      atIdx: callerIdx,
    });
    appState?.contextMenu.setContextMenu(undefined);
  };

  return (
    <Draggable>
      <Container x={x} y={y}>
        <PanelTitle>
          This is a context menu <XIcon size={19} onClick={handleClose} />
        </PanelTitle>
        <PanelContentContainer>
          <Btn onClick={handleOnDelete}>Delete</Btn>
        </PanelContentContainer>
      </Container>
    </Draggable>
  );
};
