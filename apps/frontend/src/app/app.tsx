import React, { useEffect, useReducer, useRef, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage as StageClass } from 'konva/lib/Stage';
import { Stage, Layer } from 'react-konva';
import { nodeToKonvaNode as nodeObjectToKonvaNode } from './utils';
import { Vector2d } from 'konva/lib/types';
import { ToggleAnimationBtn } from './components/play-animation.btn';
import { EnvironmentPanel } from './components/environtment-panel';
import { INITIAL_NODES } from './data';
import { NodesContext } from './contexts/nodes.context';
import { nodesReducer } from './reducers/nodes.reducer';
import { NodeActions } from './types';

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
    </NodesContext.Provider>
  );
};

export default App;
