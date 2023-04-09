import { Parser } from './lib/parser';
import { Tokenizer } from './lib/tokenizer';
import { StoreApi } from 'zustand';

export class ExpressionInterpreter {
  constructor(
    private envStore: StoreApi<{ variables: Record<string, unknown> }>
  ) {}

  /**
   * Interpret an expression. Returns the evaluation result if succeeded, throws an Error if fails.
   */
  public interpret(expression: string) {
    const ast = this.parse(expression);
    const result = ast.evaluate();
    return result;
  }

  /**
   * Parse the given expression, see if it's syntatically valid.
   * Returns the AST if succeeded, throws an Error if fails.
   */
  public parse(expression: string) {
    const tokens = new Tokenizer(expression).tokenize();
    const ast = new Parser(tokens, this.envStore).parse();
    return ast;
  }
}
