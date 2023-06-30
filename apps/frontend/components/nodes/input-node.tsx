import { KonvaEventObject } from 'konva/lib/Node';
import { useState } from 'react';
import { Shape, Arrow, Group, Text } from 'react-konva';
import { FlowChartNode } from '../../common/types';
import { AddNodeBtn } from '../add-node.btn';

type Props = {
  x: number;
  y: number;
  isActive: boolean;
  text?: string;
  width?: number;
  height?: number;
  next?: FlowChartNode;
  onDblClick?: () => void;
  onRightClick?: () => void;
  addNewNodeHandler: () => void;
};

const InputNode: React.FC<Props> = (props) => {
  const {
    x,
    y,
    text,
    isActive,
    width = 100,
    height = 50,
    next,
    onDblClick,
    onRightClick,
    addNewNodeHandler,
  } = props;
  const [displayAddNodeBtn, setDisplayAddNodeBtn] = useState(false);

  const handleRightClick = (e: KonvaEventObject<PointerEvent>) => {
    if (!onRightClick) return;
    e.evt.preventDefault();
    onRightClick();
  };

  return (
    <Group
      onMouseEnter={() => setDisplayAddNodeBtn(true)}
      onMouseLeave={() => setDisplayAddNodeBtn(false)}
      onDblClick={onDblClick}
      onContextMenu={handleRightClick}
    >
      <Group>
        <Arrow
          points={[x - 50, y, x, y]}
          strokeWidth={1}
          stroke={isActive ? 'red' : 'grey'}
        />
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
            text={text}
          />
        </Group>
      </Group>
      {next ? (
        <Arrow
          points={[
            x + width / 2,
            y + height,
            next.x + next.width / 2,
            next.y - 5,
          ]}
          stroke="grey"
        />
      ) : null}
      {displayAddNodeBtn ? (
        <AddNodeBtn
          x={x + width / 2}
          y={y + height}
          onClick={addNewNodeHandler}
        />
      ) : null}
    </Group>
  );
};

export { InputNode };
