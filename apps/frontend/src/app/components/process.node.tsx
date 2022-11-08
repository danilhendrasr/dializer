import { Group, Rect, Text } from 'react-konva';

type Props = {
  x: number;
  y: number;
  isActive: boolean;
  width?: number;
  height?: number;
};

// TODO: Make text dynamic
const ProcessNode: React.FC<Props> = (props) => {
  const { x, y, isActive, width = 100, height = 50 } = props;

  return (
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
    </Group>
  );
};

export { ProcessNode };
