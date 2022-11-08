import { Shape, Arrow, Group } from 'react-konva';

const InputNode: React.FC<{ x: number; y: number; isActive: boolean }> = (
  props
) => {
  const { x, y, isActive } = props;
  const width = 100;
  const height = 50;

  return (
    <Group>
      <Arrow
        points={[x - 50, y, x, y]}
        strokeWidth={1}
        stroke={isActive ? 'red' : 'grey'}
      />
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
    </Group>
  );
};

export { InputNode };
