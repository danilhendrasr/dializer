import { Token } from './expression-interpreter';

export enum TokenType {
  IDENTIFIER = 'identifier',
  INTEGER = 'integer',
  PLUS = 'plus',
  MINUS = 'minus',
  MULTIPLY = 'multiply',
  DIVIDE = 'divide',
  MODULO = 'modulo',
  MATCH = 'match',
  EQUALS = 'equals',
  NOT_EQUALS = 'not equals',
  GREATER_THAN = 'greater than',
  GREATER_THAN_OR_EQUAL = 'greater than or equal',
  LESS_THAN = 'less than',
  LESS_THAN_OR_EQUAL = 'less than or equal',
  AND = 'and',
  OR = 'or',
  NOT = 'not',
  OPEN_PARENTHESIS = 'open paren',
  CLOSE_PARENTHESIS = 'close paren',
  TRUE = 'true',
  FALSE = 'false',
  EOF = 'eof',
}

export class Expr {}

export class Literal extends Expr {
  constructor(public value: unknown) {
    super();
  }
}

export class Unary extends Expr {
  constructor(public operator: Token, public right: Expr) {
    super();
  }
}

export class Binary extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }
}

export class Grouping extends Expr {
  constructor(public expr: Expr) {
    super();
  }
}
