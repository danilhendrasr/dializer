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
  switch (action.type) {
    case NodeActions.ACTIVATE: {
      const nodesCopy = [...state];
      const targetNode = nodesCopy[action.idx];
      targetNode.active = true;
      return nodesCopy;
    }

    case NodeActions.ADD_NEW: {
      if (action.nodeType === undefined) {
        throw new Error('Node type is required when adding new node.');
      }

      return state;
    }

    case NodeActions.DELETE: {
      console.log('Delete node action dispatched.');
      return state;
    }

    default:
      throw new Error(`Unhandled reducer action: ${action.type}`);
  }
}
