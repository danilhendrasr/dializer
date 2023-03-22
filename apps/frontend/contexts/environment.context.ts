import React, { createContext, useContext } from 'react';

type EnvironmentContextValue = {
  environment: Record<string, number> | undefined;
  setEnvironment: React.Dispatch<any>;
};

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export const EnvironmentContextProvider = EnvironmentContext.Provider;

export function useEnvironmentContext() {
  const environment = useContext(EnvironmentContext);
  if (environment === undefined) {
    throw new Error('Cannot use context outside of a provider.');
  }

  return environment;
}
