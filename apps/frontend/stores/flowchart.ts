import { toast } from 'react-toastify';
import {
  AnimationState,
  FlowChartNode,
  LocalStorageItems,
  NodeActions,
} from '../common/types';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { envStore } from './environment';
import { NodeTypes } from '@dializer/types';

type NodesState = {
  viewOnlyMode: boolean;
  animationState: AnimationState;
  nodes: FlowChartNode[] | null;
  computed: {
    emptyNodeExists: boolean;
    flowchartOnlyHasTerminalNodes: boolean;
  };
  unsavedChangesExist: boolean;
  toggleViewOnlyMode: () => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  stopAnimationTemporarily: () => void;
  nullifyNodes: () => void;
  resetNodes: () => void;
  fetchNodes: (workspaceId: string) => void;
  saveNodes: (workspaceId: string) => void;
  dispatchNodeAction: (action: NodesReducerAction) => void;
};

export const useFlowchartStore = create<NodesState>()((set, get) => ({
  viewOnlyMode: true,
  toggleViewOnlyMode: () => set({ viewOnlyMode: !get().viewOnlyMode }),
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
    set({ nodes: nodes });
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
    try {
      set((state) => ({ nodes: nodesReducer(state.nodes, action) }));
      const targetNode = get().nodes.find(
        (node) => node.id === action.targetId
      );

      // Pause the animation when input node is activated
      if (
        action.type === NodeActions.ACTIVATE &&
        targetNode.type === NodeTypes.INPUT
      ) {
        set({ animationState: AnimationState.TemporaryStopped });
      }

      // NodeActions other than active and deactive will always modify the
      // flowchart's shape
      if (
        action.type !== NodeActions.ACTIVATE &&
        action.type !== NodeActions.DEACTIVATE
      ) {
        set({ unsavedChangesExist: true });
      }
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  },
}));

export type NodesReducerAction = {
  /**
   * The type of the action to be performed.
   */
  type: NodeActions;

  /**
   * The target node's ID.
   */
  targetId: string;

  /**
   * Required if type == NodeActions.ADD_NEW or type == NodeActions.TURN_INTO
   */
  nodeType?: NodeTypes;

  /**
   * Required if action type is NodeActions.CHANGE_CONTENT
   */
  content?: string;
};

