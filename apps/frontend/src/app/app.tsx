import React, { useEffect, useReducer, useRef, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage as StageClass } from 'konva/lib/Stage';
import { Stage, Layer } from 'react-konva';
import { Vector2d } from 'konva/lib/types';
import { ToggleAnimationBtn } from './components/play-animation.btn';
import { EnvironmentPanel } from './components/environtment-panel';
import { INITIAL_NODES } from './data';
import { NodesContext } from './contexts/nodes.context';
import { nodesReducer } from './reducers/nodes.reducer';
import {
  ConditionalNodeNextNodes,
  Coordinate,
  FlowChartNode,
  NodeActions,
  NodeTypes,
} from './types';
import { AddNodeBtn } from './components/add-node.btn';
import { SelectNodePopover } from './components/select-node.popover';
import { ToastContainer } from 'react-toastify';
import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';
import { nodeTypeToNode } from './utils';
import { ControlPanel } from './components/control-panel';
import { Share } from 'tabler-icons-react';
import { NewEnvironmentPopover } from './components/new-env-popover';
import { AppStateProvider } from './contexts/app-state.context';
import { EnvironmentContextProvider } from './contexts/environment.context';

const SCALE_BY = 1.2;

const Toast = styled(ToastContainer)`
  .Toastify__toast-body {
    color: black;
    font-size: 0.9rem;
    font-family: sans-serif;
  }
`;

const App = () => {
  const stageRef = useRef<StageClass | null>(null);
  const animationRef = useRef<unknown>(null);
  const curNodeIdx = useRef<number>(0);

  const [nodes, nodesDispatch] = useReducer(nodesReducer, INITIAL_NODES);
  const [animating, setAnimation] = useState(false);
  const [selectNodePopover, setSelectNodePopover] = useState<
    Coordinate & { onNodeSelect: (nodeType: NodeTypes) => void }
  >();

  const [newEnvPopover, setNewEnvPopover] = useState<
    Coordinate & { callerIdx: number }
  >();
  const [environment, setEnvironment] = useState<
    Record<string, number> | undefined
  >();

  useEffect(() => {
    if (!animating) {
      clearInterval(animationRef.current as NodeJS.Timer);
      return;
    }

    animationRef.current = setInterval(() => {
      if (curNodeIdx.current === undefined) {
        clearInterval(animationRef.current as NodeJS.Timer);
        setAnimation(!animating);
        return;
      }

      nodesDispatch({
        type: NodeActions.ACTIVATE,
        atIdx: curNodeIdx.current,
      });

      const curNode = nodes[curNodeIdx.current];
      const nextNodeIdx = curNode.nextIdx ?? curNode.nextIdxIfTrue;

      if (nextNodeIdx === undefined) {
        clearInterval(animationRef.current as NodeJS.Timer);
        setAnimation(!animating);
      } else {
        curNodeIdx.current = nextNodeIdx;
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating]);

  function zoomStage(event: KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();
    if (stageRef.current !== null) {
      const stage = stageRef.current;
      const oldScale = stage.scaleX();
      const { x: pointerX, y: pointerY } =
        stage.getPointerPosition() as Vector2d;
      const mousePointTo = {
        x: (pointerX - stage.x()) / oldScale,
        y: (pointerY - stage.y()) / oldScale,
      };
      const newScale =
        event.evt.deltaY > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;
      stage.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointerX - mousePointTo.x * newScale,
        y: pointerY - mousePointTo.y * newScale,
      };

      stage.position(newPos);
      stage.batchDraw();
    }
  }

  return (
    <AppStateProvider
      value={{
        newVarPopover: {
          position: newEnvPopover,
          setNewVarPopover: setNewEnvPopover,
        },
      }}
    >
      <EnvironmentContextProvider value={{ environment, setEnvironment }}>
        <NodesContext.Provider value={{ nodes, nodesDispatch }}>
          <ControlPanel>
            <ToggleAnimationBtn
              isAnimationRunning={animating}
              onClick={() => setAnimation(!animating)}
            />
            <Share size={15} />
          </ControlPanel>
          <Stage
            draggable
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            onWheel={zoomStage}
          >
            <Layer>
              {nodes.map((node, idx) => {
                let next: FlowChartNode | ConditionalNodeNextNodes | undefined =
                  undefined;
                if (node.nextIdx) {
                  next = nodes[node.nextIdx];
                } else if (node.nextIdxIfTrue && node.nextIdxIfFalse) {
                  next = {
                    true: nodes[node.nextIdxIfTrue],
                    false: nodes[node.nextIdxIfFalse],
                  };
                }

                const addNewNodeAtIdx = (nodeType: NodeTypes) => {
                  nodesDispatch({
                    type: NodeActions.ADD_NEW,
                    atIdx: idx + 1,
                    nodeType: nodeType,
                  });
                  setSelectNodePopover(undefined);
                };

                const AddNewNodeBtn = (
                  <AddNodeBtn
                    x={node.x + node.width / 2}
                    y={node.y + node.height}
                    onClick={() => {
                      setSelectNodePopover({
                        x: node.x,
                        y: node.y,
                        onNodeSelect: addNewNodeAtIdx,
                      });
                    }}
                  />
                );

                return nodeTypeToNode({
                  node,
                  addNewNodeBtn: AddNewNodeBtn,
                  key: idx,
                  nextNode: next,
                  onClick: () => {
                    setNewEnvPopover({ x: node.x, y: node.y, callerIdx: idx });
                  },
                });
              })}
            </Layer>
            <Layer name="top-layer">
              {selectNodePopover !== undefined ? (
                <SelectNodePopover
                  x={selectNodePopover.x - 10}
                  y={selectNodePopover.y - 10}
                  onSelect={selectNodePopover.onNodeSelect}
                  onCancel={() => setSelectNodePopover(undefined)}
                />
              ) : null}
            </Layer>
          </Stage>
          <EnvironmentPanel />
          {newEnvPopover ? (
            <NewEnvironmentPopover
              x={newEnvPopover.x}
              y={newEnvPopover.y}
              callerIdx={newEnvPopover.callerIdx}
            />
          ) : null}
          <Toast position="bottom-center" theme="light" />
        </NodesContext.Provider>
      </EnvironmentContextProvider>
    </AppStateProvider>
  );
};

export default App;
