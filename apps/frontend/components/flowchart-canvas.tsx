import React, { useRef, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage as StageClass } from 'konva/lib/Stage';
import { Stage, Layer } from 'react-konva';
import { Vector2d } from 'konva/lib/types';
import { useFlowchartStore } from '../contexts/nodes.context';
import {
  ConditionalNodeNextNodes,
  Coordinate,
  FlowChartNode,
  NodeActions,
  NodeTypes,
} from '../common/types';
import { AddNodeBtn } from './add-node.btn';
import { SelectNodePopover } from './select-node.popover';
import { nodeTypeToNode } from '../common/konva-utils';
import { EnvironmentPopover } from './env-popover';
import { NodeContextMenu } from './node-context-menu';
import { useInterval } from 'usehooks-ts';

// Constant used to determine how much to zoom-in and out on wheel movement
const SCALE_BY = 1.2;

// Constant used to determine how long to activate a node during animation
const ANIMATION_PAUSE = 1000;

export const FlowchartCanvas: React.FC = () => {
  const stageRef = useRef<StageClass | null>(null);

  // Currently to-be-actived node
  const curNodeIdx = useRef<number>(0);
  // Previously activated node
  const prevNodeIdx = useRef<number>(-1);

  const nodes = useFlowchartStore((s) => s.nodes);
  const isAnimationPlaying = useFlowchartStore((s) => s.isAnimationPlaying);
  const toggleAnimation = useFlowchartStore((s) => s.toggleAnimation);
  const nodesDispatch = useFlowchartStore((s) => s.dispatchNodeAction);

  const [selectNodePopover, setSelectNodePopover] = useState<
    Coordinate & { onNodeSelect: (nodeType: NodeTypes) => void }
  >();

  const [newEnvPopover, setNewEnvPopover] = useState<
    Coordinate & { callerIdx: number }
  >();

  const [contextMenu, setContextMenu] = useState<
    Coordinate & { callerIdx: number; callerType: NodeTypes }
  >();

  // Function to play the animation
  useInterval(
    () => {
      const curNode = nodes[curNodeIdx.current];
      const nextNodeIdx = curNode.nextIdx ?? curNode.nextIdxIfTrue;

      nodesDispatch({
        type: NodeActions.ACTIVATE,
        atIdx: curNodeIdx.current,
      });

      if (prevNodeIdx.current >= 0) {
        nodesDispatch({
          type: NodeActions.DEACTIVATE,
          atIdx: prevNodeIdx.current,
        });
      }

      if (nextNodeIdx === null) {
        setTimeout(() => {
          nodesDispatch({
            type: NodeActions.DEACTIVATE,
            atIdx: curNodeIdx.current,
          });
        }, ANIMATION_PAUSE);

        toggleAnimation();
      } else {
        prevNodeIdx.current = curNodeIdx.current;
        curNodeIdx.current = nextNodeIdx;
      }
    },
    isAnimationPlaying ? ANIMATION_PAUSE : null
  );

  // Handle zooom-in and zoom-out of the flowchart canvas
  function zoomStage(event: KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();
    if (stageRef.current === null) return;

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const { x: pointerX, y: pointerY } = stage.getPointerPosition() as Vector2d;
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

  return (
    <>
      <Stage
        draggable
        ref={stageRef}
        className="absolute right-0"
        onWheel={zoomStage}
        width={window.innerWidth - (25 / 100) * window.innerWidth}
        height={window.innerHeight}
      >
        <Layer>
          {nodes &&
            nodes.map((node, idx) => {
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

              const isTerminalNode =
                node.type === NodeTypes.START || node.type === NodeTypes.END;

              return nodeTypeToNode({
                node,
                addNewNodeBtn: AddNewNodeBtn,
                key: idx,
                nextNode: next,
                onClick: () => {
                  if (isTerminalNode) return;

                  setNewEnvPopover({
                    x: node.x,
                    y: node.y,
                    callerIdx: idx,
                  });
                },
                onRightClick: () => {
                  setContextMenu({
                    x: node.x,
                    y: node.y,
                    callerIdx: idx,
                    callerType: node.type,
                  });
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

      {newEnvPopover ? (
        <EnvironmentPopover
          x={newEnvPopover.x}
          y={newEnvPopover.y}
          callerIdx={newEnvPopover.callerIdx}
        />
      ) : null}

      {contextMenu ? (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          callerIdx={contextMenu.callerIdx}
          callerType={contextMenu.callerType}
        />
      ) : null}
    </>
  );
};
