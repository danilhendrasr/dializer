import React, { useEffect, useRef, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage as StageClass } from 'konva/lib/Stage';
import { Stage, Layer } from 'react-konva';
import { FlowChartNode, NodeTypes } from './types';
import { nodeToKonvaNode as nodeObjectToKonvaNode } from './utils';
import { Vector2d } from 'konva/lib/types';
import { ToggleAnimationBtn } from './components/play-animation.btn';
import { EnvironmentPanel } from './components/environtment-panel';

const DEFAULT_NODE_WIDTH = 100;

const SCALE_BY = 1.2;

const INITIAL_NODES: Array<FlowChartNode> = [
  {
    type: NodeTypes.START,
    x: 100,
    y: 100,
    width: DEFAULT_NODE_WIDTH,
    height: 40,
    active: false,
    nextIdx: 1,
  },
  {
    type: NodeTypes.INPUT,
    x: 100,
    y: 200,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 2,
  },
  {
    type: NodeTypes.OUTPUT,
    x: 100,
    y: 300,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 3,
  },
  {
    type: NodeTypes.PROCESS,
    x: 100,
    y: 400,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 4,
  },
  {
    type: NodeTypes.IF,
    x: 100,
    y: 500,
    width: DEFAULT_NODE_WIDTH,
    height: 70,
    active: false,
    nextIdxIfTrue: 5,
    nextIdxIfFalse: 3,
  },
  {
    type: NodeTypes.END,
    x: 100,
    y: 600,
    width: DEFAULT_NODE_WIDTH,
    height: 40,
    active: false,
  },
];

const App = () => {
  const stageRef = useRef<StageClass | null>(null);
  const animationRef = useRef<unknown>(null);
  const curNodeIdx = useRef<number>(0);

  const [nodes, setNodes] = useState(INITIAL_NODES);
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

      const nodesCopy = [...nodes];
      const curNode = nodesCopy[curNodeIdx.current];
      const nextNodeIdx = curNode.nextIdx ?? curNode.nextIdxIfTrue;
      curNode.active = true;
      setNodes(nodesCopy);

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
    <>
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
            let nextNode: Parameters<typeof nodeObjectToKonvaNode>[1] =
              undefined;
            if (node.nextIdx) {
              nextNode = nodes[node.nextIdx];
            } else if (node.nextIdxIfTrue && node.nextIdxIfFalse) {
              nextNode = {
                true: nodes[node.nextIdxIfTrue],
                false: nodes[node.nextIdxIfFalse],
              };
            }

            return nodeObjectToKonvaNode(node, nextNode, idx);
          })}
        </Layer>
        <Layer name="top-layer" />
      </Stage>
      <EnvironmentPanel />
    </>
  );
};

export default App;
