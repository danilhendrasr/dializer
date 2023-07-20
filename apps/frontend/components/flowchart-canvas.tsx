import React, { useContext, useRef, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage as StageClass } from 'konva/lib/Stage';
import { Stage, Layer } from 'react-konva';
import { Vector2d } from 'konva/lib/types';
import { useWorkspaceStore } from '../stores/flowchart';
import {
  AnimationState,
  ConditionalNodeNextNodes,
  Coordinate,
  FlowChartNode,
  NodeActions,
} from '../common/types';
import { ExpressionModal as ExprModal } from './expression-modal';
import { ContextMenu } from './node-context-menu';
import { useInterval } from 'usehooks-ts';
import { StartEndNode } from './nodes/start-end-node';
import { ProcessNode } from './nodes/process-node';
import { InputNode } from './nodes/input-node';
import { OutputNode } from './nodes/output-node';
import { IfNode } from './nodes/if-node';
import { NewNodeModal } from './new-node-modal';
import { InterpreterContext } from '../contexts/expression-interpreter.context';
import { toast } from 'react-toastify';
import { OutputModal } from './output-modal';
import { InputModal } from './input-modal';
import { LoopNode } from './nodes/loop-node';
import { NodeTypes } from '@dializer/types';

// Constant used to determine how much to zoom-in and out on wheel movement
const SCALE_BY = 1.2;

// Constant used to determine how long to activate a node during animation
const ANIMATION_PAUSE = 600;

type AddNodeModalState =
  | (Coordinate & {
      // Function to call when a node type is selected
      onSelect: (nodeType: NodeTypes) => void;
    })
  | null;

type ExprModalState =
  | (Coordinate & {
      // The index of the node that was double-clicked
      targetId: string;
    })
  | null;

type OutputModalState = (Coordinate & { text: string }) | null;

type InputModalState =
  | (Coordinate & {
      // The index of the node that was double-clicked
      targetId: string;
    })
  | null;

type RuntimeInputModalState =
  | (Coordinate & {
      // The index of the node that was double-clicked
      targetId: string;
    })
  | null;

type ContextMenuState =
  | (Coordinate & {
      // The index of the node that was right-clicked
      targetId: string;
    })
  | null;

