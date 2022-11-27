import styled from 'styled-components';
import { X as XIcon } from 'tabler-icons-react';
import Draggable from 'react-draggable';
import { useAppState } from '../contexts/app-state.context';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useEnvironmentContext } from '../contexts/environment.context';
import { useNodesContext } from '../hooks/use-node-context.hook';
import { NodeActions, NodeTypes } from '../common/types';

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

const VariableInput = styled.textarea`
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

export const EnvironmentPopover: React.FC<Props> = (props) => {
  const { x, y, callerIdx } = props;
  const appState = useAppState();
  const environmentContext = useEnvironmentContext();
  const nodesContext = useNodesContext();
  const callerType = nodesContext?.nodes[callerIdx].type;

  const [textAreaVal, setTextAreaVal] = useState('');

  const onPanelClose = () => {
    if (!appState || appState?.newVarPopover === null) return;
    appState.newVarPopover.setNewVarPopover(undefined);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (textAreaVal === '') {
      toast('Cannot submit empty code.', { type: 'error' });
      return;
    }

    if (!environmentContext) {
      toast("There's an error, please try again later.", { type: 'error' });
      return;
    }

    if (textAreaVal.includes('==') && textAreaVal.length > 3) {
      if (callerType !== NodeTypes.IF) {
        toast('Cannot do equality checking in a non-if node.', {
          type: 'error',
        });
        return;
      }

      nodesContext?.nodesDispatch({
        type: NodeActions.CHANGE_CONTENT,
        atIdx: callerIdx,
        content: textAreaVal,
      });

      appState?.newVarPopover.setNewVarPopover(undefined);
    } else if (textAreaVal.includes('=') && textAreaVal.length > 3) {
      if (callerType === NodeTypes.IF) {
        toast('Cannot do variable assignment on an if node.', {
          type: 'error',
        });
        return;
      }

      const [newVarName, newVarVal] = textAreaVal
        .split('=')
        .map((str) => str.trim());

      nodesContext?.nodesDispatch({
        type: NodeActions.CHANGE_CONTENT,
        atIdx: callerIdx,
        content: `${newVarName} = ${newVarVal}`,
      });

      appState?.newVarPopover.setNewVarPopover(undefined);
    } else if (textAreaVal.includes('++')) {
      const [varName] = textAreaVal.split('++');

      nodesContext?.nodesDispatch({
        type: NodeActions.CHANGE_CONTENT,
        atIdx: callerIdx,
        content: `${varName}++`,
      });

      appState?.newVarPopover.setNewVarPopover(undefined);
    } else if (textAreaVal.includes('--')) {
      const [varName] = textAreaVal.split('--');

      nodesContext?.nodesDispatch({
        type: NodeActions.CHANGE_CONTENT,
        atIdx: callerIdx,
        content: `${varName}--`,
      });

      appState?.newVarPopover.setNewVarPopover(undefined);
    } else {
      toast(`Can't recognize this operation.`, { type: 'error' });
      return;
    }
  };

  return (
    <Draggable>
      <Container x={x} y={y}>
        <PanelTitle>
          Environment Variable <XIcon size={19} onClick={onPanelClose} />
        </PanelTitle>
        <PanelContentContainer>
          <Form onSubmit={onSubmit}>
            <VariableInput
              placeholder="testing = 3"
              value={textAreaVal}
              onChange={(e) => setTextAreaVal(e.target.value)}
            ></VariableInput>
            <SubmitBtn type="submit" value="Save" />
          </Form>
        </PanelContentContainer>
      </Container>
    </Draggable>
  );
};
