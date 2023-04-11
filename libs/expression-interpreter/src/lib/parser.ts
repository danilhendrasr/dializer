import { StoreApi } from 'zustand';
import { Assignment, Stmt, Token, TokenType } from './types';
import { Expr, Binary, Unary, Grouping, Literal } from './types';

/** Class to parse a string of tokens. */
export class Parser {
  private currentPosition = 0;

  constructor(
    private tokens: Token[],
    private envStore: StoreApi<{ variables: Record<string, unknown> }>
  ) {}

  public parse(): Stmt {
    if (
      this.curToken().type === TokenType.IDENTIFIER &&
      this.nextToken() &&
      this.nextToken().type === TokenType.MATCH
    ) {
      return this.assignmentStatement();
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

    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE)) {
      const operator = this.prevToken();
      const rightExpr = this.unary();

      if (expr instanceof Literal && rightExpr instanceof Literal) {
        if (
          expr.type !== TokenType.INTEGER ||
          rightExpr.type !== TokenType.INTEGER
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
