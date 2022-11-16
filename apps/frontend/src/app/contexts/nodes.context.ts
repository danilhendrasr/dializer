import React, { createContext } from 'react';
import { NodesReducerActionObject } from '../reducers/nodes.reducer';
import { FlowChartNode } from '../types';

type NodesContextValue = {
  nodes: FlowChartNode[];
  nodesDispatch: React.Dispatch<NodesReducerActionObject>;
};

export const NodesContext = createContext<NodesContextValue | null>(null);
