import { Shape, Arrow, Group, Text } from 'react-konva';
import { FlowChartNode } from '../types';

type Props = { x: number; y: number; isActive: boolean; next?: FlowChartNode };

const OutputNode: React.FC<Props> = (props) => {
  const { x, y, isActive, next } = props;
  const width = 100;
  const height = 50;

  return (
    <>
      <Group>
        <Group x={x} y={y}>
          <Shape
            sceneFunc={(context, shape) => {
              context.beginPath();
              context.moveTo(20, 0);
              context.lineTo(width + 20, 0);
              context.lineTo(width, height);
              context.lineTo(-20, height);
              context.lineTo(0, 0);
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
            text={'This is output node'}
          />
        </Group>
        <Arrow
          points={[x + width, y, x + width + 50, y]}
          strokeWidth={1}
          stroke={isActive ? 'red' : 'grey'}
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

export { OutputNode };
