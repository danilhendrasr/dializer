export enum NodeTypes {
  START = 'start',
  END = 'end',
  INPUT = 'input',
  OUTPUT = 'output',
  PROCESS = 'process',
  IF = 'if',
}

export type WorkspaceEntity = {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserEntity = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};
