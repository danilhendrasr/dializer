import { useState } from 'react';
import { Arrow, Group, Rect, Text } from 'react-konva';
import { FlowChartNode, NodeTypes } from '../common/types';

type Props = {
  type: NodeTypes.START | NodeTypes.END;
  x: number;
  y: number;
  isActive: boolean;

  next?: FlowChartNode;

  width?: number;
  height?: number;

  addNewNodeBtn?: JSX.Element;

  onClick?: () => void;
};

const StartEndNode: React.FC<Props> = (props) => {
  const {
    x,
    y,
    next,
    isActive,
    width = 100,
    height = 40,
    type,
    addNewNodeBtn,
    onClick,
  } = props;
  const [displayAddNodeBtn, setDisplayAddNodeBtn] = useState(false);

  const text = type === NodeTypes.START ? 'Start' : 'End';

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
          cornerRadius={50}
        />
        <Text
          align="center"
          width={width}
          height={height}
          verticalAlign="middle"
          text={text}
        />
        {type === NodeTypes.START && displayAddNodeBtn && addNewNodeBtn
          ? addNewNodeBtn
          : null}
      </Group>
      {next && type === NodeTypes.START ? (
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

export { StartEndNode };
