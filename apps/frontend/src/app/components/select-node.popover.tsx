import { Group, Rect, Text } from 'react-konva';
import { NodeTypes } from '../types';
import { CloseIcon } from './close.icon';

type Props = {
  x: number;
  y: number;
  onSelect: (nodeType: NodeTypes) => void;
  onCancel: () => void;
};

export const SelectNodePopover: React.FC<Props> = (props) => {
  const { x, y, onSelect, onCancel } = props;

  let curNodeY = 0;
  const nodeChoices = Object.values(NodeTypes)
    .filter(
      (nodeType) => nodeType !== NodeTypes.START || nodeType !== NodeTypes.END
    )
    .map((nodeType, idx) => {
      const Component = (
        <Text
          key={idx}
          y={curNodeY}
          width={50}
          height={50}
          fill="black"
          text={nodeType}
          onClick={() => onSelect(nodeType)}
        />
      );

      curNodeY += 15;

      return Component;
    });

  const boundingBoxHeight = 100;
  const boundingBoxWidth = 250;

  return (
    <Group draggable x={x - 10} y={y - 10}>
      <Rect
        height={boundingBoxHeight}
        width={boundingBoxWidth}
        fill="#f5f5f5"
        stroke="grey"
        strokeWidth={0.5}
        cornerRadius={10}
      />
      {nodeChoices}
      <CloseIcon
        x={boundingBoxWidth - 20}
        y={10}
        size={10}
        onClick={onCancel}
      />
    </Group>
  );
};
