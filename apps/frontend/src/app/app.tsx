import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';

type Coordinate = {
  x: number;
  y: number;
  active: boolean;
  // Next node to be activated
  next?: number;
};

const INITIAL_RECTS: Coordinate[] = [
  { x: 100, y: 100, active: false, next: 3 },
  { x: 200, y: 200, active: false, next: 2 },
  { x: 300, y: 300, active: false },
  { x: 400, y: 400, active: false, next: 1 },
];

const App = () => {
  const animationRef = React.useRef<unknown>(null);
  const curNodeIdx = React.useRef<number | undefined>(0);

  const [rects, setRects] = React.useState<Coordinate[]>(INITIAL_RECTS);
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

      const rectsCopy = [...rects];
      const curNode = rectsCopy[curNodeIdx.current];
      curNode.active = true;
      setRects(rectsCopy);

      if (curNode.next === undefined) {
        clearInterval(animationRef.current as NodeJS.Timer);
      }

      const nextNodeIdx = curNode.next;
      curNodeIdx.current = nextNodeIdx;
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating]);

  return (
    <>
      <button onClick={() => setAnimation(!animating)}>Toggle animation</button>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {rects.map((rect, idx) => (
            <Rect
              key={idx}
              x={rect.x}
              y={rect.y}
              width={100}
              height={100}
              stroke={rect.active ? 'red' : 'grey'}
              shadowBlur={5}
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
};

export default App;
