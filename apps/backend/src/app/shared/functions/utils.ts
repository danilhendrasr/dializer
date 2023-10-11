/**
 * Function to capitalize the first letter of a string.
 *
 * Usage:
 * ```typescript
 * const str = capitalize("testing");
 * // Test
 * expect(str).toEqual("Testing");
 * ```
 */
export function capitalize(str: string): string {
  return str[0].toLocaleUpperCase() + str.slice(1);
}
