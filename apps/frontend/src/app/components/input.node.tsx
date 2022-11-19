import { useState } from 'react';
import { Shape, Arrow, Group, Text } from 'react-konva';
import { FlowChartNode } from '../types';

type Props = {
  x: number;
  y: number;
  isActive: boolean;
  text?: string;
  addNewNodeBtn?: JSX.Element;
  width?: number;
  height?: number;
  next?: FlowChartNode;
  onClick?: () => void;
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
    addNewNodeBtn,
    onClick,
  } = props;
  const [displayAddNodeBtn, setDisplayAddNodeBtn] = useState(false);

  return (
    <Group
      onMouseEnter={() => setDisplayAddNodeBtn(true)}
      onMouseLeave={() => setDisplayAddNodeBtn(false)}
      onClick={onClick}
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
        {displayAddNodeBtn ? addNewNodeBtn : null}
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
    </Group>
  );
};

export { InputNode };
