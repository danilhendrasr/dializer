export interface FlowChartNode {
  x: number;
  y: number;
  active: boolean;

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
}
