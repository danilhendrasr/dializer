import { toast } from 'react-toastify';
import { FlowChartNode, NodeActions, NodeTypes } from '../types';

export type NodesReducerActionObject = {
  type: NodeActions;
  atIdx: number;
  // Required if action type is NodeActions.ADD_NEW
  nodeType?: NodeTypes;
  // Required if action type is NodeActions.CHANGE_CONTENT
  content?: string;
};

export function nodesReducer(
  state: FlowChartNode[],
  action: NodesReducerActionObject
) {
  let nodes = [...state];
  switch (action.type) {
    case NodeActions.ACTIVATE: {
      const targetNode = nodes[action.atIdx];
      targetNode.active = true;
      return nodes;
    }

    case NodeActions.CHANGE_CONTENT: {
      if (action.content === undefined) {
        throw new Error(
          'Content is required when changing the content of a node.'
        );
      }

      nodes[action.atIdx].content = action.content;
      return nodes;
    }

    case NodeActions.ADD_NEW: {
      if (action.nodeType === undefined) {
        throw new Error('Node type is required when adding new node.');
      }

      const prevNodeIdx = action.atIdx - 1;
      const prevNode = nodes[prevNodeIdx];
      const ifAfterTerminal =
        action.nodeType === NodeTypes.IF && prevNode.type === NodeTypes.START;

      if (ifAfterTerminal) {
        toast('Cannot insert if node after start node.', { type: 'error' });
        return nodes;
      }

      const isNextIfNode = action.nodeType === NodeTypes.IF;

      const newNode: FlowChartNode = {
        type: action.nodeType,
        x: prevNode.x,
        y: prevNode.y + prevNode.height + 50,
        active: false,
        height: 100,
        width: 100,
        nextIdx: !isNextIfNode ? action.atIdx + 1 : undefined,
        nextIdxIfTrue: isNextIfNode ? action.atIdx + 1 : undefined,
        nextIdxIfFalse: isNextIfNode ? action.atIdx - 1 : undefined,
      };

      nodes = nodes.map((node, idx) => {
        if (idx < action.atIdx) return node;
        node.y += newNode.height + 50;

        if (node.nextIdx) node.nextIdx++;
        if (node.nextIdxIfTrue) node.nextIdxIfTrue++;
        if (node.nextIdxIfFalse && prevNodeIdx !== node.nextIdxIfFalse) {
          node.nextIdxIfFalse++;
        }

        return node;
      });

      nodes.splice(action.atIdx, 0, newNode);

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
