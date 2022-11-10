import { IfNode } from './components/if.node';
import { InputNode } from './components/input.node';
import { OutputNode } from './components/output.node';
import { ProcessNode } from './components/process.node';
import { StartEndNode } from './components/start-end.node';
import { FlowChartNode, NodeTypes } from './types';

export function nodeToKonvaNode(
  node: FlowChartNode,
  next?: FlowChartNode | { true: FlowChartNode; false: FlowChartNode },
  key?: number
) {
  switch (node.type) {
    case NodeTypes.START:
    case NodeTypes.END:
      return (
        <StartEndNode
          key={key}
          x={node.x}
          y={node.y}
          isActive={node.active}
          type={node.type}
          next={next as FlowChartNode}
        />
      );

    case NodeTypes.PROCESS:
      return (
        <ProcessNode
          key={key}
          x={node.x}
          y={node.y}
          isActive={node.active}
          next={next as FlowChartNode}
        />
      );

    case NodeTypes.INPUT:
      return (
        <InputNode
          key={key}
          x={node.x}
          y={node.y}
          isActive={node.active}
          next={next as FlowChartNode}
        />
      );

    case NodeTypes.OUTPUT:
      return (
        <OutputNode
          key={key}
          x={node.x}
          y={node.y}
          isActive={node.active}
          next={next as FlowChartNode}
        />
      );

    case NodeTypes.IF:
      return <IfNode key={key} x={node.x} y={node.y} isActive={node.active} />;

    default:
      return undefined;
  }
}
