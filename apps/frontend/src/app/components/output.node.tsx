import { Shape, Arrow, Group } from 'react-konva';

const OutputNode: React.FC<{ x: number; y: number; isActive: boolean }> = (
  props
) => {
  const { x, y, isActive } = props;
  const width = 100;
  const height = 50;

  return (
    <Group>
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + width, y);
          context.lineTo(x + width - 20, y + height);
          context.lineTo(x - 20, y + height);
          context.lineTo(x, y);
          context.fillStrokeShape(shape);
        }}
        stroke={isActive ? 'red' : 'grey'}
      />
      <Arrow
        points={[x + width, y, x + width + 50, y]}
        strokeWidth={1}
        stroke={isActive ? 'red' : 'grey'}
      />
    </Group>
  );
};

export { OutputNode };
