export enum NodeTypes {
  START = 'start',
  END = 'end',
  INPUT = 'input',
  OUTPUT = 'output',
  PROCESS = 'process',
  IF = 'if',
}

export interface WorkspaceEntity {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
