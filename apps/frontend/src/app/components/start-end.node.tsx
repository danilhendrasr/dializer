import { Arrow, Group, Rect, Text } from 'react-konva';
import { FlowChartNode, NodeTypes } from '../types';

type Props = {
  type: NodeTypes.START | NodeTypes.END;
  x: number;
  y: number;
  isActive: boolean;

  next?: FlowChartNode;

  width?: number;
  height?: number;
};

const StartEndNode: React.FC<Props> = (props) => {
  const { x, y, next, isActive, width = 100, height = 40, type } = props;

  const text = type === NodeTypes.START ? 'Start' : 'End';

  return (
    <>
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
          points={[x + width / 2, y + height, next.x + 50, next.y - 5]}
          stroke="grey"
        />
      ) : null}
    </>
  );
};

export { StartEndNode };
