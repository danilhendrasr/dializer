import { Group, Shape, Text } from 'react-konva';

type Props = {
  x: number;
  y: number;
  isActive: boolean;
  width?: number;
  height?: number;
};

const IfNode: React.FC<Props> = (props) => {
  const { x, y, isActive, width = 100, height = 70 } = props;

  return (
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
  );
};

export { IfNode };
