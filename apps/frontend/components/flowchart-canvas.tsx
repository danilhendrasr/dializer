import React, { useRef, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage as StageClass } from 'konva/lib/Stage';
import { Stage, Layer } from 'react-konva';
import { Vector2d } from 'konva/lib/types';
import { useFlowchartStore } from '../stores/flowchart';
import {
  ConditionalNodeNextNodes,
  Coordinate,
  FlowChartNode,
  NodeActions,
  NodeTypes,
} from '../common/types';
import { AddNodeBtn } from './add-node.btn';
import { AddNodeModal } from './add-node-modal';
import { ExpressionModal as ExprModal } from './expression-modal';
import { ContextMenu } from './node-context-menu';
import { useInterval } from 'usehooks-ts';
import { StartEndNode } from './nodes/start-end-node';
import { ProcessNode } from './nodes/process-node';
import { InputNode } from './nodes/input-node';
import { OutputNode } from './nodes/output-node';
import { IfNode } from './nodes/if-node';

// Constant used to determine how much to zoom-in and out on wheel movement
const SCALE_BY = 1.2;

// Constant used to determine how long to activate a node during animation
const ANIMATION_PAUSE = 1000;

type AddNodeModalState =
  | (Coordinate & {
      // Function to call when a node type is selected
      onSelect: (nodeType: NodeTypes) => void;
    })
  | null;

type ExprModalState = (Coordinate & { callerIdx: number }) | null;

type ContextMenuState =
  | (Coordinate & {
      callerIdx: number;
      callerType: NodeTypes;
    })
  | null;

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

  // MOdal used to add a new node
  const [addNodeModal, setAddNodeModal] = useState<AddNodeModalState>(null);

  // Modal used to add content to a node
  const [exprModal, setExprModal] = useState<ExprModalState>(null);

  // Right click context menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

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

              const AddNewNodeBtn = (
                <AddNodeBtn
                  x={node.x + node.width / 2}
                  y={node.y + node.height}
                  onClick={() => {
                    const pointerPos = stageRef.current.getPointerPosition();
                    setAddNodeModal({
                      x: pointerPos.x,
                      y: pointerPos.y,
                      onSelect: (nodeType: NodeTypes) => {
                        nodesDispatch({
                          type: NodeActions.ADD_NEW,
                          atIdx: idx + 1,
                          nodeType: nodeType,
                        });
                        setAddNodeModal(undefined);
                      },
                    });
                  }}
                />
              );

              const isTerminalNode =
                node.type === NodeTypes.START || node.type === NodeTypes.END;

              // Only used in non-terminal nodes
              const handleDblClick = () => {
                if (isTerminalNode) return;
                setExprModal({
                  x: node.x,
                  y: node.y,
                  callerIdx: idx,
                });
              };

              // Only used in non-terminal nodes
              const handleRightClick = () => {
                const { x, y } = stageRef.current.getPointerPosition();
                setContextMenu({
                  x: x,
                  y: y,
                  callerIdx: idx,
                  callerType: node.type,
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
                      width={node.width}
                      height={node.height}
                      isActive={node.active}
                      type={node.type}
                      next={next as FlowChartNode}
                      addNewNodeBtn={AddNewNodeBtn}
                    />
                  );

                case NodeTypes.PROCESS:
                  return (
                    <ProcessNode
                      key={idx}
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      text={node.content}
                      isActive={node.active}
                      next={next as FlowChartNode}
                      addNewNodeBtn={AddNewNodeBtn}
                      onDblClick={handleDblClick}
                      onRightClick={handleRightClick}
                    />
                  );

                case NodeTypes.INPUT:
                  return (
                    <InputNode
                      key={idx}
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      text={node.content}
                      isActive={node.active}
                      next={next as FlowChartNode}
                      addNewNodeBtn={AddNewNodeBtn}
                      onDblClick={handleDblClick}
                      onRightClick={handleRightClick}
                    />
                  );

                case NodeTypes.OUTPUT:
                  return (
                    <OutputNode
                      key={idx}
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      text={node.content}
                      isActive={node.active}
                      next={next as FlowChartNode}
                      addNewNodeBtn={AddNewNodeBtn}
                      onDblClick={handleDblClick}
                      onRightClick={handleRightClick}
                    />
                  );

                case NodeTypes.IF:
                  return (
                    <IfNode
                      key={idx}
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      text={node.content}
                      isActive={node.active}
                      next={next as ConditionalNodeNextNodes}
                      addNewNodeBtn={AddNewNodeBtn}
                      onDblClick={handleDblClick}
                      onRightClick={handleRightClick}
                    />
                  );

                default:
                  return null;
              }
            })}
        </Layer>

        <Layer name="top-layer">
          {!addNodeModal ? null : (
            <AddNodeModal
              x={addNodeModal.x}
              y={addNodeModal.y}
              onSelect={addNodeModal.onSelect}
              onCancel={() => setAddNodeModal(null)}
            />
          )}
        </Layer>
      </Stage>

      {!exprModal ? null : (
        <ExprModal
          x={exprModal.x}
          y={exprModal.y}
          callerIdx={exprModal.callerIdx}
          onClose={() => setExprModal(null)}
        />
      )}

      {!contextMenu ? null : (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        >
          <button
            className="btn btn-error btn-sm"
            onClick={() => {
              nodesDispatch({
                atIdx: contextMenu.callerIdx,
                type: NodeActions.DELETE,
              });

              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </ContextMenu>
      )}
    </>
  );
};
