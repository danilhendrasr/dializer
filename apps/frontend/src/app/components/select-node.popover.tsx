import { Group, Rect } from 'react-konva';
import { NodeTypes } from '../types';
import { nodeTypeToNode } from '../utils';
import { CloseIcon } from './close.icon';

type Props = {
  x: number;
  y: number;
  onSelect: (nodeType: NodeTypes) => void;
  onCancel: () => void;
};

export const SelectNodePopover: React.FC<Props> = (props) => {
  const { x, y, onSelect, onCancel } = props;

  const padding = { x: 60, y: 15 };
  let curNodeX = padding.x;
  let curNodeY = padding.y;
  const nodeChoices = Object.values(NodeTypes)
    .filter(
      (nodeType) => nodeType !== NodeTypes.START && nodeType !== NodeTypes.END
    )
    .map((nodeType, idx) => {
      let size = { width: 60, height: 40 };

      if (nodeType === NodeTypes.PROCESS) {
        size = { width: 80, height: 40 };
      } else if (nodeType === NodeTypes.IF) {
        size = { width: 90, height: 40 };
      }

      const Component = nodeTypeToNode({
        node: {
          type: nodeType,
          x: curNodeX,
          y: curNodeY + 5,
          width: size.width,
          height: size.height,
          active: false,
        },
        key: idx,
        onClick: () => onSelect(nodeType),
      });

      if ((idx + 1) % 2 === 0) {
        curNodeY = padding.y;
        curNodeX += size.width + 50;
      } else {
        curNodeY += size.height + 10;
      }

      return Component;
    });

  const boundingBoxHeight = 125;
  const boundingBoxWidth = 280;

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
