import styled from 'styled-components';
import { X as XIcon } from 'tabler-icons-react';
import Draggable from 'react-draggable';
import { useAppState } from '../contexts/app-state.context';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useEnvironmentContext } from '../contexts/environment.context';
import { useNodesContext } from '../hooks/use-node-context.hook';
import { NodeActions } from '../types';

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

const Form = styled.form`
  width: 100%;
  height: 100%;
`;

const VariableInput = styled.input`
  width: 100%;
  display: block;
  padding: 10px;
  margin: 5px 0;
  border-radius: 8px;
  border: 1px solid lightgrey;
  box-sizing: border-box;
`;

const SubmitBtn = styled.input`
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
};

export const NewEnvironmentPopover: React.FC<Props> = (props) => {
  const { x, y, callerIdx } = props;
  const appState = useAppState();
  const environmentContext = useEnvironmentContext();
  const nodesContext = useNodesContext();

  const [newVarName, setNewVarName] = useState('');
  const [newVarVal, setNewVarVal] = useState('');

  const onPanelClose = () => {
    if (!appState || appState?.newVarPopover === null) return;
    appState.newVarPopover.setNewVarPopover(undefined);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newVarName === '' || newVarVal === '') {
      toast('Please complete the form.', { type: 'error' });
      return;
    }

    if (!environmentContext) {
      toast("There's an error, please try again later.", { type: 'error' });
      return;
    }

    const newEnv = { ...environmentContext.environment };
    newEnv[newVarName] = parseInt(newVarVal);
    environmentContext.setEnvironment(newEnv);

    console.log('nodes context', nodesContext);
    nodesContext?.nodesDispatch({
      type: NodeActions.CHANGE_CONTENT,
      atIdx: callerIdx,
      content: `${newVarName} -> ${newVarVal}`,
    });

    toast(`Var "${newVarName}" with value: "${newVarVal}" created.`, {
      type: 'success',
    });
    appState?.newVarPopover.setNewVarPopover(undefined);
  };

  return (
    <Draggable>
      <Container x={x} y={y}>
        <PanelTitle>
          New variable <XIcon size={19} onClick={onPanelClose} />
        </PanelTitle>
        <PanelContentContainer>
          <Form onSubmit={onSubmit}>
            <VariableInput
              type="text"
              placeholder="Name"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
            />
            <VariableInput
              type="text"
              placeholder="Value"
              value={newVarVal}
              onChange={(e) => setNewVarVal(e.target.value)}
            />
            <SubmitBtn type="submit" value="Save" />
          </Form>
        </PanelContentContainer>
      </Container>
    </Draggable>
  );
};
