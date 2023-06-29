import { useState } from 'react';
import { Circle, Group } from 'react-konva';
import { Portal } from 'react-konva-utils';
import { PlusIcon } from './plus.btn';

type Props = {
  x: number;
  y: number;

  onClick: () => void;
};

export const AddNodeBtn: React.FC<Props> = (props) => {
  const { x, y, onClick } = props;
  const [hovered, setHovered] = useState(false);

  const radius = hovered ? 5 : 7;
  const opacity = hovered ? 1 : 0.8;
  const circleFill = hovered ? 'black' : 'white';
  const plusIconFill = hovered ? 'white' : 'black';

  return (
    <Portal selector={'.top-layer'} enabled={true}>
      <Group
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
      >
        <Circle
          x={x}
          y={y}
          radius={radius}
          opacity={opacity}
          stroke="black"
          fill={circleFill}
          strokeWidth={0.5}
        />
        <PlusIcon x={x} y={y} size={4} color={plusIconFill} />
      </Group>
    </Portal>
  );
};
