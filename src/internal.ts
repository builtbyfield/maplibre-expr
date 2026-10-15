import type { Expr } from "./expr"

/** Builds an expression array, dropping trailing `undefined` arguments. */
export function op<T>(name: string, ...args: unknown[]): Expr<T> {
  let end = args.length
  while (end > 0 && args[end - 1] === undefined)
    end--
  return [name, ...args.slice(0, end)] as unknown as Expr<T>
}
