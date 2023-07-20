import { NodeTypes } from '@dializer/types';

export enum EnvironmentActions {
  ADD_NEW = 'add_new',
  INCREMENT = 'increment',
  DECREMENT = 'decrement',
}

export enum NodeActions {
  ADD_NEW_AFTER = 'add_new_after',
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  CHANGE_CONTENT = 'change_content',
  CONVERT = 'convert',
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

  /**
   * Next node's ID.
   * This property is also used for branching nodes and looping nodes to refer
   * to the next node if true.
   */
  next?: string;

  /**
   * Next node's ID if false.
   * Used by branching and looping nodes to refer to the next node that should be visited
   * if the expression in the node evaluates to false.
   */
  nextIfFalse?: string;

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

export enum HTTP_METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
