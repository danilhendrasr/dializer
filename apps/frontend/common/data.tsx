import { FlowChartNode, NodeTypes } from './types';

const DEFAULT_NODE_WIDTH = 100;

export const INITIAL_NODES: FlowChartNode[] = [
  {
    id: '1',
    type: NodeTypes.START,
    x: window.innerWidth / 3 - 50,
    y: 50,
    width: DEFAULT_NODE_WIDTH,
    height: 40,
    active: false,
    nextIdx: 1,
  },
  {
    id: '2',
    type: NodeTypes.PROCESS,
    x: window.innerWidth / 3 - 50,
    y: 150,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 2,
    content: 'testing = 3',
  },
  {
    id: '3',
    type: NodeTypes.PROCESS,
    x: window.innerWidth / 3 - 50,
    y: 250,
    width: DEFAULT_NODE_WIDTH,
    height: 50,
    active: false,
    nextIdx: 3,
    content: 'testing++',
  },
  {
    id: '4',
    type: NodeTypes.IF,
    x: window.innerWidth / 3 - 50,
    y: 350,
    width: DEFAULT_NODE_WIDTH,
    height: 70,
    active: false,
    nextIdxIfTrue: 4,
    nextIdxIfFalse: 2,
    content: 'testing == 5',
  },
  {
    id: '5',
    type: NodeTypes.END,
    x: window.innerWidth / 3 - 50,
    y: 450,
    width: DEFAULT_NODE_WIDTH,
    height: 40,
    active: false,
  },
];
