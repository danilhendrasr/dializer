import { FlowChartNode, NodeTypes } from './types';

const DEFAULT_NODE_WIDTH = 100;

export const INITIAL_NODES: FlowChartNode[] = [
  {
    type: NodeTypes.START,
    x: 100,
    y: 100,
    width: DEFAULT_NODE_WIDTH,
    height: 40,
    active: false,
    nextIdx: 1,
  },
  {
    type: NodeTypes.INPUT,
    x: 100,
    y: 200,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 2,
  },
  {
    type: NodeTypes.OUTPUT,
    x: 100,
    y: 300,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 3,
  },
  {
    type: NodeTypes.PROCESS,
    x: 100,
    y: 400,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 4,
  },
  {
    type: NodeTypes.IF,
    x: 100,
    y: 500,
    width: DEFAULT_NODE_WIDTH,
    height: 70,
    active: false,
    nextIdxIfTrue: 5,
    nextIdxIfFalse: 3,
  },
  {
    type: NodeTypes.END,
    x: 100,
    y: 600,
    width: DEFAULT_NODE_WIDTH,
    height: 40,
    active: false,
  },
];
