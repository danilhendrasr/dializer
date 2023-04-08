import { Token } from './expression-interpreter';

export enum TokenType {
  IDENTIFIER = 'identifier',
  STRING = 'string',
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
}

export class Expr {
  public evaluate(): unknown {
    throw new Error("Method 'evaluate' needs to be implemented.");
  }
}

export class Literal extends Expr {
  constructor(public value: unknown, public type: TokenType) {
    super();
  }

  public override evaluate() {
    return this.value;
  }
}

export class Unary extends Expr {
  constructor(public operator: Token, public right: Expr) {
    super();
  }

  public override evaluate() {
    const rightExpr = this.right.evaluate();

    switch (this.operator.type) {
      case TokenType.NOT:
        return !rightExpr;
      case TokenType.MINUS:
        return -parseInt(rightExpr as string);
      default:
        throw new Error('Cannot evaluate unary expression.');
    }
  }
}

export class Binary extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }

  public override evaluate() {
    const leftExpr = this.left.evaluate();
    const rightExpr = this.right.evaluate();

    switch (this.operator.type) {
      case TokenType.AND:
        return leftExpr && rightExpr;
      case TokenType.OR:
        return leftExpr || rightExpr;
      case TokenType.MATCH:
        // Hook into the environment here
        break;
      case TokenType.EQUALS:
        return leftExpr === rightExpr;
      case TokenType.NOT_EQUALS:
        return leftExpr !== rightExpr;
      case TokenType.GREATER_THAN:
        return (leftExpr as number) > (rightExpr as number);
      case TokenType.GREATER_THAN_OR_EQUAL:
        return (leftExpr as number) >= (rightExpr as number);
      case TokenType.LESS_THAN:
        return (leftExpr as number) < (rightExpr as number);
      case TokenType.LESS_THAN_OR_EQUAL:
        return (leftExpr as number) <= (rightExpr as number);
      case TokenType.PLUS:
        return (leftExpr as number) + (rightExpr as number);
      case TokenType.MINUS:
        return (leftExpr as number) - (rightExpr as number);
      case TokenType.DIVIDE:
        return (leftExpr as number) / (rightExpr as number);
      case TokenType.MULTIPLY:
        return (leftExpr as number) * (rightExpr as number);
      default:
        throw new Error('Cannot evaluate binary expression.');
    }
  }
}

export class Grouping extends Expr {
  constructor(public expr: Expr) {
    super();
  }

  public override evaluate() {
    return this.expr.evaluate();
  }
}