export const FlowchartCanvas: React.FC = () => {
  const interpreter = useContext(InterpreterContext);
  const stageRef = useRef<StageClass | null>(null);

  // Currently to-be-actived node
  const curNode = useRef<FlowChartNode>(null);
  // Previously activated node
  const prevNode = useRef<FlowChartNode>(null);

  const nodes = useWorkspaceStore((s) => s.nodes);
  const animationState = useWorkspaceStore((s) => s.animationState);
  const viewOnlyMode = useWorkspaceStore((s) => s.viewOnlyMode);
  const stopAnimation = useWorkspaceStore((s) => s.stopAnimation);
  const stopAnimationTemporarily = useWorkspaceStore(
    (s) => s.stopAnimationTemporarily
  );
  const startAnimation = useWorkspaceStore((s) => s.startAnimation);
  const nodesDispatch = useWorkspaceStore((s) => s.dispatchNodeAction);

  // MOdal used to add a new node
  const [addNodeModal, setAddNodeModal] = useState<AddNodeModalState>(null);

  // Modal used to add content to a node
  const [exprModal, setExprModal] = useState<ExprModalState>(null);

  // Modal used to display outputs
  const [outputModal, setOutputModal] = useState<OutputModalState>(null);

  // Modal used for user to select to which variable to store the input
  const [inputModal, setInputModal] = useState<InputModalState>(null);

  // Modal used for user to select to which variable to store the input
  const [runtimeInputModal, setRuntimeInputModal] =
    useState<RuntimeInputModalState>(null);

  // Right click context menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  // Function to play the animation
  useInterval(
    () => {
      if (curNode.current === null) {
        curNode.current = nodes[0];
      }

      if (prevNode.current) {
        nodesDispatch({
          type: NodeActions.DEACTIVATE,
          targetId: prevNode.current.id,
        });
      }

      nodesDispatch({
        type: NodeActions.ACTIVATE,
        targetId: curNode.current.id,
      });

      switch (curNode.current.type) {
        case NodeTypes.PROCESS:
        case NodeTypes.LOOP:
        case NodeTypes.BRANCHING:
          {
            try {
              const result = interpreter.interpret(curNode.current.content);
              if (
                (curNode.current.type === NodeTypes.LOOP ||
                  curNode.current.type === NodeTypes.BRANCHING) &&
                result === false
              ) {
                prevNode.current = curNode.current;
                curNode.current = nodes.find(
                  (node) => node.id === curNode.current.nextIfFalse
                );
                return;
              }
            } catch (e) {
              const err = e as Error;
              toast(`Error: ${err.message}`, { type: 'error' });
              stopAnimation();

              // Deactivate error node after a delay
              // TODO: Find a better way to do this
              setTimeout(() => {
                nodesDispatch({
                  type: NodeActions.DEACTIVATE,
                  targetId: curNode.current.id,
                });

                // Reset the pointers
                curNode.current = nodes[0];
                prevNode.current = null;
              }, 2000);
            }
          }
          break;

        case NodeTypes.OUTPUT:
          {
            try {
              const interpretResult = interpreter.interpret(
                curNode.current.content
              );
              stopAnimationTemporarily();
              setOutputModal({
                x: curNode.current.x + (25 / 100) * window.innerWidth,
                y: curNode.current.y,
                text: String(interpretResult),
              });
            } catch (e) {
              const err = e as Error;
              toast(`Error: ${err.message}`, { type: 'error' });
              stopAnimation();

              // Deactivate error node after a delay
              // TODO: Find a better way to do this
              setTimeout(() => {
                nodesDispatch({
                  type: NodeActions.DEACTIVATE,
                  targetId: curNode.current.id,
                });

                // Reset the pointers
                curNode.current = nodes[0];
                prevNode.current = null;
              }, 2000);
            }
          }
          break;

        case NodeTypes.INPUT: {
          stopAnimationTemporarily();
          setRuntimeInputModal({
            x: curNode.current.x + (25 / 100) * window.innerWidth,
            y: curNode.current.y,
            targetId: curNode.current.id,
          });
        }
      }

      if (!curNode.current.next) {
        // One last deactivation of the current node
        // needs to be put in a setTimeout because
        // we have to conform to the animation pause.
        setTimeout(() => {
          nodesDispatch({
            type: NodeActions.DEACTIVATE,
            targetId: curNode.current.id,
          });

          curNode.current = nodes[0];
          prevNode.current = null;
        }, ANIMATION_PAUSE);

        stopAnimation();
      } else {
        prevNode.current = curNode.current;
        curNode.current = nodes.find(
          (node) => node.id === curNode.current.next
        );
      }
    },
    animationState === AnimationState.Playing ? ANIMATION_PAUSE : null
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

    // Limit the amount of zoom in and zoom out the user can do
    if (newScale < 0.5 || newScale > 3) return;

    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointerX - mousePointTo.x * newScale,
      y: pointerY - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw();
  }

  /**
   * Get the position of the cursor relative to the canvas.
   * This function should only be called ad-hoc when there is the need
   * such as in an event handler function.
   *
   * @returns The position of the cursor relative to the canvas
   */
  const getPointerPositions = () => {
    const pointerPos = stageRef.current.getPointerPosition();
    // The pointer position is relative to the canvas, so we need to
    // add the pointer's x position with the width of the side bar
    // in order to get the correct position of the pointer relative
    // to the window.
    pointerPos.x = (25 / 100) * window.innerWidth + pointerPos.x;
    return pointerPos;
  };

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

              if (!node.nextIfFalse) {
                next = nodes.find((nextNode) => nextNode.id === node.next);
              } else {
                next = {
                  true: nodes.find((nextNode) => nextNode.id === node.next),
                  false: nodes.find(
                    (nextNode) => nextNode.id === node.nextIfFalse
                  ),
                };
              }

              const handleAddNewNode = () => {
                const pointerPos = getPointerPositions();
                setAddNodeModal({
                  x: pointerPos.x,
                  y: pointerPos.y,
                  onSelect: (nodeType: NodeTypes) => {
                    // Add new node after the current node (idx + 1)
                    nodesDispatch({
                      type: NodeActions.ADD_NEW_AFTER,
                      targetId: node.id,
                      nodeType: nodeType,
                    });

                    setAddNodeModal(null);
                  },
                });
              };

              // Return early if the node is a terminal node
              // This is done for no particular reason, it's just easier to reason
              // about the code this way.
              if (
                node.type === NodeTypes.START ||
                node.type === NodeTypes.END
              ) {
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
                    addNewNodeHandler={handleAddNewNode}
                  />
                );
              }

              const handleDblClick = () => {
                if (viewOnlyMode) return;
                const pointerPos = getPointerPositions();
                if (node.type === NodeTypes.INPUT) {
                  setInputModal({
                    x: pointerPos.x,
                    y: pointerPos.y,
                    targetId: node.id,
                  });
                } else {
                  setExprModal({
                    x: pointerPos.x,
                    y: pointerPos.y,
                    targetId: node.id,
                  });
                }
              };

              const handleRightClick = () => {
                if (viewOnlyMode) return;
                const pointerPos = getPointerPositions();
                setContextMenu({
                  x: pointerPos.x,
                  y: pointerPos.y,
                  targetId: node.id,
                });
              };

              switch (node.type) {
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
                      addNewNodeHandler={handleAddNewNode}
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
                      addNewNodeHandler={handleAddNewNode}
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
                      addNewNodeHandler={handleAddNewNode}
                      onDblClick={handleDblClick}
                      onRightClick={handleRightClick}
                    />
                  );

                case NodeTypes.LOOP:
                  return (
                    <LoopNode
                      key={idx}
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      text={node.content}
                      isActive={node.active}
                      next={next as ConditionalNodeNextNodes}
                      onDblClick={handleDblClick}
                      onRightClick={handleRightClick}
                      addNewNodeHandler={handleAddNewNode}
                    />
                  );

                case NodeTypes.BRANCHING:
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
                      onDblClick={handleDblClick}
                      onRightClick={handleRightClick}
                    />
                  );

                default:
                  return null;
              }
            })}
        </Layer>

        {/* Any canvas element that needs to act as an overlay can attach to this layer */}
        <Layer name="top-layer" />
      </Stage>

      {!addNodeModal ? null : (
        <NewNodeModal
          x={addNodeModal.x}
          y={addNodeModal.y}
          onSelect={addNodeModal.onSelect}
          onClose={() => setAddNodeModal(null)}
        />
      )}

      {!outputModal ? null : (
        <OutputModal
          x={outputModal.x}
          y={outputModal.y}
          text={outputModal.text}
          show={Boolean(outputModal)}
          onClose={() => {
            setOutputModal(null);
            startAnimation();
          }}
        />
      )}

      {!inputModal ? null : (
        <InputModal
          x={inputModal.x}
          y={inputModal.y}
          onClose={() => setInputModal(null)}
          onSave={(variableName) => {
            nodesDispatch({
              type: NodeActions.CHANGE_CONTENT,
              content: variableName,
              targetId: inputModal.targetId,
            });

            setInputModal(null);
          }}
        />
      )}

      {!runtimeInputModal ? null : (
        <ExprModal
          x={runtimeInputModal.x}
          y={runtimeInputModal.y}
          placeholder="Enter expression"
          onClose={() => setRuntimeInputModal(null)}
          onSubmit={(expression) => {
            try {
              const existingContent = nodes.find(
                (node) => node.id === runtimeInputModal.targetId
              ).content;
              interpreter.parse(expression);
              startAnimation();
              const fullExpr = `${existingContent} = ${expression}`;
              interpreter.interpret(fullExpr);
            } catch (e) {
              const err = e as Error;
              toast(`Error: ${err.message}`, { type: 'error' });
              stopAnimation();

              // Deactivate error node after a delay
              // TODO: Find a better way to do this
              setTimeout(() => {
                nodesDispatch({
                  type: NodeActions.DEACTIVATE,
                  targetId: curNode.current.id,
                });

                // Reset the pointers
                curNode.current = nodes[0];
                prevNode.current = null;
              }, 2000);
            }
            setRuntimeInputModal(null);
          }}
        />
      )}

      {!exprModal ? null : (
        <ExprModal
          x={exprModal.x}
          y={exprModal.y}
          initialValue={
            nodes.find((node) => node.id === exprModal.targetId).content
          }
          onClose={() => setExprModal(null)}
          onSubmit={(expressionText) => {
            nodesDispatch({
              targetId: exprModal.targetId,
              type: NodeActions.CHANGE_CONTENT,
              content: expressionText,
            });

            setExprModal(null);
          }}
        />
      )}

      {!contextMenu ? null : (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        >
          <button
            className="btn btn-error btn-sm my-1"
            onClick={() => {
              nodesDispatch({
                targetId: contextMenu.targetId,
                type: NodeActions.DELETE,
              });

              setContextMenu(null);
            }}
          >
            Delete
          </button>
          <button
            className="btn btn-warning btn-sm my-1"
            onClick={() => {
              setContextMenu(null);
              setAddNodeModal({
                x: contextMenu.x,
                y: contextMenu.y,
                onSelect: (nodeType) => {
                  nodesDispatch({
                    targetId: contextMenu.targetId,
                    type: NodeActions.CONVERT,
                    nodeType: nodeType,
                  });

                  setAddNodeModal(null);
                },
              });
            }}
          >
            Convert
          </button>
        </ContextMenu>
      )}
    </>
  );
};
