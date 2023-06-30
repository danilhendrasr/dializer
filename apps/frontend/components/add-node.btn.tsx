import { useState } from 'react';
import { Circle, Group } from 'react-konva';
import { PlusIcon } from './plus.btn';

type Props = {
  x: number;
  y: number;

  onClick: () => void;
};

export const AddNodeBtn: React.FC<Props> = (props) => {
  const { x, y, onClick } = props;
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const radius = 10;
  const opacity = hovered ? 1 : 0.8;
  const circleFill = clicked ? 'white' : hovered ? 'black' : 'white';
  const plusIconFill = clicked ? 'black' : hovered ? 'white' : 'black';

  return (
    <Group
      x={x}
      y={y}
      onMouseEnter={() => {
        document.body.style.cursor = 'pointer';
        setHovered(true);
      }}
      onMouseLeave={() => {
        document.body.style.cursor = 'default';
        setTimeout(() => {
          setHovered(false);
        }, 300);
      }}
      onClick={() => {
        setClicked(true);
        onClick();
      }}
    >
      <Circle
        radius={radius}
        opacity={opacity}
        stroke="black"
        fill={circleFill}
        strokeWidth={0.5}
      />
      <PlusIcon x={0} y={0} size={4} color={plusIconFill} />
    </Group>
  );
};
