interface JestMatcher {
  toBe(expected: unknown): void;
  toBeNull(): void;
  toEqual(expected: unknown): void;
  toMatchObject(expected: unknown): void;
}

declare function describe(name: string, callback: () => void): void;
declare function it(name: string, callback: () => void): void;
declare const expect: {
  (value: unknown): JestMatcher;
  objectContaining(value: Record<string, unknown>): unknown;
};
