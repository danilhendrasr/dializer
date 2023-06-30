import { KonvaEventObject } from 'konva/lib/Node';
import { useState } from 'react';
import { Arrow, Group, Shape, Text } from 'react-konva';
import { FlowChartNode } from '../../common/types';
import { AddNodeBtn } from '../add-node.btn';

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
  addNewNodeHandler: () => void;
};

const LoopNode: React.FC<Props> = (props) => {
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
      onMouseLeave={() => {
        setTimeout(() => {
          setDisplayAddNodeBtn(false);
        }, 200);
      }}
      onDblClick={onDblClick}
      onContextMenu={handleRightClick}
    >
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
        <Text text="True" x={width / 2 + 5} y={height + 10} />
      </Group>
      {next ? (
        <>
          <Arrow
            points={[
              x + width / 2,
              y + height,
              next.true.x + next.true.width / 2,
              next.true.y - 5,
            ]}
            stroke="grey"
          />
          <Arrow
            points={[
              x + width,
              y + height / 2,
              x + width + 100,
              y + height / 2,
              x + width + 100,
              next.false.y + next.false.height / 2,
              next.false.x + 105,
              next.false.y + next.false.height / 2,
            ]}
            stroke="grey"
          />
        </>
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

export { LoopNode };
