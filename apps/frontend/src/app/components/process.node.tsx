import { useState } from 'react';
import { Arrow, Group, Rect, Text } from 'react-konva';
import { FlowChartNode } from '../types';

type Props = {
  x: number;
  y: number;
  isActive: boolean;
  addNewNodeBtn?: JSX.Element;
  width?: number;
  height?: number;
  next?: FlowChartNode;
};

const ProcessNode: React.FC<Props> = (props) => {
  const {
    x,
    y,
    isActive,
    width = 100,
    height = 50,
    next,
    addNewNodeBtn,
  } = props;
  const [displayAddNodeBtn, setDisplayAddNodeBtn] = useState(false);

  return (
    <Group
      onMouseEnter={() => setDisplayAddNodeBtn(true)}
      onMouseLeave={() => setDisplayAddNodeBtn(false)}
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
          text={'This should be dynamic'}
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
