export enum NodeTypes {
  START = 'start',
  END = 'end',
  INPUT = 'input',
  OUTPUT = 'output',
  PROCESS = 'process',
  LOOP = 'loop',
  BRANCHING = 'branching',
}

export interface WorkspaceEntity {
  id: string;
  title: string;
  description?: string;
  visibility: WorkspaceVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEntity {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum WorkspaceVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export type ApiErrorResponse = {
  error: string;
  message: string;
  statusCode: number;
};
