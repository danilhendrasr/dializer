import { KonvaEventObject } from 'konva/lib/Node';
import { useState } from 'react';
import { Arrow, Group, Rect, Text } from 'react-konva';
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

const ProcessNode: React.FC<Props> = (props) => {
  const {
    x,
    y,
    text,
    width = 100,
    height = 50,
    isActive,
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
        }, 300);
      }}
      onDblClick={onDblClick}
      onContextMenu={handleRightClick}
    >
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
          text={text}
        />
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

export { ProcessNode };
