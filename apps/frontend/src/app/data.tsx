import { FlowChartNode, NodeTypes } from './types';

const DEFAULT_NODE_WIDTH = 100;

export const INITIAL_NODES: FlowChartNode[] = [
  {
    type: NodeTypes.START,
    x: window.innerWidth / 3 - 50,
    y: 50,
    width: DEFAULT_NODE_WIDTH,
    height: 40,
    active: false,
    nextIdx: 1,
  },
  {
    type: NodeTypes.INPUT,
    x: window.innerWidth / 3 - 50,
    y: 150,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 2,
  },
  {
    type: NodeTypes.OUTPUT,
    x: window.innerWidth / 3 - 50,
    y: 250,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 3,
  },
  {
    type: NodeTypes.PROCESS,
    x: window.innerWidth / 3 - 50,
    y: 350,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 4,
  },
  {
    type: NodeTypes.IF,
    x: window.innerWidth / 3 - 50,
    y: 500,
    width: DEFAULT_NODE_WIDTH,
    height: 70,
    active: false,
    nextIdxIfTrue: 5,
    nextIdxIfFalse: 3,
  },
  {
    type: NodeTypes.END,
    x: window.innerWidth / 3 - 50,
    y: 600,
    width: DEFAULT_NODE_WIDTH,
    height: 40,
    active: false,
  },
];
