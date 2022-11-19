import { useState } from 'react';
import { Arrow, Group, Rect, Text } from 'react-konva';
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

const ProcessNode: React.FC<Props> = (props) => {
  const {
    x,
    y,
    text,
    width = 100,
    height = 50,
    isActive,
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
        {displayAddNodeBtn && addNewNodeBtn ? addNewNodeBtn : null}
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

export { ProcessNode };
