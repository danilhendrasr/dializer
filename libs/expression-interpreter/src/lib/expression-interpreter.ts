import { TokenType } from './types';
import { Expr, Binary, Unary, Grouping, Literal } from './types';

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

/** Class to tokenize a string input */
export class Tokenizer {
  private tokenStartPosition = 0;
  private currentPosition = 0;

  private tokens: Token[] = [];

  // Reserved keywords and their token type
  private keywords: Record<string, TokenType> = {
    true: TokenType.TRUE,
    false: TokenType.FALSE,
  };

  constructor(private code: string) {}

  /** Generate array of tokens from the input */
  public tokenize(): Token[] {
    while (!this.isPointerAtEnd()) {
      this.tokenStartPosition = this.currentPosition;
      this.scanToken();
    }

    return this.tokens;
  }

  /**
   *  "Scan token" means see if the character is a valid token/part of a valid token,
   *  if it does, process the whole token and put it in the tokens array.
   */
  private scanToken() {
    const char = this.getCurCharAndAdvance();

    switch (char) {
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '*':
        this.addToken(TokenType.MULTIPLY);
        break;
      case '%':
        this.addToken(TokenType.MODULO);
        break;
      case '/':
        this.addToken(TokenType.DIVIDE);
        break;
      case '=':
        if (this.code[this.currentPosition] === '=') {
          this.currentPosition++;
          this.addToken(TokenType.EQUALS);
        } else {
          this.addToken(TokenType.MATCH);
        }
        break;
      case '!':
        if (this.code[this.currentPosition] === '=') {
          this.currentPosition++;
          this.addToken(TokenType.NOT_EQUALS);
        } else {
          this.addToken(TokenType.NOT);
        }
        break;
      case '>':
        if (this.code[this.currentPosition] === '=') {
          this.currentPosition++;
          this.addToken(TokenType.GREATER_THAN_OR_EQUAL);
        } else {
          this.addToken(TokenType.GREATER_THAN);
        }
        break;
      case '<':
        if (this.code[this.currentPosition] === '=') {
          this.currentPosition++;
          this.addToken(TokenType.LESS_THAN_OR_EQUAL);
        } else {
          this.addToken(TokenType.LESS_THAN);
        }
        break;
      case '&':
        if (this.code[this.currentPosition] === '&') {
          this.currentPosition++;
          this.addToken(TokenType.AND);
        } else {
          throw new Error("Unexpected character, expecting a '&'.");
        }
        break;
      case '|':
        if (this.code[this.currentPosition] === '|') {
          this.currentPosition++;
          this.addToken(TokenType.OR);
        } else {
          throw new Error("Unexpected character, expecting a '|'.");
        }
        break;
      case '(':
        this.addToken(TokenType.OPEN_PARENTHESIS);
        break;
      case ')':
        this.addToken(TokenType.CLOSE_PARENTHESIS);
        break;
      // Ignore whitespaces
      case ' ':
      case '\r':
      case '\t':
        break;
      case '"':
        this.scanWholeString();
        break;
      default:
        if (this.isDigit(char)) {
          this.scanWholeNumber();
        } else if (this.isAlphaNumeric(char)) {
          this.scanWholeIdentifier();
        } else {
          throw new Error('Unexpected character.');
        }
    }
  }

  /** Get the current character and advance the current pointer. */
  private getCurCharAndAdvance(): string {
    const char = this.code[this.currentPosition];
    this.currentPosition++;
    return char;
  }

  /** See if the current pointer is at the end of the code input. */
  private isPointerAtEnd(): boolean {
    return this.currentPosition >= this.code.length;
  }

  /** Provided with a character, determine if it's a digit or not. */
  private isDigit(char: string): boolean {
    if (isNaN(parseInt(char))) {
      return false;
    }

    return true;
  }

  /** Provided with a character, determine if it's an alphanumeric or not. */
  private isAlphaNumeric(char: string): boolean {
    // We have to return early if string is null or "" (empty string) because "" is detected by the regex.
    if (!char) return false;
    return Boolean(char.match(/^[a-z0-9]+$/i));
  }

  /**
   * Advance the current pointer until a non-digit character is encountered
   * and then add the token.
   */
  private scanWholeNumber() {
    while (this.isDigit(this.code[this.currentPosition])) {
      this.getCurCharAndAdvance();
    }

    this.addToken(TokenType.INTEGER, parseInt(this.getCurLexeme()));
  }

  /**
   * Advance the current pointer until a corresponding " is encountered.
   */
  private scanWholeString() {
    while (this.code[this.currentPosition] !== '"') {
      this.getCurCharAndAdvance();
    }

    // Consume the closing "
    this.getCurCharAndAdvance();

    this.addToken(
      TokenType.STRING,
      this.code.slice(this.tokenStartPosition + 1, this.currentPosition - 1)
    );
  }

  /**
   * Advance the current pointer until a non-alphanumeric character is encountered
   * and then add the token.
   */
  private scanWholeIdentifier() {
    while (this.isAlphaNumeric(this.code[this.currentPosition])) {
      this.getCurCharAndAdvance();
    }

    const text = this.code.slice(this.tokenStartPosition, this.currentPosition);
    if (text in this.keywords) {
      this.addToken(this.keywords[text], text === 'true');
      return;
    }

    this.addToken(TokenType.IDENTIFIER);
  }

  /** Get the text between the start pointer and current pointer. */
  private getCurLexeme() {
    return this.code.slice(this.tokenStartPosition, this.currentPosition);
  }

  /** Add a new token to the tokens array with its text from start to current pointer. */
  private addToken(tokenType: TokenType, literal: unknown = null) {
    const text = this.getCurLexeme();
    this.tokens.push(new Token(tokenType, text, literal));
  }
}

/** Class to parse a string of tokens. */
export class Parser {
  private currentPosition = 0;

  constructor(private tokens: Token[]) {}

  public parse() {
    return this.expression();
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
