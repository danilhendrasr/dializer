import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { FlowChartNode } from './types';

const INITIAL_NODES: Array<FlowChartNode> = [
  { x: 100, y: 100, active: false, nextIdx: 3 },
  { x: 200, y: 200, active: false, nextIdx: 2 },
  { x: 300, y: 300, active: false },
  { x: 400, y: 400, active: false, nextIdx: 1 },
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
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {nodes.map((node, idx) => (
            <Rect
              key={idx}
              x={node.x}
              y={node.y}
              width={100}
              height={100}
              stroke={node.active ? 'red' : 'grey'}
              shadowBlur={5}
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
};

export default App;
