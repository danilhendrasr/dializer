import { Group, Line } from 'react-konva';

type Props = {
  x: number;
  y: number;
  size: number;
  // Defaults to black
  color?: string;
  onClick?: () => void;
};

export const PlusIcon: React.FC<Props> = (props) => {
  const { x, y, size, color = 'black', onClick } = props;

  return (
    <Group onClick={onClick}>
      <Line points={[x - size, y, x + size, y]} stroke={color} />
      <Line points={[x, y - size, x, y + size]} stroke={color} />
    </Group>
  );
};
