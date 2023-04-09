import { ExpressionInterpreter } from '@dializer/expression-interpreter';
import { createContext } from 'react';

export const InterpreterContext = createContext<ExpressionInterpreter | null>(
  null
);
