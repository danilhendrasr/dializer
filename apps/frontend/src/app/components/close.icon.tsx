import { Group, Line } from 'react-konva';

type Props = {
  x: number;
  y: number;
  size: number;
  // Defaults to black
  color?: string;
  onClick?: () => void;
};

export const CloseIcon: React.FC<Props> = (props) => {
  const { x, y, size, color = 'black', onClick } = props;

  return (
    <Group onClick={onClick}>
      <Line points={[x, y, x + size, y + size]} stroke={color} />
      <Line points={[x + size, y, x, y + size]} stroke={color} />
    </Group>
  );
};
