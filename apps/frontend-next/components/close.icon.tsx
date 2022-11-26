import { Circle, Group, Line } from 'react-konva';

type Props = {
  x: number;
  y: number;
  size: number;
  // Defaults to black
  color?: string;
  // Defaults to lightgrey
  bgColor?: string;
  onClick?: () => void;
};

export const CloseIcon: React.FC<Props> = (props) => {
  const { x, y, size, color = 'black', bgColor = 'lightgrey', onClick } = props;

  return (
    <Group onClick={onClick}>
      <Circle x={x + size / 2} y={y + size / 2} radius={size} fill={bgColor} />
      <Line points={[x, y, x + size, y + size]} stroke={color} />
      <Line points={[x + size, y, x, y + size]} stroke={color} />
    </Group>
  );
};
