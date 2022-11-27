import { EnvironmentActions } from '../common/types';

type ReducerActionObject = {
  type: EnvironmentActions;
  target: string;
  value?: number;
};

export function environmentReducer(
  state: Record<string, number>,
  action: ReducerActionObject
) {
  const curState = { ...state };
  switch (action.type) {
    case EnvironmentActions.ADD_NEW: {
      curState[action.target] = action.value;
      return curState;
    }

    case EnvironmentActions.INCREMENT: {
      curState[action.target] += 1;
      return curState;
    }

    case EnvironmentActions.DECREMENT: {
      curState[action.target] += 1;
      return curState;
    }
  }
}
