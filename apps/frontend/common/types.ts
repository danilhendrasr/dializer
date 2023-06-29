export enum EnvironmentActions {
  ADD_NEW = 'add_new',
  INCREMENT = 'increment',
  DECREMENT = 'decrement',
}
export enum NodeActions {
  ADD_NEW = 'add_new',
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  CHANGE_CONTENT = 'change_content',
}

export enum NodeTypes {
  START = 'start',
  END = 'end',
  INPUT = 'input',
  OUTPUT = 'output',
  PROCESS = 'process',
  IF = 'if',
}

export type Coordinate = { x: number; y: number };

export interface FlowChartNode {
  id: string;
  type: NodeTypes;
  x: number;
  y: number;
  active: boolean;

  width: number;
  height: number;

  content?: string;
  // If node is of non-branching type, it refers to the next
  // node through this proeprty.
  nextIdx?: number;

  // If node is of branching type, it refers to the next
  // node through this proeprty.
  nextIdxIfTrue?: number;
  // If node is of branching type, it refers to the next
  // node through this proeprty.
  nextIdxIfFalse?: number;

  workspaceId: string;
}

export type ConditionalNodeNextNodes = {
  true: FlowChartNode;
  false: FlowChartNode;
};

export enum LocalStorageItems {
  ACCESS_TOKEN = 'accessToken',
  DASHBOARD_TOUR_PASSED = 'dashboardTourPassed',
  FIRST_WORKSPACE_TOUR_PASSED = 'firstWorkspaceTourPassed',
}

export enum AnimationState {
  Playing = 'Playing',
  Stopped = 'Stopped',
  TemporaryStopped = 'TemporaryStopped',
}
