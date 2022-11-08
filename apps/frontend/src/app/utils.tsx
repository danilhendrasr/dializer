import { Rect } from 'react-konva';
import { InputNode } from './components/input.node';
import { OutputNode } from './components/output.node';
import { FlowChartNode, NodeTypes } from './types';

export function nodeToKonvaNode(node: FlowChartNode, key?: number) {
  switch (node.type) {
    case NodeTypes.START:
    case NodeTypes.END:
      return (
        <Rect
          key={key}
          x={node.x}
          y={node.y}
          width={100}
          height={50}
          stroke={node.active ? 'red' : 'grey'}
          cornerRadius={50}
        />
      );

    case NodeTypes.PROCESS:
      return (
        <Rect
          key={key}
          x={node.x}
          y={node.y}
          width={100}
          height={50}
          stroke={node.active ? 'red' : 'grey'}
          cornerRadius={10}
        />
      );

    case NodeTypes.INPUT:
      return (
        <InputNode key={key} x={node.x} y={node.y} isActive={node.active} />
      );

    case NodeTypes.OUTPUT:
      return (
        <OutputNode key={key} x={node.x} y={node.y} isActive={node.active} />
      );

    case NodeTypes.IF:
      return (
        <Rect
          key={key}
          x={node.x + 50}
          y={node.y}
          width={50}
          height={50}
          stroke={node.active ? 'red' : 'grey'}
          rotationDeg={45}
        />
      );

    default:
      return undefined;
  }
}
