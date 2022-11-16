import { useState } from 'react';
import { Circle, Group, Shape } from 'react-konva';
import { Portal } from 'react-konva-utils';

type Props = {
  isActive: boolean;
  x: number;
  y: number;

  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void;
};

export const AddNodeBtn: React.FC<Props> = (props) => {
  const { isActive, x, y, onMouseEnter, onMouseLeave, onClick } = props;
  const [hovered, setHovered] = useState(false);

  const radius = hovered ? 10 : 5;
  const opacity = hovered ? 1 : 0.9;

  return (
    <Portal selector={'.top-layer'} enabled={isActive}>
      <Group
        onMouseEnter={() => {
          onMouseEnter();
          setHovered(true);
        }}
        onMouseLeave={() => {
          onMouseLeave();
          setHovered(false);
        }}
        onClick={onClick}
      >
        <Circle
          x={x}
          y={y}
          radius={radius}
          opacity={opacity}
          stroke="black"
          fill="white"
          strokeWidth={0.5}
        />
        {hovered ? (
          <Shape
            sceneFunc={(context, shape) => {
              context.moveTo(x - 5, y);
              context.lineTo(x + 5, y);
              context.moveTo(x, y - 5);
              context.lineTo(x, y + 5);
              context.fillStrokeShape(shape);
            }}
            stroke="black"
          />
        ) : null}
      </Group>
    </Portal>
  );
};
