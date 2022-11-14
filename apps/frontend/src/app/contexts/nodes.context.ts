import React, { createContext } from 'react';
import { FlowChartNode } from '../types';

type NodesContextValue = {
  nodes: FlowChartNode[];
  setNodes: React.Dispatch<React.SetStateAction<FlowChartNode[]>>;
};

export const NodesContext = createContext<NodesContextValue | null>(null);