export function nodesReducer(
  state: FlowChartNode[],
  action: NodesReducerAction
) {
  const nodes = [...state];

  switch (action.type) {
    case NodeActions.ACTIVATE: {
      nodes.find((node) => node.id === action.targetId).active = true;
      return nodes;
    }

    case NodeActions.DEACTIVATE: {
      nodes.find((node) => node.id === action.targetId).active = false;
      return nodes;
    }

    case NodeActions.CHANGE_CONTENT: {
      if (action.content === undefined) {
        throw new Error(
          'Content is required when changing the content of a node.'
        );
      }

      nodes.find((node) => node.id === action.targetId).content =
        action.content;
      return nodes;
    }

    case NodeActions.ADD_NEW_AFTER: {
      const targetNode = nodes.find((node) => node.id === action.targetId);

      if (targetNode.type === NodeTypes.START) {
        const isNewNodeConditional =
          action.nodeType === NodeTypes.LOOP ||
          action.nodeType === NodeTypes.BRANCHING;

        if (isNewNodeConditional) {
          toast('Cannot insert if node after start node.', { type: 'error' });
          return nodes;
        }
      }

      const newNodes: FlowChartNode[] = [];

      const newNodeIsLoop = action.nodeType === NodeTypes.LOOP;
      const newNodeIsBranching = action.nodeType === NodeTypes.BRANCHING;

      const newNode: FlowChartNode = {
        id: uuidv4(),
        type: action.nodeType,
        x: targetNode.x,
        y: targetNode.y + targetNode.height + 50,
        active: false,
        height: 100,
        width: 100,
        next: targetNode.next,
        nextIfFalse: newNodeIsLoop ? targetNode.id : undefined,
        workspaceId: nodes[0].workspaceId,
      };

      if (newNodeIsBranching) {
        const trueHandler: FlowChartNode = {
          id: uuidv4(),
          type: NodeTypes.PROCESS,
          x: newNode.x - 100,
          y: newNode.y + newNode.height + 50,
          active: false,
          height: 100,
          width: 100,
          next: newNode.next,
          workspaceId: nodes[0].workspaceId,
        };

        const falseHandler: FlowChartNode = {
          id: uuidv4(),
          type: NodeTypes.PROCESS,
          x: newNode.x + 100,
          y: newNode.y + newNode.height + 50,
          active: false,
          height: 100,
          width: 100,
          next: newNode.next,
          workspaceId: nodes[0].workspaceId,
        };

        newNode.next = trueHandler.id;
        newNode.nextIfFalse = falseHandler.id;
        newNodes.push(trueHandler);
        newNodes.push(falseHandler);
      }

      targetNode.next = newNode.id;
      newNodes.unshift(newNode);
      nodes.push(...newNodes);

      return readjustNodesPositions(nodes);
    }

    case NodeActions.DELETE: {
      // Nodes that cannot be deleted:
      // 1. A node after the start node that handles the false path of a conditional
      // 2.

      const nodesToBeDeleted: FlowChartNode[] = [];

      const targetNode = nodes.find((node) => node.id === action.targetId);
      const prevNodeOfTarget = nodes.find(
        (n) =>
          n.next === targetNode.id ||
          (n.type === NodeTypes.BRANCHING && n.nextIfFalse === targetNode.id)
      );

      if (prevNodeOfTarget.type === NodeTypes.BRANCHING) {
        throw new Error(
          'Cannot delete handler of a branching node, convert this node instead.'
        );
      }

      const isTargetHandlingFalsePath = nodes.find(
        (node) => node.nextIfFalse === targetNode.id
      );

      if (
        isTargetHandlingFalsePath &&
        isTargetHandlingFalsePath.type === NodeTypes.LOOP
      ) {
        const loopNodeThatConnectsToTarget = isTargetHandlingFalsePath;

        if (
          // If x is directly connected to the loop node that references it and x's previous
          // node is the start node, we cannot delete it.
          targetNode.next === loopNodeThatConnectsToTarget.id &&
          prevNodeOfTarget.type === NodeTypes.START
        ) {
          throw new Error(
            'Cannot delete this node because branching node must not have any connection with the start node, delete the loop node first.'
          );
        } else {
          // If x has a previous node and it's not the start node, we move the loop's
          // false path to x's previous node.
          if (prevNodeOfTarget) {
            loopNodeThatConnectsToTarget.nextIfFalse = prevNodeOfTarget.id;
          } else {
            // Otherwise we move the false path to x's next node.
            loopNodeThatConnectsToTarget.nextIfFalse = targetNode.next;
          }
        }
      }

      if (targetNode.type === NodeTypes.BRANCHING) {
        try {
          const { deletedNodes, convergingNode } = deleteNodesAfterIf(
            nodes,
            targetNode
          );

          deletedNodes.unshift(targetNode);
          prevNodeOfTarget.next = convergingNode.id;
          nodesToBeDeleted.push(...deletedNodes);
        } catch (e) {
          throw new Error(
            "This branching node's branches contains too many branching node, please delete any branching nodes in the branches of this node first."
          );
        }
      } else {
        prevNodeOfTarget.next = targetNode.next;
        nodesToBeDeleted.push(targetNode);
      }

      for (const node of nodesToBeDeleted) {
        nodes.splice(
          nodes.findIndex((n) => n.id === node.id),
          1
        );
      }

      return readjustNodesPositions(nodes);
    }

    case NodeActions.CONVERT:
      {
        const targetNode = nodes.find((node) => node.id === action.targetId);
        if (
          targetNode.type !== NodeTypes.BRANCHING &&
          action.nodeType !== NodeTypes.BRANCHING
        ) {
          targetNode.nextIfFalse = undefined;
          if (action.nodeType === NodeTypes.LOOP) {
            const prevNode = nodes.find(
              (n) =>
                n.next === targetNode.id ||
                (n.type === NodeTypes.BRANCHING &&
                  n.nextIfFalse === targetNode.id)
            );

            if (prevNode.type === NodeTypes.START) {
              throw new Error('Cannot insert loop node after start node.');
            }

            targetNode.nextIfFalse = prevNode.id;
          }

          targetNode.type = action.nodeType;
          targetNode.content = '';
          return nodes;
        }

        if (
          targetNode.type !== NodeTypes.BRANCHING &&
          action.nodeType === NodeTypes.BRANCHING
        ) {
          targetNode.type = action.nodeType;
          targetNode.content = '';
          const newNodes: FlowChartNode[] = [];

          const trueHandler: FlowChartNode = {
            id: uuidv4(),
            type: NodeTypes.PROCESS,
            x: targetNode.x - 100,
            y: targetNode.y + targetNode.height + 50,
            active: false,
            height: 100,
            width: 100,
            next: targetNode.next,
            workspaceId: nodes[0].workspaceId,
          };

          const falseHandler: FlowChartNode = {
            id: uuidv4(),
            type: NodeTypes.PROCESS,
            x: targetNode.x + 100,
            y: targetNode.y + targetNode.height + 50,
            active: false,
            height: 100,
            width: 100,
            next: targetNode.next,
            workspaceId: nodes[0].workspaceId,
          };

          targetNode.next = trueHandler.id;
          targetNode.nextIfFalse = falseHandler.id;
          newNodes.push(trueHandler);
          newNodes.push(falseHandler);
          nodes.push(...newNodes);

          return readjustNodesPositions(nodes);
        }

        if (action.nodeType !== NodeTypes.BRANCHING) {
          const prevNodeOfTarget = nodes.find((n) => n.next === targetNode.id);

          const isTargetHandlingFalsePath = nodes.find(
            (node) => node.nextIfFalse === targetNode.id
          );

          if (
            isTargetHandlingFalsePath &&
            isTargetHandlingFalsePath.type === NodeTypes.LOOP
          ) {
            const loopNodeThatConnectsToTarget = isTargetHandlingFalsePath;

            if (
              // If x is directly connected to the loop node that references it and x's previous
              // node is the start node, we cannot delete it.
              targetNode.next === loopNodeThatConnectsToTarget.id &&
              prevNodeOfTarget.type === NodeTypes.START
            ) {
              throw new Error(
                'Cannot delete this node because branching node must not have any connection with the start node, delete the loop node first.'
              );
            } else {
              // If x has a previous node and it's not the start node, we move the loop's
              // false path to x's previous node.
              if (prevNodeOfTarget) {
                loopNodeThatConnectsToTarget.nextIfFalse = prevNodeOfTarget.id;
              } else {
                // Otherwise we move the false path to x's next node.
                loopNodeThatConnectsToTarget.nextIfFalse = targetNode.next;
              }
            }
          }

          const convertToLoop = action.nodeType === NodeTypes.LOOP;
          const { deletedNodes, convergingNode } = deleteNodesAfterIf(
            nodes,
            targetNode
          );

          targetNode.content = '';
          targetNode.type = action.nodeType;
          targetNode.next = convergingNode.id;
          targetNode.nextIfFalse = convertToLoop
            ? prevNodeOfTarget.id
            : undefined;

          for (const node of deletedNodes) {
            nodes.splice(
              nodes.findIndex((n) => n.id === node.id),
              1
            );
          }

          return readjustNodesPositions(nodes);
        }
      }
      break;

    default:
      throw new Error(`Unhandled reducer action: ${action.type}`);
  }
}

