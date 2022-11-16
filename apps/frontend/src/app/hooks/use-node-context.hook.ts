import { useContext } from 'react';
import { NodesContext } from '../contexts/nodes.context';

export const useNodesContext = () => {
  const nodesContext = useContext(NodesContext);
  if (nodesContext === undefined) {
    throw new Error(
      'Cannot use nodes context outside of NodesContext provider.'
    );
  }

  return nodesContext;
};
