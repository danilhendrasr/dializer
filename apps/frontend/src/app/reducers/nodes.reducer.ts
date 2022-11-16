import { FlowChartNode, NodeActions, NodeTypes } from '../types';

export type NodesReducerActionObject = {
  type: NodeActions;
  idx: number;
  // Required if action type is NodeActions.ADD_NEW
  nodeType?: NodeTypes;
};

export function nodesReducer(
  state: FlowChartNode[],
  action: NodesReducerActionObject
) {
  let nodes = [...state];
  switch (action.type) {
    case NodeActions.ACTIVATE: {
      const targetNode = nodes[action.idx];
      targetNode.active = true;
      return nodes;
    }

    case NodeActions.ADD_NEW: {
      if (action.nodeType === undefined) {
        throw new Error('Node type is required when adding new node.');
      }

      const prevNode = nodes[action.idx - 1];
      const newNode: FlowChartNode = {
        type: action.nodeType,
        x: prevNode.x,
        y: prevNode.y + prevNode.height + 50,
        active: false,
        height: 100,
        width: 100,
        nextIdx: action.idx + 1,
      };

      nodes = nodes.map((node, idx) => {
        if (idx < action.idx) return node;
        node.y += newNode.height;

        if (node.nextIdx) node.nextIdx++;
        if (node.nextIdxIfTrue) node.nextIdxIfTrue++;
        if (node.nextIdxIfFalse) node.nextIdxIfFalse++;

        return node;
      });

      nodes.splice(action.idx, 0, newNode);

      return nodes;
    }

    case NodeActions.DELETE: {
      console.log('Delete node action dispatched.');
      return state;
    }

    default:
      throw new Error(`Unhandled reducer action: ${action.type}`);
  }
}
