import { StoreApi } from 'zustand';

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

export class Stmt {
  public evaluate(): unknown {
    throw new Error("Method 'evaluate' needs to be implemented.");
  }
}

export class Assignment extends Stmt {
  constructor(
    public identifier: Token,
    public value: Expr,
    private envStore: StoreApi<{ variables: Record<string, unknown> }>
  ) {
    super();
  }

  public override evaluate() {
    const value = this.value.evaluate();

    this.envStore.setState({
      variables: {
        ...this.envStore.getState().variables,
        [this.identifier.text]: value,
      },
    });
  }
}

export class Expr extends Stmt {}

export class Literal extends Expr {
  constructor(
    public value: unknown,
    public type: TokenType,
    private envStore?: StoreApi<{ variables: Record<string, unknown> }>
  ) {
    super();
  }

  public override evaluate() {
    if (this.type === TokenType.IDENTIFIER && this.envStore) {
      const val = this.envStore.getState().variables[this.value as string];
      if (val === undefined) {
        throw new Error(
          `Variable with the name "${this.value}" cannot be found.`
        );
      }

      return val;
    }

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

/**
 * Class to hold a token data, which is its type, its text, and its literal value.
 */
export class Token {
  constructor(
    public type: TokenType,
    // The string of the token
    public text: string,
    // The string that's already processed.
    // For example, if a token is integer of value 5, its text is "5"
    // while its literal is 5 (the number).
    public literal: unknown
  ) {}
}
