/**
 * A decorator for component properties whose values derived from global state
 * Usage example:
 *
 * ```ts
 * class MyComponent {
 *  \@state(s => s.items)
 *   data: Item[]
 * }
 * ```
 */
export declare function fromStore<T, K = unknown>(getValue: (state: T) => K): PropertyDecorator;
//# sourceMappingURL=state-decorator.d.ts.map