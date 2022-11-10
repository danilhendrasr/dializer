import React from 'react';
import { Stage, Layer } from 'react-konva';
import { FlowChartNode, NodeTypes } from './types';
import { nodeToKonvaNode as nodeObjectToKonvaNode } from './utils';

const INITIAL_NODES: Array<FlowChartNode> = [
  { type: NodeTypes.START, x: 100, y: 100, active: false, nextIdx: 1 },
  { type: NodeTypes.INPUT, x: 100, y: 200, active: false, nextIdx: 2 },
  { type: NodeTypes.OUTPUT, x: 100, y: 300, active: false, nextIdx: 3 },
  { type: NodeTypes.PROCESS, x: 100, y: 400, active: false, nextIdx: 4 },
  {
    type: NodeTypes.IF,
    x: 100,
    y: 500,
    active: false,
    nextIdxIfTrue: 5,
    nextIdxIfFalse: 3,
  },
  { type: NodeTypes.END, x: 100, y: 600, active: false },
];

const App = () => {
  const animationRef = React.useRef<unknown>(null);
  const curNodeIdx = React.useRef<number>(0);

  const [nodes, setNodes] = React.useState(INITIAL_NODES);
  const [animating, setAnimation] = React.useState(false);

  React.useEffect(() => {
    if (!animating) {
      clearInterval(animationRef.current as NodeJS.Timer);
      return;
    }

    animationRef.current = setInterval(() => {
      if (curNodeIdx.current === undefined) {
        clearInterval(animationRef.current as NodeJS.Timer);
        return;
      }

      const nodesCopy = [...nodes];
      const curNode = nodesCopy[curNodeIdx.current];
      const nextNodeIdx = curNode.nextIdx;
      curNode.active = true;
      setNodes(nodesCopy);

      if (nextNodeIdx === undefined) {
        clearInterval(animationRef.current as NodeJS.Timer);
      } else {
        curNodeIdx.current = nextNodeIdx;
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating]);

  return (
    <>
      <button onClick={() => setAnimation(!animating)}>Toggle animation</button>
      <Stage width={window.innerWidth} height={window.innerHeight} draggable>
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
      </Stage>
    </>
  );
};

export default App;
