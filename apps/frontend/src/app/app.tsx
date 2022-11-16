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
  FlowChartNode,
  NodeActions,
  NodeTypes,
} from './types';
import { StartEndNode } from './components/start-end.node';
import { ProcessNode } from './components/process.node';
import { InputNode } from './components/input.node';
import { OutputNode } from './components/output.node';
import { IfNode } from './components/if.node';

const SCALE_BY = 1.2;

const App = () => {
  const stageRef = useRef<StageClass | null>(null);
  const animationRef = useRef<unknown>(null);
  const curNodeIdx = useRef<number>(0);

  const [nodes, nodesDispatch] = useReducer(nodesReducer, INITIAL_NODES);
  const [animating, setAnimation] = useState(false);

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
        idx: curNodeIdx.current,
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
    <NodesContext.Provider value={{ nodes, nodesDispatch }}>
      <ToggleAnimationBtn
        isAnimationRunning={animating}
        onClick={() => setAnimation(!animating)}
      />
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        draggable
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

            const onAddNewNode = () => {
              nodesDispatch({
                type: NodeActions.ADD_NEW,
                idx: idx + 1,
                nodeType: NodeTypes.PROCESS,
              });
            };

            switch (node.type) {
              case NodeTypes.START:
              case NodeTypes.END:
                return (
                  <StartEndNode
                    key={idx}
                    x={node.x}
                    y={node.y}
                    isActive={node.active}
                    type={node.type}
                    next={next as FlowChartNode}
                    onAddNewNode={onAddNewNode}
                  />
                );

              case NodeTypes.PROCESS:
                return (
                  <ProcessNode
                    key={idx}
                    x={node.x}
                    y={node.y}
                    isActive={node.active}
                    next={next as FlowChartNode}
                    onAddNewNode={onAddNewNode}
                  />
                );

              case NodeTypes.INPUT:
                return (
                  <InputNode
                    key={idx}
                    x={node.x}
                    y={node.y}
                    isActive={node.active}
                    next={next as FlowChartNode}
                    onAddNewNode={onAddNewNode}
                  />
                );

              case NodeTypes.OUTPUT:
                return (
                  <OutputNode
                    key={idx}
                    x={node.x}
                    y={node.y}
                    isActive={node.active}
                    next={next as FlowChartNode}
                    onAddNewNode={onAddNewNode}
                  />
                );

              case NodeTypes.IF:
                return (
                  <IfNode
                    key={idx}
                    x={node.x}
                    y={node.y}
                    isActive={node.active}
                    next={next as ConditionalNodeNextNodes}
                    onAddNewNode={onAddNewNode}
                  />
                );

              default:
                return null;
            }
          })}
        </Layer>
        <Layer name="top-layer" />
      </Stage>
      <EnvironmentPanel />
    </NodesContext.Provider>
  );
};

export default App;
