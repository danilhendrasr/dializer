import React, { createContext, useContext } from 'react';
import { Coordinate, NodeTypes } from '../types';

type AppStateContext = {
  newVarPopover: {
    position: Coordinate | undefined;
    setNewVarPopover: React.Dispatch<
      React.SetStateAction<(Coordinate & { callerIdx: number }) | undefined>
    >;
  };
  contextMenu: {
    position: Coordinate | undefined;
    setContextMenu: React.Dispatch<
      React.SetStateAction<
        (Coordinate & { callerIdx: number; callerType: NodeTypes }) | undefined
      >
    >;
  };
};

const AppStateContext = createContext<AppStateContext | null>(null);

export const AppStateProvider = AppStateContext.Provider;

export function useAppState() {
  const appStates = useContext(AppStateContext);
  if (appStates === undefined) {
    throw new Error('Cannot use context outside of a provider.');
  }

  return appStates;
}
