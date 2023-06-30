import { KonvaEventObject } from 'konva/lib/Node';
import { Arrow, Group, Shape, Text } from 'react-konva';
import { FlowChartNode } from '../../common/types';

type Props = {
  x: number;
  y: number;
  isActive: boolean;
  text?: string;
  next?: {
    true: FlowChartNode;
    false: FlowChartNode;
  };
  width?: number;
  height?: number;
  onDblClick?: () => void;
  onRightClick?: () => void;
};

const IfNode: React.FC<Props> = (props) => {
  const {
    x,
    y,
    text,
    isActive,
    width = 100,
    height = 70,
    next,
    onDblClick,
    onRightClick,
  } = props;

  const handleRightClick = (e: KonvaEventObject<PointerEvent>) => {
    if (!onRightClick) return;
    e.evt.preventDefault();
    onRightClick();
  };

  return (
    <Group onDblClick={onDblClick} onContextMenu={handleRightClick}>
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
          text={text}
        />
        <Text text="False" x={width + 5} y={height / 2 - 20} />
        <Text text="True" x={-30} y={height / 2 - 20} />
      </Group>
      {next ? (
        <>
          <Arrow
            points={[
              x,
              y + height / 2,
              x - 50,
              y + height / 2,
              next.true.x + next.true.width / 2,
              next.true.y - 5,
            ]}
            stroke="grey"
          />
          <Arrow
            points={[
              x + width,
              y + height / 2,
              x + width + 50,
              y + height / 2,
              next.false.x + next.false.width / 2,
              next.false.y - 5,
            ]}
            stroke="grey"
          />
        </>
      ) : null}
    </Group>
  );
};

export { IfNode };
