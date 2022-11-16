import { useState } from 'react';
import { Arrow, Group, Shape, Text } from 'react-konva';
import { FlowChartNode } from '../types';
import { AddNodeBtn } from './add-node.btn';

type Props = {
  x: number;
  y: number;
  isActive: boolean;
  next: {
    true: FlowChartNode;
    false: FlowChartNode;
  };
  onAddNewNode: () => void;
  width?: number;
  height?: number;
};

const IfNode: React.FC<Props> = (props) => {
  const {
    x,
    y,
    isActive,
    width = 100,
    height = 70,
    next,
    onAddNewNode,
  } = props;
  const [displayAddNodeBtn, setDisplayAddNodeBtn] = useState(false);

  return (
    <Group
      onMouseEnter={() => setDisplayAddNodeBtn(true)}
      onMouseLeave={() => setDisplayAddNodeBtn(false)}
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
          text={'Change me later'}
        />
        {next && displayAddNodeBtn ? (
          <AddNodeBtn
            isActive={displayAddNodeBtn}
            x={x + width / 2}
            y={y + height}
            onMouseEnter={() => setDisplayAddNodeBtn(true)}
            onMouseLeave={() => setDisplayAddNodeBtn(false)}
            onClick={onAddNewNode}
          />
        ) : null}
      </Group>
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
          x + width + 50,
          y + height / 2,
          next.false.x + 150,
          next.false.y + next.false.height / 2,
          next.false.x + 105,
          next.false.y + next.false.height / 2,
        ]}
        stroke="grey"
      />
    </Group>
  );
};

export { IfNode };
