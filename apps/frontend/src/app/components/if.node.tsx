import { Arrow, Group, Shape, Text } from 'react-konva';
import { FlowChartNode } from '../types';

type Props = {
  x: number;
  y: number;
  isActive: boolean;
  next: {
    true: FlowChartNode;
    false: FlowChartNode;
  };
  width?: number;
  height?: number;
};

const IfNode: React.FC<Props> = (props) => {
  const { x, y, isActive, width = 100, height = 70, next } = props;
  console.log('nexts', next);

  return (
    <>
      <Group x={x} y={y}>
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.moveTo(width / 2, 0);
            context.lineTo(width, height / 2);
            context.lineTo(width / 2, height);
            context.lineTo(0, height / 2);
            context.lineTo(width / 2, 0);
            context.closePath();

            context.fillStrokeShape(shape);
          }}
          stroke={isActive ? 'red' : 'grey'}
        />
        <Text
          align="center"
          width={width}
          height={height}
          verticalAlign="middle"
          text={'Change me later'}
        />
      </Group>
      <Arrow
        points={[x + width / 2, y + height, next.true.x + 50, next.true.y - 5]}
        stroke="grey"
      />
      <Arrow
        points={[
          x + width,
          y + height / 2,
          x + width + 50,
          y + height / 2,
          next.false.x + 150,
          next.false.y + 25,
          next.false.x + 105,
          next.false.y + 25,
        ]}
        stroke="grey"
      />
    </>
  );
};

export { IfNode };
