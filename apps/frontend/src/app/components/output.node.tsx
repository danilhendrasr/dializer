import { Shape, Arrow, Group, Text } from 'react-konva';

const OutputNode: React.FC<{ x: number; y: number; isActive: boolean }> = (
  props
) => {
  const { x, y, isActive } = props;
  const width = 100;
  const height = 50;

  return (
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
  );
};

export { OutputNode };
