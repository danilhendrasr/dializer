import { Arrow, Group, Rect, Text } from 'react-konva';
import { FlowChartNode } from '../types';

type Props = {
  x: number;
  y: number;
  isActive: boolean;
  width?: number;
  height?: number;
  next?: FlowChartNode;
};

// TODO: Make text dynamic
const ProcessNode: React.FC<Props> = (props) => {
  const { x, y, isActive, width = 100, height = 50, next } = props;

  return (
    <>
      <Group x={x} y={y}>
        <Rect
          width={width}
          height={height}
          stroke={isActive ? 'red' : 'grey'}
          cornerRadius={10}
        />
        <Text
          align="center"
          width={width}
          height={height}
          verticalAlign="middle"
          text={'This should be dynamic'}
        />
      </Group>
      {next ? (
        <Arrow
          points={[x + width / 2, y + height, next.x + 50, next.y - 5]}
          stroke="grey"
        />
      ) : null}
    </>
  );
};

export { ProcessNode };