/**
 * Function to be used to delete nodes after an if node
 */
function deleteNodesAfterIf(
  nodes: FlowChartNode[],
  targetNode: FlowChartNode
): { deletedNodes: FlowChartNode[]; convergingNode: FlowChartNode } {
  let convergingNode: FlowChartNode;
  let dump: FlowChartNode[] = [];
  const queue: FlowChartNode[] = [];
  queue.push(nodes.find((n) => n.id === targetNode.next));
  queue.push(nodes.find((n) => n.id === targetNode.nextIfFalse));

  while (queue.length > 0) {
    const head = queue.shift();

    if (head.type === NodeTypes.BRANCHING) {
      dump.push(head);
      const { deletedNodes, convergingNode: ifConvergingNode } =
        deleteNodesAfterIf(nodes, head);
      dump.push(...deletedNodes);

      const nodeAlreadyInQueue = queue.find(
        (n) => n.id === ifConvergingNode.id
      );
      if (nodeAlreadyInQueue) {
        convergingNode = nodeAlreadyInQueue;
        break;
      }

      queue.push(ifConvergingNode);
      continue;
    }

    dump.push(head);

    const nodeInDumpIdx = dump.findIndex((n) => n.id === head.next);
    const nodeAlreadyInDump = nodeInDumpIdx !== -1;
    if (nodeAlreadyInDump) {
      convergingNode = dump[nodeInDumpIdx];
      dump = dump.slice(0, nodeInDumpIdx);
      dump.push(head);
      break;
    }

    const nodeAlreadyInQueue = queue.find((n) => n.id === head.next);
    if (nodeAlreadyInQueue) {
      convergingNode = nodeAlreadyInQueue;
      break;
    }

    if (head.next) {
      queue.push(nodes.find((n) => n.id === head.next));
    }

    if (head.nextIfFalse) {
      queue.push(nodes.find((n) => n.id === head.nextIfFalse));
    }
  }

  return {
    deletedNodes: dump,
    convergingNode,
  };
}

function readjustNodesPositions(nodes: FlowChartNode[]): FlowChartNode[] {
  const queue = [nodes.find((n) => n.type === NodeTypes.START)];
  while (queue.length > 0) {
    const head = queue.shift();
    if (head.type === NodeTypes.START) {
      queue.push(nodes.find((n) => n.id === head.next));
      continue;
    }

    const precedingNodes = nodes.filter(
      (n) =>
        n.next === head.id ||
        (n.type === NodeTypes.BRANCHING && n.nextIfFalse === head.id)
    );

    if (precedingNodes.length === 1) {
      head.y = precedingNodes[0].y + precedingNodes[0].height + 50;
    } else {
      // The bottom-most node in the flowchart before current node
      let lowestNode = precedingNodes[0];
      precedingNodes.forEach((n) => {
        if (n.y > lowestNode.y) lowestNode = n;
      });

      head.y = lowestNode.y + lowestNode.height + 50;
    }

    if (head.next) {
      queue.push(nodes.find((n) => n.id === head.next));
    }

    if (head.type === NodeTypes.BRANCHING) {
      queue.push(nodes.find((n) => n.id === head.nextIfFalse));
    }
  }

  return nodes;
}
