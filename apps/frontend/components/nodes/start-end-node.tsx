import { useState } from 'react';
import { Arrow, Group, Rect, Text } from 'react-konva';
import { FlowChartNode } from '../../common/types';
import { NodeTypes } from '@dializer/types';
import { AddNodeBtn } from '../add-node.btn';

type Props = {
  type: NodeTypes.START | NodeTypes.END;
  x: number;
  y: number;
  isActive: boolean;

  next?: FlowChartNode;

  width?: number;
  height?: number;

  addNewNodeHandler: () => void;

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
    onClick,
    addNewNodeHandler,
  } = props;
  const [displayAddNodeBtn, setDisplayAddNodeBtn] = useState(false);

  const text = type === NodeTypes.START ? 'Start' : 'End';

  return (
    <Group
      onMouseEnter={() => setDisplayAddNodeBtn(true)}
      onMouseLeave={() => {
        setTimeout(() => {
          setDisplayAddNodeBtn(false);
        }, 200);
      }}
      width={width + 10}
      height={height + 10}
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
      {type === NodeTypes.START && displayAddNodeBtn ? (
        <AddNodeBtn
          x={x + width / 2}
          y={y + height}
          onClick={addNewNodeHandler}
        />
      ) : null}
    </Group>
  );
};

export { StartEndNode };
