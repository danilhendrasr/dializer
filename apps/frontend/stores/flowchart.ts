import { toast } from 'react-toastify';
import {
  AnimationState,
  FlowChartNode,
  LocalStorageItems,
  NodeActions,
  NodeTypes,
} from '../common/types';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { envStore } from './environment';

type NodesState = {
  animationState: AnimationState;
  nodes: FlowChartNode[] | null;
  computed: {
    emptyNodeExists: boolean;
    flowchartOnlyHasTerminalNodes: boolean;
  };
  unsavedChangesExist: boolean;
  startAnimation: () => void;
  stopAnimation: () => void;
  stopAnimationTemporarily: () => void;
  nullifyNodes: () => void;
  resetNodes: () => void;
  fetchNodes: (workspaceId: string) => void;
  saveNodes: (workspaceId: string) => void;
  dispatchNodeAction: (action: NodesReducerActionObject) => void;
};

export const useFlowchartStore = create<NodesState>()((set, get) => ({
  animationState: AnimationState.Stopped,
  nodes: null,
  computed: {
    get emptyNodeExists() {
      if (get().nodes === null) return true;

      return get().nodes.some(
        (node) =>
          node.type !== NodeTypes.START &&
          node.type !== NodeTypes.END &&
          !node.content
      );
    },
    get flowchartOnlyHasTerminalNodes() {
      const nodes = get().nodes;
      if (nodes === null) return false;
      return nodes.length === 2;
    },
  },
  unsavedChangesExist: false,
  startAnimation: () => {
    if (get().computed.emptyNodeExists) {
      toast.error("Cannot play flowchart while there's an empty node(s).");
      return;
    }

    set({ animationState: AnimationState.Playing });
  },
  stopAnimation: () => {
    set({ animationState: AnimationState.Stopped });
    envStore.setState({ variables: {} });
  },
  stopAnimationTemporarily: () => {
    set({ animationState: AnimationState.TemporaryStopped });
  },
  nullifyNodes: () => set(() => ({ nodes: null })),
  resetNodes: () => set(() => ({ nodes: [] })),
  fetchNodes: async (workspaceId) => {
    const data = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/nodes`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            LocalStorageItems.ACCESS_TOKEN
          )}`,
        },
      }
    );
    const nodes: FlowChartNode[] = await data.json();
    set({ nodes });
  },
  saveNodes: async (workspaceId) => {
    const nodes = get().nodes;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/nodes`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(
            LocalStorageItems.ACCESS_TOKEN
          )}`,
        },
        body: JSON.stringify({ nodes }),
      }
    );

    if (res.ok) {
      toast.success('Flowchart saved!');
      set({ unsavedChangesExist: false });
    } else {
      toast.error('Cannot save workspace, try again later.');
    }
  },
  dispatchNodeAction: (action) => {
    set((state) => ({ nodes: nodesReducer(state.nodes, action) }));

    if (
      action.type === NodeActions.ACTIVATE &&
      get().nodes[action.atIdx].type === NodeTypes.INPUT
    ) {
      set({ animationState: AnimationState.TemporaryStopped });
    }

    if (
      action.type !== NodeActions.ACTIVATE &&
      action.type !== NodeActions.DEACTIVATE
    ) {
      set({ unsavedChangesExist: true });
    }
  },
}));

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

  const ifNodes = nodes.reduce((acc, cur, curIdx) => {
    if (cur.type !== NodeTypes.IF) return acc;
    if (!cur.nextIdxIfTrue || !cur.nextIdxIfFalse) return acc;
    acc[curIdx] = [cur.nextIdxIfTrue, cur.nextIdxIfFalse];
    return acc;
  }, {} as Record<number, number[]>);

  switch (action.type) {
    case NodeActions.ACTIVATE: {
      const targetNode = nodes[action.atIdx];
      targetNode.active = true;
      return nodes;
    }

    case NodeActions.DEACTIVATE: {
      const targetNode = nodes[action.atIdx];
      targetNode.active = false;
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
        id: uuidv4(),
        type: action.nodeType,
        x: prevNode.x,
        y: prevNode.y + prevNode.height + 50,
        active: false,
        height: 100,
        width: 100,
        nextIdx: !isNextIfNode ? action.atIdx + 1 : undefined,
        nextIdxIfTrue: isNextIfNode ? action.atIdx + 1 : undefined,
        nextIdxIfFalse: isNextIfNode ? action.atIdx - 1 : undefined,
        // The start node always has the correct workspaceId
        workspaceId: nodes[0].workspaceId,
      };

      nodes = nodes.map((node, idx) => {
        if (idx < action.atIdx) return node;
        node.y += newNode.height + 50;

        if (node.nextIdx) node.nextIdx++;
        if (node.nextIdxIfTrue) node.nextIdxIfTrue++;

        const beforeCur = action.atIdx <= idx;
        if (
          node.nextIdxIfFalse &&
          ((beforeCur && action.atIdx <= node.nextIdxIfFalse) || !beforeCur)
        ) {
          node.nextIdxIfFalse++;
        }

        return node;
      });

      nodes.splice(action.atIdx, 0, newNode);

      return nodes;
    }

    case NodeActions.DELETE: {
      for (const ifNode of Object.entries(ifNodes)) {
        const nodeIdx = parseInt(ifNode[0]);
        if (nodeIdx <= action.atIdx || ifNode[1][1] - 1 !== 0) continue;
        toast(
          'Cannot delete this node because if node has to have a predecessor.',
          { type: 'error' }
        );
        return nodes;
      }

      const nodeToBeDeleted = nodes[action.atIdx];
      nodes = nodes.map((node, idx, array) => {
        const prevNode = array[idx - 1];
        if (idx < action.atIdx) return node;

        if (prevNode === nodeToBeDeleted) {
          node.y = nodeToBeDeleted.y;
        } else {
          node.y = prevNode.y + prevNode.height + 50;
        }

        if (node.nextIdx) node.nextIdx--;
        if (node.nextIdxIfTrue) node.nextIdxIfTrue--;
        if (node.nextIdxIfFalse) {
          node.nextIdxIfFalse--;
        }

        return node;
      });

      nodes.splice(action.atIdx, 1);
      return nodes;
    }

    default:
      throw new Error(`Unhandled reducer action: ${action.type}`);
  }
}
