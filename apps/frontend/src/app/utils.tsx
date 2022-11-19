import { IfNode } from './components/if.node';
import { InputNode } from './components/input.node';
import { OutputNode } from './components/output.node';
import { ProcessNode } from './components/process.node';
import { StartEndNode } from './components/start-end.node';
import { ConditionalNodeNextNodes, FlowChartNode, NodeTypes } from './types';

type Params = {
  node: FlowChartNode;
  nextNode?: FlowChartNode | ConditionalNodeNextNodes;
  addNewNodeBtn?: JSX.Element;
  key?: number;
  text?: string;
  onClick?: () => void;
};

export const nodeTypeToNode = (params: Params) => {
  const { node, nextNode, addNewNodeBtn, key, onClick } = params;

  switch (node.type) {
    case NodeTypes.START:
    case NodeTypes.END:
      return (
        <StartEndNode
          key={key}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          isActive={node.active}
          type={node.type}
          next={nextNode as FlowChartNode}
          addNewNodeBtn={addNewNodeBtn}
          onClick={onClick}
        />
      );

    case NodeTypes.PROCESS:
      return (
        <ProcessNode
          key={key}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          text={node.content}
          isActive={node.active}
          next={nextNode as FlowChartNode}
          addNewNodeBtn={addNewNodeBtn}
          onClick={onClick}
        />
      );

    case NodeTypes.INPUT:
      return (
        <InputNode
          key={key}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          text={node.content}
          isActive={node.active}
          next={nextNode as FlowChartNode}
          addNewNodeBtn={addNewNodeBtn}
          onClick={onClick}
        />
      );

    case NodeTypes.OUTPUT:
      return (
        <OutputNode
          key={key}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          text={node.content}
          isActive={node.active}
          next={nextNode as FlowChartNode}
          addNewNodeBtn={addNewNodeBtn}
          onClick={onClick}
        />
      );

    case NodeTypes.IF:
      return (
        <IfNode
          key={key}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          text={node.content}
          isActive={node.active}
          next={nextNode as ConditionalNodeNextNodes}
          addNewNodeBtn={addNewNodeBtn}
          onClick={onClick}
        />
      );

    default:
      return null;
  }
};
