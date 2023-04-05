import { TokenType } from './types';

/**
 * Class to hold a token data, which is its type, its text, and its literal value.
 */
class Token {
  constructor(
    private type: TokenType,
    // The string of the token
    private text: string,
    // The string that's already processed.
    // For example, if a token is integer of value 5, its text is "5"
    // while its literal is 5 (the number).
    private literal: unknown
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
          this.addToken(TokenType.EQUALS);
          this.currentPosition++;
        } else {
          this.addToken(TokenType.MATCH);
        }
        break;
      case '!':
        if (this.code[this.currentPosition] === '=') {
          this.addToken(TokenType.NOT_EQUALS);
          this.currentPosition++;
        } else {
          this.addToken(TokenType.NOT);
        }
        break;
      case '>':
        if (this.code[this.currentPosition] === '=') {
          this.addToken(TokenType.GREATER_THAN_OR_EQUAL);
          this.currentPosition++;
        } else {
          this.addToken(TokenType.GREATER_THAN);
        }
        break;
      case '<':
        if (this.code[this.currentPosition] === '=') {
          this.addToken(TokenType.LESS_THAN_OR_EQUAL);
          this.currentPosition++;
        } else {
          this.addToken(TokenType.LESS_THAN);
        }
        break;
      case '&':
        if (this.code[this.currentPosition] === '&') {
          this.addToken(TokenType.AND);
          this.currentPosition++;
        } else {
          throw new Error("Unexpected character, expecting a '&'.");
        }
        break;
      case '|':
        if (this.code[this.currentPosition] === '|') {
          this.addToken(TokenType.OR);
          this.currentPosition++;
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
      case ' ':
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
    const char = this.code.charAt(this.currentPosition);
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
