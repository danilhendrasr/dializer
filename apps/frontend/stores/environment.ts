import { useStore } from 'zustand';
import createStore from 'zustand/vanilla';

export type EnvironmentState = {
  variables: Record<string, unknown>;
};

export const envStore = createStore<EnvironmentState>()((set, get) => ({
  variables: {},
}));

export function useEnvStore(): EnvironmentState;

export function useEnvStore<T>(
  selector: (state: EnvironmentState) => T,
  equals?: (a: T, b: T) => boolean
): T;

export function useEnvStore<T>(
  selector?: (state: EnvironmentState) => T,
  equals?: (a: T, b: T) => boolean
) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return useStore(envStore, selector!, equals);
}
