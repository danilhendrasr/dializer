import { StoreApi } from 'zustand';
import { Assignment, Stmt, Token, TokenType, UnaryStmt } from './types';
import { Expr, Binary, Unary, Grouping, Literal } from './types';

/** Class to parse a string of tokens. */
export class Parser {
  private currentPosition = 0;

  constructor(
    private tokens: Token[],
    private envStore: StoreApi<{ variables: Record<string, unknown> }>
  ) {}

  public parse(): Stmt {
    const isIdentifier = this.curToken().type === TokenType.IDENTIFIER;
    const isIncrement = this.curToken().type === TokenType.INCREMENT;
    const isDecrement = this.curToken().type === TokenType.DECREMENT;

    const matchIsNext =
      this.nextToken() && this.nextToken().type === TokenType.MATCH;

    const decrementIsNext =
      this.nextToken() && this.nextToken().type === TokenType.DECREMENT;

    const incrementIsNext =
      this.nextToken() && this.nextToken().type === TokenType.INCREMENT;

    const identifierIsNext =
      this.nextToken() && this.nextToken().type === TokenType.INCREMENT;

    const isVariableAssignment = isIdentifier && matchIsNext;
    const isPostIncrement = isIdentifier && incrementIsNext;
    const isPostDecrement = isIdentifier && decrementIsNext;
    const isPreIncrement = isIncrement && identifierIsNext;
    const isPreDecrement = isDecrement && identifierIsNext;

    if (isVariableAssignment) {
      return this.assignmentStatement();
    } else if (
      isPostIncrement ||
      isPostDecrement ||
      isPreIncrement ||
      isPreDecrement
    ) {
      return this.unaryStatement();
    }

    return this.expression();
  }

  private assignmentStatement(): Assignment {
    this.match(TokenType.IDENTIFIER);
    const identifier = this.prevToken();
    this.match(TokenType.MATCH);
    const value = this.expression();
    return new Assignment(identifier, value, this.envStore);
  }

  private unaryStatement(): UnaryStmt {
    if (this.match(TokenType.INCREMENT, TokenType.DECREMENT)) {
      const operator = this.prevToken();
      const states = this.envStore.getState();

      if (this.match(TokenType.IDENTIFIER)) {
        const identifier = this.prevToken();

        let newValue = (states.variables[identifier.text] as number) + 1;
        if (operator.type === TokenType.DECREMENT) {
          newValue = (states.variables[identifier.text] as number) - 1;
        }

        return new UnaryStmt(
          identifier,
          new Literal(newValue, TokenType.INTEGER),
          this.envStore
        );
      } else {
        throw new Error(
          'Can only do increment and decrement operations on a variable'
        );
      }
    } else {
      this.match(TokenType.IDENTIFIER);
      const identifier = this.prevToken();

      this.match(TokenType.DECREMENT, TokenType.INCREMENT);
      const operator = this.prevToken();

      const states = this.envStore.getState();
      let newValue = (states.variables[identifier.text] as number) + 1;
      if (operator.type === TokenType.DECREMENT) {
        newValue = (states.variables[identifier.text] as number) - 1;
      }

      return new UnaryStmt(
        identifier,
        new Literal(newValue, TokenType.INTEGER),
        this.envStore
      );
    }
  }

  private expression(): Expr {
    return this.equalityChaining();
  }

  private equalityChaining(): Expr {
    let expr = this.equality();

    while (this.match(TokenType.AND, TokenType.OR)) {
      const operator = this.prevToken();
      const rightExpr = this.equality();
      expr = new Binary(expr, operator, rightExpr);
    }

    return expr;
  }

  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.EQUALS, TokenType.NOT_EQUALS)) {
      const operator = this.prevToken();
      const rightExpr = this.comparison();
      expr = new Binary(expr, operator, rightExpr);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();

    const tokensToLookFor = [
      TokenType.GREATER_THAN,
      TokenType.GREATER_THAN_OR_EQUAL,
      TokenType.LESS_THAN,
      TokenType.LESS_THAN_OR_EQUAL,
    ];

    while (this.match(...tokensToLookFor)) {
      const operator = this.prevToken();
      const rightExpr = this.term();
      expr = new Binary(expr, operator, rightExpr);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.prevToken();
      const rightExpr = this.factor();
      expr = new Binary(expr, operator, rightExpr);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.prevToken();
      const rightExpr = this.unary();

      if (expr instanceof Literal && rightExpr instanceof Literal) {
        if (
          (expr.type !== TokenType.INTEGER &&
            expr.type !== TokenType.IDENTIFIER) ||
          (rightExpr.type !== TokenType.INTEGER &&
            expr.type !== TokenType.IDENTIFIER)
        ) {
          throw new Error('Can only do arithmetic operations on numbers.');
        }
      }

      expr = new Binary(expr, operator, rightExpr);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
      const operator = this.prevToken();
      const rightExpr = this.unary();

      if (
        operator.type === TokenType.MINUS &&
        rightExpr instanceof Literal &&
        rightExpr.type !== TokenType.INTEGER
      ) {
        throw new Error("Expecting a number after the '-' unary operator.");
      }

      return new Unary(operator, rightExpr);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) {
      return new Literal(false, TokenType.FALSE);
    }

    if (this.match(TokenType.TRUE)) {
      return new Literal(true, TokenType.TRUE);
    }

    if (this.match(TokenType.INTEGER)) {
      return new Literal(this.prevToken().literal as number, TokenType.INTEGER);
    }

    if (this.match(TokenType.STRING)) {
      return new Literal(this.prevToken().literal as string, TokenType.STRING);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Literal(
        this.prevToken().text,
        TokenType.IDENTIFIER,
        this.envStore
      );
    }

    if (this.match(TokenType.OPEN_PARENTHESIS)) {
      const expr = this.expression();

      if (this.curToken().type === TokenType.CLOSE_PARENTHESIS) {
        this.advancePointer();
      } else {
        throw new Error("Expecting ')' but not found.");
      }

      return new Grouping(expr);
    }

    throw new Error('Parsing error, expecting expression.');
  }

  private advancePointer() {
    const curToken = this.curToken();
    this.currentPosition++;
    return curToken;
  }

  /** See if current token matches with one of the given token types. */
  private match(...tokenTypes: TokenType[]) {
    for (const type of tokenTypes) {
      if (!this.isPointerAtEnd() && this.curToken().type === type) {
        this.advancePointer();
        return true;
      }
    }

    return false;
  }

  private isPointerAtEnd() {
    return this.currentPosition >= this.tokens.length;
  }

  /** See current token without advancing the pointer. */
  private curToken() {
    return this.tokens[this.currentPosition];
  }

  /** See the previous token without modifying the pointer. */
  private prevToken() {
    return this.tokens[this.currentPosition - 1];
  }

  /** See the next token without modifying the pointer. */
  private nextToken() {
    return this.tokens[this.currentPosition + 1];
  }
}
